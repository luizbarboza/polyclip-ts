import {defineConfig, type Options} from "tsup";

const baseOptions: Options = {
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  sourcemap: true,
  tsconfig: "./tsconfig.json"
};

export default [
  defineConfig({
    ...baseOptions,
    noExternal: ["splaytree-ts"],
    outDir: "dist/cjs",
    format: "cjs"
  }),
  defineConfig({
    ...baseOptions,
    outDir: "dist/esm",
    format: "esm"
  })
];
