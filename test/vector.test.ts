/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import {BigNumber} from "bignumber.js";
import {
  crossProduct,
  dotProduct,
  length,
  cosineOfAngle,
  sineOfAngle,
  perpendicular,
  verticalIntersection,
  horizontalIntersection,
  intersection
} from "../src/vector";

describe("cross product", () => {
  test("general", () => {
    const pt1 = {x: new BigNumber(1), y: new BigNumber(2)};
    const pt2 = {x: new BigNumber(3), y: new BigNumber(4)};
    expect(crossProduct(pt1, pt2)).toEqual(new BigNumber(-2));
  });
});

describe("dot product", () => {
  test("general", () => {
    const pt1 = {x: new BigNumber(1), y: new BigNumber(2)};
    const pt2 = {x: new BigNumber(3), y: new BigNumber(4)};
    expect(dotProduct(pt1, pt2)).toEqual(new BigNumber(11));
  });
});

describe("length()", () => {
  test("horizontal", () => {
    const v = {x: new BigNumber(3), y: new BigNumber(0)};
    expect(length(v)).toStrictEqual(new BigNumber(3));
  });

  test("vertical", () => {
    const v = {x: new BigNumber(0), y: new BigNumber(-2)};
    expect(length(v)).toStrictEqual(new BigNumber(2));
  });

  test("3-4-5", () => {
    const v = {x: new BigNumber(3), y: new BigNumber(4)};
    expect(length(v)).toStrictEqual(new BigNumber(5));
  });
});

describe("sine and cosine of angle", () => {
  describe("parallel", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(1), y: new BigNumber(0)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(0));
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(1));
    });
  });

  describe("45 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(1), y: new BigNumber(-1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().div(new BigNumber(2)).toNumber()
      );
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().div(new BigNumber(2)).toNumber()
      );
    });
  });

  describe("90 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(0), y: new BigNumber(-1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(1));
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(0));
    });
  });

  describe("135 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(-1), y: new BigNumber(-1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().div(new BigNumber(2)).toNumber()
      );
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().negated().div(new BigNumber(2)).toNumber()
      );
    });
  });

  describe("anti-parallel", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(-1), y: new BigNumber(0)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(-0));
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(-1));
    });
  });

  describe("225 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(-1), y: new BigNumber(1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().negated().div(new BigNumber(2)).toNumber()
      );
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().negated().div(new BigNumber(2)).toNumber()
      );
    });
  });

  describe("270 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(0), y: new BigNumber(1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(-1));
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle)).toStrictEqual(new BigNumber(0));
    });
  });

  describe("315 degrees", () => {
    const shared = {x: new BigNumber(0), y: new BigNumber(0)};
    const base = {x: new BigNumber(1), y: new BigNumber(0)};
    const angle = {x: new BigNumber(1), y: new BigNumber(1)};
    test("sine", () => {
      expect(sineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().negated().div(new BigNumber(2)).toNumber()
      );
    });
    test("cosine", () => {
      expect(cosineOfAngle(shared, base, angle).toNumber()).toBeCloseTo(
        new BigNumber(2).sqrt().div(new BigNumber(2)).toNumber()
      );
    });
  });
});

describe("perpendicular()", () => {
  test("vertical", () => {
    const v = {x: new BigNumber(0), y: new BigNumber(1)};
    const r = perpendicular(v);
    expect(dotProduct(v, r)).toStrictEqual(new BigNumber(0));
    expect(crossProduct(v, r)).not.toBe(new BigNumber(0));
  });

  test("horizontal", () => {
    const v = {x: new BigNumber(1), y: new BigNumber(0)};
    const r = perpendicular(v);
    expect(dotProduct(v, r)).toStrictEqual(new BigNumber(0));
    expect(crossProduct(v, r)).not.toBe(new BigNumber(0));
  });

  test("45 degrees", () => {
    const v = {x: new BigNumber(1), y: new BigNumber(1)};
    const r = perpendicular(v);
    expect(dotProduct(v, r)).toStrictEqual(new BigNumber(0));
    expect(crossProduct(v, r)).not.toBe(new BigNumber(0));
  });

  test("120 degrees", () => {
    const v = {x: new BigNumber(-1), y: new BigNumber(2)};
    const r = perpendicular(v);
    expect(dotProduct(v, r)).toStrictEqual(new BigNumber(0));
    expect(crossProduct(v, r)).not.toBe(new BigNumber(0));
  });
});

describe("verticalIntersection()", () => {
  test("horizontal", () => {
    const p = {x: new BigNumber(42), y: new BigNumber(3)};
    const v = {x: new BigNumber(-2), y: new BigNumber(0)};
    const x = new BigNumber(37);
    const i = verticalIntersection(p, v, x)!;
    expect(i.x).toStrictEqual(new BigNumber(37));
    expect(i.y).toStrictEqual(new BigNumber(3));
  });

  test("vertical", () => {
    const p = {x: new BigNumber(42), y: new BigNumber(3)};
    const v = {x: new BigNumber(0), y: new BigNumber(4)};
    const x = new BigNumber(37);
    expect(verticalIntersection(p, v, x)).toBe(null);
  });

  test("45 degree", () => {
    const p = {x: new BigNumber(1), y: new BigNumber(1)};
    const v = {x: new BigNumber(1), y: new BigNumber(1)};
    const x = new BigNumber(-2);
    const i = verticalIntersection(p, v, x)!;
    expect(i.x).toStrictEqual(new BigNumber(-2));
    expect(i.y).toStrictEqual(new BigNumber(-2));
  });

  test("upper left quadrant", () => {
    const p = {x: new BigNumber(-1), y: new BigNumber(1)};
    const v = {x: new BigNumber(-2), y: new BigNumber(1)};
    const x = new BigNumber(-3);
    const i = verticalIntersection(p, v, x)!;
    expect(i.x).toStrictEqual(new BigNumber(-3));
    expect(i.y).toStrictEqual(new BigNumber(2));
  });
});

describe("horizontalIntersection()", () => {
  test("horizontal", () => {
    const p = {x: new BigNumber(42), y: new BigNumber(3)};
    const v = {x: new BigNumber(-2), y: new BigNumber(0)};
    const y = new BigNumber(37);
    expect(horizontalIntersection(p, v, y)).toBe(null);
  });

  test("vertical", () => {
    const p = {x: new BigNumber(42), y: new BigNumber(3)};
    const v = {x: new BigNumber(0), y: new BigNumber(4)};
    const y = new BigNumber(37);
    const i = horizontalIntersection(p, v, y)!;
    expect(i.x).toStrictEqual(new BigNumber(42));
    expect(i.y).toStrictEqual(new BigNumber(37));
  });

  test("45 degree", () => {
    const p = {x: new BigNumber(1), y: new BigNumber(1)};
    const v = {x: new BigNumber(1), y: new BigNumber(1)};
    const y = new BigNumber(4);
    const i = horizontalIntersection(p, v, y)!;
    expect(i.x).toStrictEqual(new BigNumber(4));
    expect(i.y).toStrictEqual(new BigNumber(4));
  });

  test("bottom left quadrant", () => {
    const p = {x: new BigNumber(-1), y: new BigNumber(-1)};
    const v = {x: new BigNumber(-2), y: new BigNumber(-1)};
    const y = new BigNumber(-3);
    const i = horizontalIntersection(p, v, y)!;
    expect(i.x).toStrictEqual(new BigNumber(-5));
    expect(i.y).toStrictEqual(new BigNumber(-3));
  });
});

describe("intersection()", () => {
  const p1 = {x: new BigNumber(42), y: new BigNumber(42)};
  const p2 = {x: new BigNumber(-32), y: new BigNumber(46)};

  test("parrallel", () => {
    const v1 = {x: new BigNumber(1), y: new BigNumber(2)};
    const v2 = {x: new BigNumber(-1), y: new BigNumber(-2)};
    const i = intersection(p1, v1, p2, v2);
    expect(i).toBe(null);
  });

  test("horizontal and vertical", () => {
    const v1 = {x: new BigNumber(0), y: new BigNumber(2)};
    const v2 = {x: new BigNumber(-1), y: new BigNumber(0)};
    const i = intersection(p1, v1, p2, v2)!;
    expect(i.x).toStrictEqual(new BigNumber(42));
    expect(i.y).toStrictEqual(new BigNumber(46));
  });

  test("horizontal", () => {
    const v1 = {x: new BigNumber(1), y: new BigNumber(1)};
    const v2 = {x: new BigNumber(-1), y: new BigNumber(0)};
    const i = intersection(p1, v1, p2, v2)!;
    expect(i.x).toStrictEqual(new BigNumber(46));
    expect(i.y).toStrictEqual(new BigNumber(46));
  });

  test("vertical", () => {
    const v1 = {x: new BigNumber(1), y: new BigNumber(1)};
    const v2 = {x: new BigNumber(0), y: new BigNumber(1)};
    const i = intersection(p1, v1, p2, v2)!;
    expect(i.x).toStrictEqual(new BigNumber(-32));
    expect(i.y).toStrictEqual(new BigNumber(-32));
  });

  test("45 degree & 135 degree", () => {
    const v1 = {x: new BigNumber(1), y: new BigNumber(1)};
    const v2 = {x: new BigNumber(-1), y: new BigNumber(1)};
    const i = intersection(p1, v1, p2, v2)!;
    expect(i.x).toStrictEqual(new BigNumber(7));
    expect(i.y).toStrictEqual(new BigNumber(7));
  });

  test("consistency", () => {
    // Taken from https://github.com/mfogel/polygon-clipping/issues/37
    const p1 = {x: new BigNumber(0.523787), y: new BigNumber(51.281453)};
    const v1 = {x: new BigNumber(0.0002729999999999677), y: new BigNumber(0.0002729999999999677)};
    const p2 = {x: new BigNumber(0.523985), y: new BigNumber(51.281651)};
    const v2 = {x: new BigNumber(0.000024999999999941735), y: new BigNumber(0.000049000000004184585)};
    const i1 = intersection(p1, v1, p2, v2)!;
    const i2 = intersection(p2, v2, p1, v1)!;
    expect(i1.x).toStrictEqual(i2.x);
    expect(i1.y).toStrictEqual(i2.y);
  });
});
