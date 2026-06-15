import netlify from "@netlify/vite-plugin-tanstack-start";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

/**
 * The Netlify plugin writes server.mjs with a repo-relative import (../../../dist/server).
 * At Lambda runtime the handler lives at /var/task/server.mjs, so that path resolves to
 * /dist/server/server.js which does not exist. Copy the SSR bundle next to the wrapper and
 * point the import at ./dist-server/server.js with includedFiles for deployment packaging.
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

      let content = await readFile(wrapperPath, "utf8");
      content = content.replace(
        /import serverEntrypoint from "[^"]+";/,
        'import serverEntrypoint from "./dist-server/server.js";',
      );

      if (!content.includes("includedFiles")) {
        content = content.replace(
          /export const config = \{\nname:/,
          'export const config = {\n  includedFiles: ["./dist-server/**"],\n  name:',
        );
      }

      await writeFile(wrapperPath, content);
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
export default defineConfig({
  nitro: false,
  plugins: [netlify(), patchNetlifyFunctionBundle()],
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
