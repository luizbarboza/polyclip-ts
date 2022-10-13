import fs from "fs";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import node from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import * as meta from "./package.json";

const filename = meta.name

const copyrights = fs
  .readFileSync("./LICENSE", "utf-8")
  .split(/\n/g)
  .filter((line) => /^copyright\s+/i.test(line))
  .map((line) => line.replace(/^copyright\s+/i, ""));

const config = {
  input: "bundle.js",
  output: {
    indent: false,
    banner: `// ${meta.name} v${meta.version} Copyright ${copyrights.join(", ")}`
  },
  plugins: [typescript(), node(), json()]
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      name: "polyclip-ts",
      format: "umd",
      extend: true,
      file: `dist/${filename}.umd.js`,
    }
  },
  {
    ...config,
    output: {
      ...config.output,
      name: "polyclip-ts",
      format: "umd",
      extend: true,
      file: `dist/${filename}.umd.min.js`,
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];