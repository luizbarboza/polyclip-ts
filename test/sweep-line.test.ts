/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import SweepLine from "../src/sweep-line";
import Segment from "../src/segment";

const comparator = (a: number, b: number) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

describe("sweep line", () => {
  test("test filling up the tree then emptying it out", () => {
    const set = new SweepLine(null!, comparator as unknown as (a: Segment, b: Segment) => number);
    const k1 = 4 as unknown as Segment;
    const k2 = 9 as unknown as Segment;
    const k3 = 13 as unknown as Segment;
    const k4 = 44 as unknown as Segment;

    set["tree"].add(k1);
    set["tree"].add(k2);
    set["tree"].add(k3);
    set["tree"].add(k4);

    let n1 = set["tree"].lookup(k1)!;
    const n2 = set["tree"].lookup(k2)!;
    let n3 = set["tree"].lookup(k3)!;
    let n4 = set["tree"].lookup(k4)!;

    expect(n1).toBe(k1);
    expect(n2).toBe(k2);
    expect(n3).toBe(k3);
    expect(n4).toBe(k4);

    expect(set["tree"].lastBefore(n1)).toBeNull();
    expect(set["tree"].firstAfter(n1)).toBe(k2);

    expect(set["tree"].lastBefore(n2)).toBe(k1);
    expect(set["tree"].firstAfter(n2)).toBe(k3);

    expect(set["tree"].lastBefore(n3)).toBe(k2);
    expect(set["tree"].firstAfter(n3)).toBe(k4);

    expect(set["tree"].lastBefore(n4)).toBe(k3);
    expect(set["tree"].firstAfter(n4)).toBeNull();

    set["tree"].delete(k2);
    expect(set["tree"].lookup(k2)).toBeNull();

    n1 = set["tree"].lookup(k1)!;
    n3 = set["tree"].lookup(k3)!;
    n4 = set["tree"].lookup(k4)!;

    expect(set["tree"].lastBefore(n1)).toBeNull();
    expect(set["tree"].firstAfter(n1)).toBe(k3);

    expect(set["tree"].lastBefore(n3)).toBe(k1);
    expect(set["tree"].firstAfter(n3)).toBe(k4);

    expect(set["tree"].lastBefore(n4)).toBe(k3);
    expect(set["tree"].firstAfter(n4)).toBeNull();

    set["tree"].delete(k4);
    expect(set["tree"].lookup(k4)).toBeNull();

    n1 = set["tree"].lookup(k1)!;
    n3 = set["tree"].lookup(k3)!;

    expect(set["tree"].lastBefore(n1)).toBeNull();
    expect(set["tree"].firstAfter(n1)).toBe(k3);

    expect(set["tree"].lastBefore(n3)).toBe(k1);
    expect(set["tree"].firstAfter(n3)).toBeNull();

    set["tree"].delete(k1);
    expect(set["tree"].lookup(k1)).toBeNull();

    n3 = set["tree"].lookup(k3)!;

    expect(set["tree"].lastBefore(n3)).toBeNull();
    expect(set["tree"].firstAfter(n3)).toBeNull();

    set["tree"].delete(k3);
    expect(set["tree"].lookup(k3)).toBeNull();
  });
});
