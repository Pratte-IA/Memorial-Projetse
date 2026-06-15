import netlify from "@netlify/vite-plugin-tanstack-start";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

/** Dev SSR must load React as CJS from node_modules; production bundles server deps for Netlify. */
function ssrResolveForCommand(): Plugin {
  return {
    name: "ssr-resolve-for-command",
    config(_config, { command }) {
      if (command === "serve") {
        return;
      }

      return {
        ssr: {
          noExternal: true,
        },
        environments: {
          ssr: {
            resolve: {
              noExternal: true,
            },
          },
        },
      };
    },
  };
}

const RUNTIME_BARE_IMPORT_DENYLIST = [
  "h3-v2",
  "h3",
  "nitropack",
  "srvx",
  "unenv",
  "cookie-es",
  "radix3",
  "destr",
  "ufo",
  "ofetch",
];

const BARE_IMPORT_PATTERN = /from\s+["'](?!node:|\.)([^"']+)["']/g;

async function assertNoBareImportsInServerBundle(serverDir: string) {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join: joinPath } = await import("node:path");

  async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = joinPath(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walk(fullPath)));
      } else if (entry.name.endsWith(".js")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const offenders: string[] = [];
  for (const file of await walk(serverDir)) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(BARE_IMPORT_PATTERN)) {
      const specifier = match[1];
      if (RUNTIME_BARE_IMPORT_DENYLIST.some((pkg) => specifier === pkg || specifier.startsWith(pkg))) {
        offenders.push(`${file}: ${specifier}`);
      }
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `[patch-netlify-function-bundle] SSR bundle still has bare server imports:\n${offenders.join("\n")}`,
    );
  }
}

/**
 * Netlify's default function bundler (esbuild) re-bundles server.mjs and re-resolves
 * `@tanstack/router-core` from node_modules, causing runtime export mismatches.
 * Copy the Vite SSR output beside the wrapper, use a relative import, and set
 * nodeBundler/includedFiles so the pre-built bundle is deployed as-is.
 */
function patchNetlifyFunctionBundle(): Plugin {
  return {
    name: "patch-netlify-function-bundle",
    apply: "build",
    async closeBundle() {
      const root = process.cwd();
      const wrapperPath = join(root, ".netlify/v1/functions/server.mjs");
      const viteServerDir = join(root, "dist/server");
      const bundledServerDir = join(root, ".netlify/v1/functions/dist-server");

      if (!existsSync(wrapperPath) || !existsSync(viteServerDir)) {
        return;
      }

      await rm(bundledServerDir, { recursive: true, force: true });
      await cp(viteServerDir, bundledServerDir, { recursive: true });

      // Vite emits ESM (.js with export/import). Without a package scope, Node treats .js as CJS
      // inside Netlify Functions and throws "Unexpected token 'export'".
      await writeFile(
        join(bundledServerDir, "package.json"),
        `${JSON.stringify({ type: "module" }, null, 2)}\n`,
      );

      let content = await readFile(wrapperPath, "utf8");
      content = content.replace(
        /import serverEntrypoint from "[^"]+";/,
        'import serverEntrypoint from "./dist-server/server.js";',
      );

      content = content.replace(
        /export const config = \{\n(?:  includedFiles:[^\n]+\n)?(?:  nodeBundler:[^\n]+\n)?name:/,
        `export const config = {
  includedFiles: ["./dist-server/**"],
  nodeBundler: "none",
  name:`,
      );

      await writeFile(wrapperPath, content);

      await assertNoBareImportsInServerBundle(bundledServerDir);
    },
  };
}

export default defineConfig({
  nitro: false,
  plugins: [
    ...(process.argv.includes("build") ? [netlify()] : []),
    ssrResolveForCommand(),
    patchNetlifyFunctionBundle(),
  ],
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
  },
});
