import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "tsdown";
import pkg from "./package.json" with { type: "json" };

const banner = `
/**
 * Accordion v3.4.1
 * ${pkg.description}
 * https://github.com/michu2k/Accordion
 *
 * Copyright (c) ${pkg.author}
 * Published under ${pkg.license} License
 */
`.trim();

export default defineConfig([
  {
    entry: {
      index: "./src/accordion.ts"
    },
    platform: "node",
    format: "esm",
    target: "node20",
    clean: true,
    dts: true,
    outDir: "dist",
    minify: true,
    banner
  },
  {
    entry: {
      accordion: "./src/accordion.ts"
    },
    platform: "browser",
    format: "iife",
    target: "es2022",
    clean: true,
    dts: false,
    globalName: "Accordion",
    outDir: "dist",
    minify: true,
    banner,
    outputOptions: {
      entryFileNames: "accordion.min.js"
    }
  },
  {
    entry: "./src/accordion.css",
    platform: "browser",
    outDir: "dist",
    css: {
      fileName: "accordion.min.css",
      minify: true
    },
    hooks: {
      "build:done": async () => {
        const cssFilePath = resolve("./dist/accordion.min.css");
        const cssContent = await readFile(cssFilePath, "utf8");

        if (cssContent.startsWith(banner)) {
          return;
        }

        await writeFile(cssFilePath, `${banner}\n${cssContent}`);
      }
    }
  }
]);
