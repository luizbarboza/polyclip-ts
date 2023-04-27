/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import BigNumber from "bignumber.js";
import {precision} from "../src/precision";

describe("compare vector angles", () => {
  test("colinear", () => {
    const pt1 = {x: new BigNumber(1), y: new BigNumber(1)};
    const pt2 = {x: new BigNumber(2), y: new BigNumber(2)};
    const pt3 = {x: new BigNumber(3), y: new BigNumber(3)};

    expect(precision.orient(pt1, pt2, pt3)).toBe(0);
    expect(precision.orient(pt2, pt1, pt3)).toBe(0);
    expect(precision.orient(pt2, pt3, pt1)).toBe(0);
    expect(precision.orient(pt3, pt2, pt1)).toBe(0);
  });

  test("offset", () => {
    const pt1 = {x: new BigNumber(0), y: new BigNumber(0)};
    const pt2 = {x: new BigNumber(1), y: new BigNumber(1)};
    const pt3 = {x: new BigNumber(1), y: new BigNumber(0)};

    expect(precision.orient(pt1, pt2, pt3)).toBe(1);
    expect(precision.orient(pt2, pt1, pt3)).toBe(-1);
    expect(precision.orient(pt2, pt3, pt1)).toBe(1);
    expect(precision.orient(pt3, pt2, pt1)).toBe(-1);
  });
});
