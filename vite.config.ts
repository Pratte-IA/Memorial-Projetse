import netlify from "@netlify/vite-plugin-tanstack-start";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

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

      await cp(viteServerDir, bundledServerDir, { recursive: true, force: true });

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
    },
  };
}

export default defineConfig({
  nitro: false,
  plugins: [netlify(), patchNetlifyFunctionBundle()],
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    environments: {
      ssr: {
        resolve: {
          // Ensure TanStack packages are bundled into dist/server on every platform (CI included).
          noExternal: [/@tanstack\/.*/],
        },
      },
    },
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
