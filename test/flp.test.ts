/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import {BigNumber} from "bignumber.js";
import {precision} from "../src/precision";

describe("compare", () => {
  precision.set(Number.EPSILON);
  const compare = precision.compare;
  test("exactly equal", () => {
    const a = new BigNumber(1);
    const b = new BigNumber(1);
    expect(compare(a, b)).toBe(0);
  });

  test("flp equal", () => {
    const a = new BigNumber(1);
    const b = new BigNumber(1).plus(new BigNumber(Number.EPSILON));
    expect(compare(a, b)).toBe(0);
  });

  test("barely less than", () => {
    const a = new BigNumber(1);
    const b = new BigNumber(1).plus(new BigNumber(Number.EPSILON).times(new BigNumber(2)));
    expect(compare(a, b)).toBe(-1);
  });

  test("less than", () => {
    const a = new BigNumber(1);
    const b = new BigNumber(2);
    expect(compare(a, b)).toBe(-1);
  });

  test("barely more than", () => {
    const a = new BigNumber(1).plus(new BigNumber(Number.EPSILON).times(new BigNumber(2)));
    const b = new BigNumber(1);
    expect(compare(a, b)).toBe(1);
  });

  test("more than", () => {
    const a = new BigNumber(2);
    const b = new BigNumber(1);
    expect(compare(a, b)).toBe(1);
  });

  test("both flp equal to zero", () => {
    const a = new BigNumber(0.0);
    const b = new BigNumber(Number.EPSILON).minus(new BigNumber(Number.EPSILON).times(new BigNumber(Number.EPSILON)));
    expect(compare(a, b)).toBe(0);
  });

  test("really close to zero", () => {
    const a = new BigNumber(Number.EPSILON);
    const b = new BigNumber(Number.EPSILON).plus(
      new BigNumber(Number.EPSILON).times(new BigNumber(Number.EPSILON)).times(new BigNumber(2))
    );
    expect(compare(a, b)).toBe(0);
  });
  precision.set();
});
