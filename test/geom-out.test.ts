/* eslint-env jest */

// hard to unit test these structures as much of what they
// do is operate off of the result of the sweep line sweep

import {describe, expect, test} from "@jest/globals";
import BigNumber from "bignumber.js";
import Segment from "../src/segment";
import {RingOut, PolyOut, MultiPolyOut} from "../src/geom-out";
import {precision} from "../src/precision";
import {Point} from "../src/sweep-event";

describe("ring", () => {
  describe("factory", () => {
    test("simple triangle", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
      const p3 = <Point>{x: new BigNumber(0), y: new BigNumber(1)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p1, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;

      const rings = RingOut.factory([seg1, seg2, seg3]);

      expect(rings.length).toBe(1);
      expect(rings[0].getGeom()).toEqual([
        [0, 0],
        [1, 1],
        [0, 1],
        [0, 0]
      ]);
    });

    test("bow tie", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
      const p3 = <Point>{x: new BigNumber(0), y: new BigNumber(2)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p1, undefined!);

      const p4 = <Point>{x: new BigNumber(2), y: new BigNumber(0)};
      const p5 = p2;
      const p6 = <Point>{x: new BigNumber(2), y: new BigNumber(2)};

      const seg4 = Segment.fromRing(p4, p5, undefined!);
      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p4, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;

      const rings = RingOut.factory([seg1, seg2, seg3, seg4, seg5, seg6]);

      expect(rings.length).toBe(2);
      expect(rings[0].getGeom()).toEqual([
        [0, 0],
        [1, 1],
        [0, 2],
        [0, 0]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [1, 1],
        [2, 0],
        [2, 2],
        [1, 1]
      ]);
    });

    test("ringed ring", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(3), y: new BigNumber(-3)};
      const p3 = <Point>{x: new BigNumber(3), y: new BigNumber(0)};
      const p4 = <Point>{x: new BigNumber(3), y: new BigNumber(3)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p4, undefined!);
      const seg4 = Segment.fromRing(p4, p1, undefined!);

      const p5 = <Point>{x: new BigNumber(2), y: new BigNumber(-1)};
      const p6 = p3;
      const p7 = <Point>{x: new BigNumber(2), y: new BigNumber(1)};

      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p7, undefined!);
      const seg7 = Segment.fromRing(p7, p5, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;
      seg7._isInResult = true;

      const rings = RingOut.factory([seg1, seg2, seg3, seg4, seg5, seg6, seg7]);

      expect(rings.length).toBe(2);
      expect(rings[0].getGeom()).toEqual([
        [3, 0],
        [2, 1],
        [2, -1],
        [3, 0]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [0, 0],
        [3, -3],
        [3, 3],
        [0, 0]
      ]);
    });

    test("ringed ring interior ring starting point extraneous", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(5), y: new BigNumber(-5)};
      const p3 = <Point>{x: new BigNumber(4), y: new BigNumber(0)};
      const p4 = <Point>{x: new BigNumber(5), y: new BigNumber(5)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p4, undefined!);
      const seg4 = Segment.fromRing(p4, p1, undefined!);

      const p5 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
      const p6 = <Point>{x: new BigNumber(4), y: new BigNumber(1)};
      const p7 = p3;
      const p8 = <Point>{x: new BigNumber(4), y: new BigNumber(-1)};

      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p7, undefined!);
      const seg7 = Segment.fromRing(p7, p8, undefined!);
      const seg8 = Segment.fromRing(p8, p5, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;
      seg7._isInResult = true;
      seg8._isInResult = true;

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8];
      const rings = RingOut.factory(segs);

      expect(rings.length).toBe(2);
      expect(rings[0].getGeom()).toEqual([
        [4, 1],
        [1, 0],
        [4, -1],
        [4, 1]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [0, 0],
        [5, -5],
        [4, 0],
        [5, 5],
        [0, 0]
      ]);
    });

    test("ringed ring and bow tie at same point", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(3), y: new BigNumber(-3)};
      const p3 = <Point>{x: new BigNumber(3), y: new BigNumber(0)};
      const p4 = <Point>{x: new BigNumber(3), y: new BigNumber(3)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p4, undefined!);
      const seg4 = Segment.fromRing(p4, p1, undefined!);

      const p5 = <Point>{x: new BigNumber(2), y: new BigNumber(-1)};
      const p6 = p3;
      const p7 = <Point>{x: new BigNumber(2), y: new BigNumber(1)};

      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p7, undefined!);
      const seg7 = Segment.fromRing(p7, p5, undefined!);

      const p8 = p3;
      const p9 = <Point>{x: new BigNumber(4), y: new BigNumber(-1)};
      const p10 = <Point>{x: new BigNumber(4), y: new BigNumber(1)};

      const seg8 = Segment.fromRing(p8, p9, undefined!);
      const seg9 = Segment.fromRing(p9, p10, undefined!);
      const seg10 = Segment.fromRing(p10, p8, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;
      seg7._isInResult = true;
      seg8._isInResult = true;
      seg9._isInResult = true;
      seg10._isInResult = true;

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9, seg10];
      const rings = RingOut.factory(segs);

      expect(rings.length).toBe(3);
      expect(rings[0].getGeom()).toEqual([
        [3, 0],
        [2, 1],
        [2, -1],
        [3, 0]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [0, 0],
        [3, -3],
        [3, 3],
        [0, 0]
      ]);
      expect(rings[2].getGeom()).toEqual([
        [3, 0],
        [4, -1],
        [4, 1],
        [3, 0]
      ]);
    });

    test("double bow tie", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(-2)};
      const p3 = <Point>{x: new BigNumber(1), y: new BigNumber(2)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p1, undefined!);

      const p4 = p2;
      const p5 = <Point>{x: new BigNumber(2), y: new BigNumber(-3)};
      const p6 = <Point>{x: new BigNumber(2), y: new BigNumber(-1)};

      const seg4 = Segment.fromRing(p4, p5, undefined!);
      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p4, undefined!);

      const p7 = p3;
      const p8 = <Point>{x: new BigNumber(2), y: new BigNumber(1)};
      const p9 = <Point>{x: new BigNumber(2), y: new BigNumber(3)};

      const seg7 = Segment.fromRing(p7, p8, undefined!);
      const seg8 = Segment.fromRing(p8, p9, undefined!);
      const seg9 = Segment.fromRing(p9, p7, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;
      seg7._isInResult = true;
      seg8._isInResult = true;
      seg9._isInResult = true;

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9];
      const rings = RingOut.factory(segs);

      expect(rings.length).toBe(3);
      expect(rings[0].getGeom()).toEqual([
        [0, 0],
        [1, -2],
        [1, 2],
        [0, 0]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [1, -2],
        [2, -3],
        [2, -1],
        [1, -2]
      ]);
      expect(rings[2].getGeom()).toEqual([
        [1, 2],
        [2, 1],
        [2, 3],
        [1, 2]
      ]);
    });

    test("double ringed ring", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(5), y: new BigNumber(-5)};
      const p3 = <Point>{x: new BigNumber(5), y: new BigNumber(5)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p1, undefined!);

      const p4 = <Point>{x: new BigNumber(1), y: new BigNumber(-1)};
      const p5 = p2;
      const p6 = <Point>{x: new BigNumber(2), y: new BigNumber(-1)};

      const seg4 = Segment.fromRing(p4, p5, undefined!);
      const seg5 = Segment.fromRing(p5, p6, undefined!);
      const seg6 = Segment.fromRing(p6, p4, undefined!);

      const p7 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
      const p8 = p3;
      const p9 = <Point>{x: new BigNumber(2), y: new BigNumber(1)};

      const seg7 = Segment.fromRing(p7, p8, undefined!);
      const seg8 = Segment.fromRing(p8, p9, undefined!);
      const seg9 = Segment.fromRing(p9, p7, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = true;
      seg4._isInResult = true;
      seg5._isInResult = true;
      seg6._isInResult = true;
      seg7._isInResult = true;
      seg8._isInResult = true;
      seg9._isInResult = true;

      const segs = [seg1, seg2, seg3, seg4, seg5, seg6, seg7, seg8, seg9];
      const rings = RingOut.factory(segs);

      expect(rings.length).toBe(3);
      expect(rings[0].getGeom()).toEqual([
        [5, -5],
        [2, -1],
        [1, -1],
        [5, -5]
      ]);
      expect(rings[1].getGeom()).toEqual([
        [5, 5],
        [1, 1],
        [2, 1],
        [5, 5]
      ]);
      expect(rings[2].getGeom()).toEqual([
        [0, 0],
        [5, -5],
        [5, 5],
        [0, 0]
      ]);
    });

    test("errors on on malformed ring", () => {
      const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
      const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
      const p3 = <Point>{x: new BigNumber(0), y: new BigNumber(1)};

      const seg1 = Segment.fromRing(p1, p2, undefined!);
      const seg2 = Segment.fromRing(p2, p3, undefined!);
      const seg3 = Segment.fromRing(p3, p1, undefined!);

      seg1._isInResult = true;
      seg2._isInResult = true;
      seg3._isInResult = false; // broken ring

      expect(() => RingOut.factory([seg1, seg2, seg3])).toThrow();
    });
  });

  test("exterior ring", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
    const p3 = <Point>{x: new BigNumber(0), y: new BigNumber(1)};

    const seg1 = Segment.fromRing(p1, p2, undefined!);
    const seg2 = Segment.fromRing(p2, p3, undefined!);
    const seg3 = Segment.fromRing(p3, p1, undefined!);

    seg1._isInResult = true;
    seg2._isInResult = true;
    seg3._isInResult = true;

    const ring = RingOut.factory([seg1, seg2, seg3])[0];

    expect(ring.enclosingRing()).toBeNull();
    expect(ring.isExteriorRing()).toBe(true);
    expect(ring.getGeom()).toEqual([
      [0, 0],
      [1, 1],
      [0, 1],
      [0, 0]
    ]);
  });

  test("interior ring points reversed", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
    const p3 = <Point>{x: new BigNumber(0), y: new BigNumber(1)};

    const seg1 = Segment.fromRing(p1, p2, undefined!);
    const seg2 = Segment.fromRing(p2, p3, undefined!);
    const seg3 = Segment.fromRing(p3, p1, undefined!);

    seg1._isInResult = true;
    seg2._isInResult = true;
    seg3._isInResult = true;

    const ring = RingOut.factory([seg1, seg2, seg3])[0];
    ring._isExteriorRing = false;

    expect(ring.isExteriorRing()).toBe(false);
    expect(ring.getGeom()).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 0]
    ]);
  });

  test("removes colinear points successfully", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
    const p3 = <Point>{x: new BigNumber(2), y: new BigNumber(2)};
    const p4 = <Point>{x: new BigNumber(0), y: new BigNumber(2)};

    const seg1 = Segment.fromRing(p1, p2, undefined!);
    const seg2 = Segment.fromRing(p2, p3, undefined!);
    const seg3 = Segment.fromRing(p3, p4, undefined!);
    const seg4 = Segment.fromRing(p4, p1, undefined!);

    seg1._isInResult = true;
    seg2._isInResult = true;
    seg3._isInResult = true;
    seg4._isInResult = true;

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0];

    expect(ring.getGeom()).toEqual([
      [0, 0],
      [2, 2],
      [0, 2],
      [0, 0]
    ]);
  });

  test("almost equal point handled ok", () => {
    precision.set(1e-9);
    // points harvested from https://github.com/mfogel/polygon-clipping/issues/37
    const p1 = <Point>{x: new BigNumber(0.523985), y: new BigNumber(51.281651)};
    const p2 = <Point>{x: new BigNumber(0.5241), y: new BigNumber(51.2816)};
    const p3 = <Point>{x: new BigNumber(0.5240213684210527), y: new BigNumber(51.281687368421)};
    const p4 = <Point>{x: new BigNumber(0.5239850000000027), y: new BigNumber(51.281651000000004)}; // almost equal to p1

    const seg1 = Segment.fromRing(p1, p2, undefined!);
    const seg2 = Segment.fromRing(p2, p3, undefined!);
    const seg3 = Segment.fromRing(p3, p4, undefined!);
    const seg4 = Segment.fromRing(p4, p1, undefined!);

    seg1._isInResult = true;
    seg2._isInResult = true;
    seg3._isInResult = true;
    seg4._isInResult = true;

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0];

    expect(ring.getGeom()).toEqual([
      [0.523985, 51.281651],
      [0.5241, 51.2816],
      [0.5240213684210527, 51.281687368421],
      [0.523985, 51.281651]
    ]);
    precision.set();
  });

  test("ring with all colinear points returns null", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(1)};
    const p3 = <Point>{x: new BigNumber(2), y: new BigNumber(2)};
    const p4 = <Point>{x: new BigNumber(3), y: new BigNumber(3)};

    const seg1 = Segment.fromRing(p1, p2, undefined!);
    const seg2 = Segment.fromRing(p2, p3, undefined!);
    const seg3 = Segment.fromRing(p3, p4, undefined!);
    const seg4 = Segment.fromRing(p4, p1, undefined!);

    seg1._isInResult = true;
    seg2._isInResult = true;
    seg3._isInResult = true;
    seg4._isInResult = true;

    const ring = RingOut.factory([seg1, seg2, seg3, seg4])[0];

    expect(ring.getGeom()).toEqual(null);
  });
});

describe("poly", () => {
  test("basic", () => {
    const ring1 = (<Partial<RingOut>>{poly: null, getGeom: () => 1 as unknown as number[][]}) as RingOut;
    const ring2 = (<Partial<RingOut>>{poly: null, getGeom: () => 2 as unknown as number[][]}) as RingOut;
    const ring3 = (<Partial<RingOut>>{poly: null, getGeom: () => 3 as unknown as number[][]}) as RingOut;

    const poly = new PolyOut(ring1);
    poly.addInterior(ring2);
    poly.addInterior(ring3);

    expect(ring1.poly).toBe(poly);
    expect(ring2.poly).toBe(poly);
    expect(ring3.poly).toBe(poly);

    expect(poly.getGeom()).toEqual([1, 2, 3]);
  });

  test("has all colinear exterior ring", () => {
    const ring1 = (<Partial<RingOut>>{poly: null, getGeom: () => null}) as RingOut;
    const poly = new PolyOut(ring1);

    expect(ring1.poly).toBe(poly);

    expect(poly.getGeom()).toEqual(null);
  });

  test("has all colinear interior ring", () => {
    const ring1 = (<Partial<RingOut>>{poly: null, getGeom: () => 1 as unknown as number[][]}) as RingOut;
    const ring2 = (<Partial<RingOut>>{poly: null, getGeom: () => null}) as RingOut;
    const ring3 = (<Partial<RingOut>>{poly: null, getGeom: () => 3 as unknown as number[][]}) as RingOut;

    const poly = new PolyOut(ring1);
    poly.addInterior(ring2);
    poly.addInterior(ring3);

    expect(ring1.poly).toBe(poly);
    expect(ring2.poly).toBe(poly);
    expect(ring3.poly).toBe(poly);

    expect(poly.getGeom()).toEqual([1, 3]);
  });
});

describe("multipoly", () => {
  test("basic", () => {
    const multipoly = new MultiPolyOut([]);
    const poly1 = (<Partial<PolyOut>>{getGeom: () => 0 as unknown as number[][][]}) as PolyOut;
    const poly2 = (<Partial<PolyOut>>{getGeom: () => 1 as unknown as number[][][]}) as PolyOut;
    multipoly.polys = [poly1, poly2];

    expect(multipoly.getGeom()).toEqual([0, 1]);
  });

  test("has poly with all colinear exterior ring", () => {
    const multipoly = new MultiPolyOut([]);
    const poly1 = (<Partial<PolyOut>>{getGeom: () => null}) as PolyOut;
    const poly2 = (<Partial<PolyOut>>{getGeom: () => 1 as unknown as number[][][]}) as PolyOut;
    multipoly.polys = [poly1, poly2];

    expect(multipoly.getGeom()).toEqual([1]);
  });
});
