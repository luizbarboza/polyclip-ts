/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import * as polyclip from "../src";
import {Geom} from "../src/geom-in";

/** USE ME TO RUN ONLY ONE TEST **/
const targetOnly = "";
const opOnly = "";

/** USE ME TO SKIP TESTS **/
const targetsSkip: string[] = [];
const opsSkip: string[] = [];

const endToEndDir = "test/end-to-end";

describe("end to end", () => {
  const targets = fs.readdirSync(endToEndDir);

  targets.forEach((target) => {
    // ignore dotfiles like .DS_Store
    if (target.startsWith(".")) return;

    describe(target, () => {
      const targetDir = path.join(endToEndDir, target);
      const argsGeojson: {features: {geometry: {coordinates: Geom}}[]} = JSON.parse(
        fs.readFileSync(path.join(targetDir, "args.geojson"), "utf-8")
      );
      const args = argsGeojson.features.map((f) => f.geometry.coordinates);

      const resultPathsAndOperationTypes = fs
        .readdirSync(targetDir)
        .filter((fn) => fn !== "args.geojson" && fn.endsWith(".geojson"))
        .map((fn) => [fn.slice(0, -".geojson".length), path.join(targetDir, fn)])
        .map(([opType, p]) =>
          opType === "all"
            ? [
                ["union", p],
                ["intersection", p],
                ["xor", p],
                ["difference", p]
              ]
            : [[opType, p]]
        )
        .reduce((acc, val) => acc.concat(val), []); // flatten equiv: .flat(1)

      resultPathsAndOperationTypes.forEach(([operationType, resultPath]) => {
        let doTest: typeof test | typeof test.skip = test;
        if (targetsSkip.includes(target)) doTest = test.skip;
        if (opsSkip.includes(operationType)) doTest = test.skip;
        if (targetOnly && opOnly) {
          if (target === targetOnly && operationType === opOnly) {
            doTest = test.only;
          }
        } else if (targetOnly && target === targetOnly) doTest = test.only;
        else if (opOnly && operationType === opOnly) doTest = test.only;

        doTest(operationType, () => {
          const resultGeojson = JSON.parse(fs.readFileSync(resultPath, "utf-8"));
          const expected = resultGeojson.geometry.coordinates;
          const options = resultGeojson?.properties?.options;

          polyclip.setPrecision(options?.precision);
          const operation = polyclip[operationType as "union" | "intersection" | "xor" | "difference"];
          if (!operation) {
            throw new Error(`Unknown operation '${operationType}'. Mispelling in filename of ${resultPath} ?`);
          }

          const result = operation(...(args as [Geom, ...Geom[]]));
          expect(result).toEqual(expected);
        });
      });
    });
  });
});
