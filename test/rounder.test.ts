/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import BigNumber from "bignumber.js";
import {precision} from "../src/precision";

describe("rounder.round()", () => {
  test("no overlap", () => {
    precision.set();
    const pt1 = {x: new BigNumber(3), y: new BigNumber(4)};
    const pt2 = {x: new BigNumber(4), y: new BigNumber(5)};
    const pt3 = {x: new BigNumber(5), y: new BigNumber(5)};
    expect(precision.snap(pt1)).toEqual(pt1);
    expect(precision.snap(pt2)).toEqual(pt2);
    expect(precision.snap(pt3)).toEqual(pt3);
  });

  test("exact overlap", () => {
    precision.set();
    const pt1 = {x: new BigNumber(3), y: new BigNumber(4)};
    const pt2 = {x: new BigNumber(4), y: new BigNumber(5)};
    const pt3 = {x: new BigNumber(3), y: new BigNumber(4)};
    expect(precision.snap(pt1)).toEqual(pt1);
    expect(precision.snap(pt2)).toEqual(pt2);
    expect(precision.snap(pt3)).toEqual(pt3);
  });

  test("rounding one coordinate", () => {
    precision.set(Number.EPSILON);
    const pt1 = {x: new BigNumber(3), y: new BigNumber(4)};
    const pt2 = {x: new BigNumber(3).plus(new BigNumber(Number.EPSILON)), y: new BigNumber(4)};
    const pt3 = {x: new BigNumber(3), y: new BigNumber(4).plus(new BigNumber(Number.EPSILON))};
    expect(precision.snap(pt1)).toEqual(pt1);
    expect(precision.snap(pt2)).toEqual(pt1);
    expect(precision.snap(pt3)).toEqual(pt1);
  });

  test("rounding both coordinates", () => {
    precision.set(Number.EPSILON);
    const pt1 = {x: new BigNumber(3), y: new BigNumber(4)};
    const pt2 = {
      x: new BigNumber(3).plus(new BigNumber(Number.EPSILON)),
      y: new BigNumber(4).plus(new BigNumber(Number.EPSILON))
    };
    expect(precision.snap(pt1)).toEqual(pt1);
    expect(precision.snap(pt2)).toEqual(pt1);
  });

  test("preseed with 0", () => {
    precision.set(Number.EPSILON);
    const pt1 = {
      x: new BigNumber(Number.EPSILON).div(new BigNumber(2)),
      y: new BigNumber(-Number.EPSILON).div(new BigNumber(2))
    };
    expect(pt1.x).not.toEqual(0);
    expect(pt1.y).not.toEqual(0);
    expect(precision.snap(pt1)).toEqual({x: new BigNumber(0), y: new BigNumber(0)});
  });
});
