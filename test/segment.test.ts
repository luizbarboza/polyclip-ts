/* eslint-env jest */

import {describe, expect, test} from "@jest/globals";
import BigNumber from "bignumber.js";
import Segment from "../src/segment";
import SweepEvent, {Point} from "../src/sweep-event";
import {precision} from "../src/precision";
import {RingIn} from "../src/geom-in";

describe("constructor", () => {
  test("general", () => {
    const leftSE = new SweepEvent(<Point>{x: new BigNumber(0), y: new BigNumber(0)}, undefined!);
    const rightSE = new SweepEvent(<Point>{x: new BigNumber(1), y: new BigNumber(1)}, undefined!);
    const rings: RingIn[] = [];
    const windings: number[] = [];
    const seg = new Segment(leftSE, rightSE, rings, windings);
    expect(seg.rings).toBe(rings);
    expect(seg.windings).toBe(windings);
    expect(seg.leftSE).toBe(leftSE);
    expect(seg.leftSE.otherSE).toBe(rightSE);
    expect(seg.rightSE).toBe(rightSE);
    expect(seg.rightSE.otherSE).toBe(leftSE);
    expect(seg.ringOut).toBe(undefined);
    expect(seg.prev).toBe(undefined);
    expect(seg.consumedBy).toBe(undefined);
  });

  test("segment Id increments", () => {
    const leftSE = new SweepEvent(<Point>{x: new BigNumber(0), y: new BigNumber(0)}, undefined!);
    const rightSE = new SweepEvent(<Point>{x: new BigNumber(1), y: new BigNumber(1)}, undefined!);
    const seg1 = new Segment(leftSE, rightSE, [], undefined!);
    const seg2 = new Segment(leftSE, rightSE, [], undefined!);
    expect(seg2.id - seg1.id).toBe(1);
  });
});

describe("fromRing", () => {
  test("correct point on left and right 1", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(0), y: new BigNumber(1)};
    const seg = Segment.fromRing(p1, p2, undefined!);
    expect(seg.leftSE.point).toEqual(p1);
    expect(seg.rightSE.point).toEqual(p2);
  });

  test("correct point on left and right 1", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(-1), y: new BigNumber(0)};
    const seg = Segment.fromRing(p1, p2, undefined!);
    expect(seg.leftSE.point).toEqual(p2);
    expect(seg.rightSE.point).toEqual(p1);
  });

  test("attempt create segment with same points", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    expect(() => Segment.fromRing(p1, p2, undefined!)).toThrow();
  });
});

describe("split", () => {
  test("on interior point", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(10), y: new BigNumber(10)},
      true as unknown as RingIn
    );
    const pt = <Point>{x: new BigNumber(5), y: new BigNumber(5)};
    const evts = seg.split(pt);
    expect(evts[0].segment).toBe(seg);
    expect(evts[0].point).toEqual(pt);
    expect(evts[0].isLeft).toBe(false);
    expect(evts[0].otherSE.otherSE).toBe(evts[0]);
    expect(evts[1].segment.leftSE.segment).toBe(evts[1].segment);
    expect(evts[1].segment).not.toBe(seg);
    expect(evts[1].point).toEqual(pt);
    expect(evts[1].isLeft).toBe(true);
    expect(evts[1].otherSE.otherSE).toBe(evts[1]);
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment);
  });

  test("on close-to-but-not-exactly interior point", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(10)},
      <Point>{x: new BigNumber(10), y: new BigNumber(0)},
      false as unknown as RingIn
    );
    const pt = <Point>{x: new BigNumber(5).plus(new BigNumber(Number.EPSILON)), y: new BigNumber(5)};
    const evts = seg.split(pt);
    expect(evts[0].segment).toBe(seg);
    expect(evts[0].point).toEqual(pt);
    expect(evts[0].isLeft).toBe(false);
    expect(evts[1].segment).not.toBe(seg);
    expect(evts[1].point).toEqual(pt);
    expect(evts[1].isLeft).toBe(true);
    expect(evts[1].segment.rightSE.segment).toBe(evts[1].segment);
  });

  test("on three interior points", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(10), y: new BigNumber(10)},
      true as unknown as RingIn
    );
    const [sPt1, sPt2, sPt3] = [
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      <Point>{x: new BigNumber(6), y: new BigNumber(6)}
    ];

    const [orgLeftEvt, orgRightEvt] = [seg.leftSE, seg.rightSE];
    const newEvts3 = seg.split(sPt3);
    const newEvts2 = seg.split(sPt2);
    const newEvts1 = seg.split(sPt1);
    const newEvts = Array<SweepEvent>().concat(newEvts1, newEvts2, newEvts3);

    expect(newEvts.length).toBe(6);

    expect(seg.leftSE).toBe(orgLeftEvt);
    let evt = newEvts.find((e) => e.point === sPt1 && !e.isLeft)!;
    expect(seg.rightSE).toBe(evt);

    evt = newEvts.find((e) => e.point === sPt1 && e.isLeft)!;
    let otherEvt = newEvts.find((e) => e.point === sPt2 && !e.isLeft)!;
    expect(evt.segment).toBe(otherEvt.segment);

    evt = newEvts.find((e) => e.point === sPt2 && e.isLeft)!;
    otherEvt = newEvts.find((e) => e.point === sPt3 && !e.isLeft)!;
    expect(evt.segment).toBe(otherEvt.segment);

    evt = newEvts.find((e) => e.point === sPt3 && e.isLeft)!;
    expect(evt.segment).toBe(orgRightEvt.segment);
  });
});

describe("simple properties - bbox, vector", () => {
  test("general", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(2)},
      <Point>{x: new BigNumber(3), y: new BigNumber(4)},
      undefined!
    );
    expect(seg.bbox()).toEqual({
      ll: <Point>{x: new BigNumber(1), y: new BigNumber(2)},
      ur: <Point>{x: new BigNumber(3), y: new BigNumber(4)}
    });
    expect(seg.vector()).toEqual(<Point>{x: new BigNumber(2), y: new BigNumber(2)});
  });

  test("horizontal", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(4)},
      <Point>{x: new BigNumber(3), y: new BigNumber(4)},
      undefined!
    );
    expect(seg.bbox()).toEqual({
      ll: <Point>{x: new BigNumber(1), y: new BigNumber(4)},
      ur: <Point>{x: new BigNumber(3), y: new BigNumber(4)}
    });
    expect(seg.vector()).toEqual(<Point>{x: new BigNumber(2), y: new BigNumber(0)});
  });

  test("vertical", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(2)},
      <Point>{x: new BigNumber(3), y: new BigNumber(4)},
      undefined!
    );
    expect(seg.bbox()).toEqual({
      ll: <Point>{x: new BigNumber(3), y: new BigNumber(2)},
      ur: <Point>{x: new BigNumber(3), y: new BigNumber(4)}
    });
    expect(seg.vector()).toEqual(<Point>{x: new BigNumber(0), y: new BigNumber(2)});
  });
});

describe("consume()", () => {
  test("not automatically consumed", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    const seg1 = Segment.fromRing(p1, p2, {id: 1} as unknown as RingIn);
    const seg2 = Segment.fromRing(p1, p2, {id: 2} as unknown as RingIn);
    expect(seg1.consumedBy).toBe(undefined);
    expect(seg2.consumedBy).toBe(undefined);
  });

  test("basic case", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    const seg1 = Segment.fromRing(p1, p2, {} as RingIn);
    const seg2 = Segment.fromRing(p1, p2, {} as RingIn);
    seg1.consume(seg2);
    expect(seg2.consumedBy).toBe(seg1);
    expect(seg1.consumedBy).toBe(undefined);
  });

  test("ealier in sweep line sorting consumes later", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    const seg1 = Segment.fromRing(p1, p2, {} as RingIn);
    const seg2 = Segment.fromRing(p1, p2, {} as RingIn);
    seg2.consume(seg1);
    expect(seg2.consumedBy).toBe(seg1);
    expect(seg1.consumedBy).toBe(undefined);
  });

  test("consuming cascades", () => {
    const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p2 = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    const p3 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    const p4 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    const seg1 = Segment.fromRing(p1, p3, {} as RingIn);
    const seg2 = Segment.fromRing(p1, p3, {} as RingIn);
    const seg3 = Segment.fromRing(p2, p4, {} as RingIn);
    const seg4 = Segment.fromRing(p2, p4, {} as RingIn);
    const seg5 = Segment.fromRing(p2, p4, {} as RingIn);
    seg1.consume(seg2);
    seg4.consume(seg2);
    seg3.consume(seg2);
    seg3.consume(seg5);
    expect(seg1.consumedBy).toBe(undefined);
    expect(seg2.consumedBy).toBe(seg1);
    expect(seg3.consumedBy).toBe(seg1);
    expect(seg4.consumedBy).toBe(seg1);
    expect(seg5.consumedBy).toBe(seg1);
  });
});

describe("is an endpoint", () => {
  const p1 = <Point>{x: new BigNumber(0), y: new BigNumber(-1)};
  const p2 = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
  const seg = Segment.fromRing(p1, p2, undefined!);

  test("yup", () => {
    expect(seg.isAnEndpoint(p1)).toBeTruthy();
    expect(seg.isAnEndpoint(p2)).toBeTruthy();
  });

  test("nope", () => {
    expect(seg.isAnEndpoint(<Point>{x: new BigNumber(-34), y: new BigNumber(46)})).toBeFalsy();
    expect(seg.isAnEndpoint(<Point>{x: new BigNumber(0), y: new BigNumber(0)})).toBeFalsy();
  });
});

describe("comparison with point", () => {
  test("general", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );

    expect(s1.comparePoint(<Point>{x: new BigNumber(0), y: new BigNumber(1)})).toBe(1);
    expect(s1.comparePoint(<Point>{x: new BigNumber(1), y: new BigNumber(2)})).toBe(1);
    expect(s1.comparePoint(<Point>{x: new BigNumber(0), y: new BigNumber(0)})).toBe(0);
    expect(s1.comparePoint(<Point>{x: new BigNumber(5), y: new BigNumber(-1)})).toBe(-1);

    expect(s2.comparePoint(<Point>{x: new BigNumber(0), y: new BigNumber(1)})).toBe(0);
    expect(s2.comparePoint(<Point>{x: new BigNumber(1), y: new BigNumber(2)})).toBe(-1);
    expect(s2.comparePoint(<Point>{x: new BigNumber(0), y: new BigNumber(0)})).toBe(0);
    expect(s2.comparePoint(<Point>{x: new BigNumber(5), y: new BigNumber(-1)})).toBe(-1);
  });

  test("barely above", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(2), y: new BigNumber(1).minus(new BigNumber(Number.EPSILON))};
    expect(s1.comparePoint(pt)).toBe(-1);
  });

  test("barely below", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{
      x: new BigNumber(2),
      y: new BigNumber(1).plus(new BigNumber(Number.EPSILON).times(new BigNumber(3)).div(new BigNumber(2)))
    };
    expect(s1.comparePoint(pt)).toBe(1);
  });

  test("vertical before", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("vertical after", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(2), y: new BigNumber(0)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("vertical on", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(1), y: new BigNumber(0)};
    expect(seg.comparePoint(pt)).toBe(0);
  });

  test("horizontal below", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(0)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("horizontal above", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("horizontal on", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(1)};
    expect(seg.comparePoint(pt)).toBe(0);
  });

  test("in vertical plane below", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(2), y: new BigNumber(0)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("in vertical plane above", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(2), y: new BigNumber(4)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("in horizontal plane upward sloping before", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("in horizontal plane upward sloping after", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(4), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("in horizontal plane downward sloping before", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("in horizontal plane downward sloping after", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(4), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("upward more vertical before", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(6)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("upward more vertical after", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(6)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(4), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("downward more vertical before", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(6)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(-1);
  });

  test("downward more vertical after", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(6)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(4), y: new BigNumber(2)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("downward-slopping segment with almost touching point - from issue 37", () => {
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(0.523985), y: new BigNumber(51.281651)},
      <Point>{x: new BigNumber(0.5241), y: new BigNumber(51.281651000100005)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(0.5239850000000027), y: new BigNumber(51.281651000000004)};
    expect(seg.comparePoint(pt)).toBe(1);
  });

  test("avoid splitting loops on near vertical segments - from issue 60-2", () => {
    precision.set(Number.EPSILON);
    const seg = Segment.fromRing(
      <Point>{x: new BigNumber(-45.3269382), y: new BigNumber(-1.4059341)},
      <Point>{x: new BigNumber(-45.326737413921656), y: new BigNumber(-1.40635)},
      undefined!
    );
    const pt = <Point>{x: new BigNumber(-45.326833968900424), y: new BigNumber(-1.40615)};
    expect(seg.comparePoint(pt)).toBe(0);
    precision.set();
  });
});

describe("get intersections 2", () => {
  test("colinear full overlap", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("colinear partial overlap upward slope", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("colinear partial overlap downward slope", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(2)},
      <Point>{x: new BigNumber(2), y: new BigNumber(0)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(-1), y: new BigNumber(3)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("colinear partial overlap horizontal", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(1)},
      <Point>{x: new BigNumber(2), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("colinear partial overlap vertical", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(0), y: new BigNumber(3)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(2)},
      <Point>{x: new BigNumber(0), y: new BigNumber(4)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(0), y: new BigNumber(2)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("colinear endpoint overlap", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("colinear no overlap", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("parallel no overlap", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(3)},
      <Point>{x: new BigNumber(1), y: new BigNumber(4)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("intersect general", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(2)},
      <Point>{x: new BigNumber(2), y: new BigNumber(0)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("T-intersect with an endpoint", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(5), y: new BigNumber(4)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("intersect with vertical", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(5), y: new BigNumber(5)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(0)},
      <Point>{x: new BigNumber(3), y: new BigNumber(44)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(3), y: new BigNumber(3)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("intersect with horizontal", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(5), y: new BigNumber(5)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(3)},
      <Point>{x: new BigNumber(23), y: new BigNumber(3)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(3), y: new BigNumber(3)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("horizontal and vertical T-intersection", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(5), y: new BigNumber(0)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(0)},
      <Point>{x: new BigNumber(3), y: new BigNumber(5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(3), y: new BigNumber(0)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("horizontal and vertical general intersection", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(5), y: new BigNumber(0)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(-5)},
      <Point>{x: new BigNumber(3), y: new BigNumber(5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(3), y: new BigNumber(0)};
    expect(s1.getIntersection(s2)).toMatchObject(inter);
    expect(s2.getIntersection(s1)).toMatchObject(inter);
  });

  test("no intersection not even close", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(1000), y: new BigNumber(10002)},
      <Point>{x: new BigNumber(2000), y: new BigNumber(20002)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(-234), y: new BigNumber(-123)},
      <Point>{x: new BigNumber(-12), y: new BigNumber(-23)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("no intersection kinda close", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(10)},
      <Point>{x: new BigNumber(10), y: new BigNumber(0)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("no intersection with vertical touching bbox", () => {
    const s1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      undefined!
    );
    const s2 = Segment.fromRing(
      <Point>{x: new BigNumber(2), y: new BigNumber(-5)},
      <Point>{x: new BigNumber(2), y: new BigNumber(0)},
      undefined!
    );
    expect(s1.getIntersection(s2)).toBeNull();
    expect(s2.getIntersection(s1)).toBeNull();
  });

  test("shared point 1 (endpoint)", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("shared point 2 (endpoint)", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("T-crossing left endpoint", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0.5), y: new BigNumber(0.5)},
      <Point>{x: new BigNumber(1), y: new BigNumber(0)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(0.5), y: new BigNumber(0.5)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("T-crossing right endpoint", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0.5), y: new BigNumber(0.5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(0.5), y: new BigNumber(0.5)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("full overlap", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(10), y: new BigNumber(10)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(5), y: new BigNumber(5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("shared point + overlap", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(10), y: new BigNumber(10)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(5), y: new BigNumber(5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(5), y: new BigNumber(5)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("mutual overlap", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(3)},
      <Point>{x: new BigNumber(10), y: new BigNumber(10)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(5), y: new BigNumber(5)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(3), y: new BigNumber(3)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("full overlap", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("full overlap, orientation", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("colinear, shared point", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("colinear, shared other point", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("colinear, one encloses other", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(1)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("colinear, one encloses other 2", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(4), y: new BigNumber(0)},
      <Point>{x: new BigNumber(0), y: new BigNumber(4)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(3), y: new BigNumber(1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(3)},
      undefined!
    );
    const inter = <Record<"x" | "y", BigNumber>>{x: new BigNumber(1), y: new BigNumber(3)};
    expect(a.getIntersection(b)).toMatchObject(inter);
    expect(b.getIntersection(a)).toMatchObject(inter);
  });

  test("colinear, no overlap", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(2), y: new BigNumber(2)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("parallel", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(-1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(0)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("parallel, orientation", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(-1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(0)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("parallel, position", () => {
    const a = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(-1)},
      <Point>{x: new BigNumber(1), y: new BigNumber(0)},
      undefined!
    );
    const b = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(1), y: new BigNumber(1)},
      undefined!
    );
    expect(a.getIntersection(b)).toBeNull();
    expect(b.getIntersection(a)).toBeNull();
  });

  test("endpoint intersections should be consistent - issue 60", () => {
    precision.set(Number.EPSILON);
    // If segment A T-intersects segment B, then the non-intersecting endpoint
    // of segment A should be irrelevant to the intersection of the two segs
    // From https://github.com/mfogel/polygon-clipping/issues/60
    const x = new BigNumber(-91.41360941065206),
      y = new BigNumber(29.53135);
    const segA1 = Segment.fromRing(
      <Point>{x: x, y: y},
      <Point>{x: new BigNumber(-91.4134943), y: new BigNumber(29.5310677)},
      undefined!
    );
    const segA2 = Segment.fromRing(
      <Point>{x: x, y: y},
      <Point>{x: new BigNumber(-91.413), y: new BigNumber(29.5315)},
      undefined!
    );
    const segB = Segment.fromRing(
      <Point>{x: new BigNumber(-91.4137213), y: new BigNumber(29.5316244)},
      <Point>{x: new BigNumber(-91.41352785864918), y: new BigNumber(29.53115)},
      undefined!
    );

    expect(segA1.getIntersection(segB)).toMatchObject(<Record<"x" | "y", BigNumber>>{x: x, y: y});
    expect(segA2.getIntersection(segB)).toMatchObject(<Record<"x" | "y", BigNumber>>{x: x, y: y});
    expect(segB.getIntersection(segA1)).toMatchObject(<Record<"x" | "y", BigNumber>>{x: x, y: y});
    expect(segB.getIntersection(segA2)).toMatchObject(<Record<"x" | "y", BigNumber>>{x: x, y: y});
    precision.set();
  });

  test("endpoint intersection takes priority - issue 60-5", () => {
    const endX = new BigNumber(55.31);
    const endY = new BigNumber(-0.23544126113);
    const segA = Segment.fromRing(
      <Point>{x: new BigNumber(18.60315316392773), y: new BigNumber(10.491431056669754)},
      <Point>{x: endX, y: endY},
      undefined!
    );
    const segB = Segment.fromRing(
      <Point>{x: new BigNumber(-32.42), y: new BigNumber(55.26)},
      <Point>{x: endX, y: endY},
      undefined!
    );

    expect(segA.getIntersection(segB)).toBeNull();
    expect(segB.getIntersection(segA)).toBeNull();
  });

  test("endpoint intersection between very short and very vertical segment", () => {
    const segA = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000004), y: new BigNumber(0)},
      <Point>{x: new BigNumber(-9.999999999999995), y: new BigNumber(0)},
      undefined!
    );
    const segB = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000004), y: new BigNumber(0)},
      <Point>{x: new BigNumber(-9.999999999999995), y: new BigNumber(1000)},
      undefined!
    );
    expect(segA.getIntersection(segB)).toBeNull();
    expect(segB.getIntersection(segA)).toBeNull();
  });

  test("avoid intersection - issue 79", () => {
    const segA = Segment.fromRing(
      <Point>{x: new BigNumber(145.854148864746), y: new BigNumber(-41.99816840491791)},
      <Point>{x: new BigNumber(145.85421323776), y: new BigNumber(-41.9981723915721)},
      undefined!
    );
    const segB = Segment.fromRing(
      <Point>{x: new BigNumber(145.854148864746), y: new BigNumber(-41.998168404918)},
      <Point>{x: new BigNumber(145.8543), y: new BigNumber(-41.9982)},
      undefined!
    );
    expect(segA.getIntersection(segB)).toBeNull();
    expect(segB.getIntersection(segA)).toBeNull();
  });
});

describe("compare segments", () => {
  describe("non intersecting", () => {
    test("not in same vertical space", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(1), y: new BigNumber(1)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(4), y: new BigNumber(3)},
        <Point>{x: new BigNumber(6), y: new BigNumber(7)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("in same vertical space, earlier is below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(-4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(1)},
        <Point>{x: new BigNumber(6), y: new BigNumber(7)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("in same vertical space, later is below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(-4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-5), y: new BigNumber(-5)},
        <Point>{x: new BigNumber(6), y: new BigNumber(-7)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("with left points in same vertical line", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(-1)},
        <Point>{x: new BigNumber(-5), y: new BigNumber(-5)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("with earlier right point directly under later left point", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-5), y: new BigNumber(-5)},
        <Point>{x: new BigNumber(0), y: new BigNumber(-3)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("with eariler right point directly over earlier left point", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-5), y: new BigNumber(5)},
        <Point>{x: new BigNumber(0), y: new BigNumber(3)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });
  });

  describe("intersecting not on endpoint", () => {
    test("earlier comes up from before & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(-5)},
        <Point>{x: new BigNumber(1), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("earlier comes up from directly over & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(3), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("earlier comes up from after & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(3), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("later comes down from before & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(5)},
        <Point>{x: new BigNumber(1), y: new BigNumber(-2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("later comes up from directly over & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(2)},
        <Point>{x: new BigNumber(3), y: new BigNumber(-2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("later comes up from after & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(2)},
        <Point>{x: new BigNumber(3), y: new BigNumber(-2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("with a vertical", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(1), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });
  });

  describe("intersect but not share on an endpoint", () => {
    test("intersect on right", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(2), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(6), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("intersect on left from above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-2), y: new BigNumber(2)},
        <Point>{x: new BigNumber(2), y: new BigNumber(-2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("intersect on left from below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-2), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(2), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("intersect on left from vertical", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(0), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });
  });

  describe("share right endpoint", () => {
    test("earlier comes up from before & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(-5)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("earlier comes up from directly over & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("earlier comes up from after & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(-2)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("later comes down from before & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(5)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("laterjcomes up from directly over & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(2)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });

    test("later comes up from after & above", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(1), y: new BigNumber(2)},
        <Point>{x: new BigNumber(4), y: new BigNumber(0)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(-1);
      expect(Segment.compare(seg2, seg1)).toBe(1);
    });
  });

  describe("share left endpoint but not colinear", () => {
    test("earlier comes up from before & below", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("one vertical, other not", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(0), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("one segment thinks theyre colinear, but the other says no", () => {
      precision.set(Number.EPSILON);
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(-60.6876), y: new BigNumber(-40.83428174062278)},
        <Point>{x: new BigNumber(-60.6841701), y: new BigNumber(-40.83491)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-60.6876), y: new BigNumber(-40.83428174062278)},
        <Point>{x: new BigNumber(-60.6874), y: new BigNumber(-40.83431837489067)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
      precision.set();
    });
  });

  describe("colinear", () => {
    test("partial mutal overlap", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(-1)},
        <Point>{x: new BigNumber(2), y: new BigNumber(2)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("complete overlap", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(-1)},
        <Point>{x: new BigNumber(5), y: new BigNumber(5)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("right endpoints match", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(-1), y: new BigNumber(-1)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        undefined!
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);
    });

    test("left endpoints match - should be length", () => {
      const seg1 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(4), y: new BigNumber(4)},
        {id: 1} as unknown as RingIn
      );
      const seg2 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(3), y: new BigNumber(3)},
        {id: 2} as unknown as RingIn
      );
      const seg3 = Segment.fromRing(
        <Point>{x: new BigNumber(0), y: new BigNumber(0)},
        <Point>{x: new BigNumber(5), y: new BigNumber(5)},
        {id: 3} as unknown as RingIn
      );
      expect(Segment.compare(seg1, seg2)).toBe(1);
      expect(Segment.compare(seg2, seg1)).toBe(-1);

      expect(Segment.compare(seg2, seg3)).toBe(-1);
      expect(Segment.compare(seg3, seg2)).toBe(1);

      expect(Segment.compare(seg1, seg3)).toBe(-1);
      expect(Segment.compare(seg3, seg1)).toBe(1);
    });
  });

  test("exactly equal segments should be sorted by ring id", () => {
    const seg1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      {id: 1} as unknown as RingIn
    );
    const seg2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      {id: 2} as unknown as RingIn
    );
    expect(Segment.compare(seg1, seg2)).toBe(-1);
    expect(Segment.compare(seg2, seg1)).toBe(1);
  });

  test("exactly equal segments (but not identical) are consistent", () => {
    const seg1 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      {id: 1} as unknown as RingIn
    );
    const seg2 = Segment.fromRing(
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      <Point>{x: new BigNumber(4), y: new BigNumber(4)},
      {id: 1} as unknown as RingIn
    );
    const result = Segment.compare(seg1, seg2);
    expect(Segment.compare(seg1, seg2)).toBe(result);
    expect(Segment.compare(seg2, seg1)).toBe(result * -1);
  });

  test("segment consistency - from #60", () => {
    const seg1 = Segment.fromRing(
      <Point>{x: new BigNumber(-131.57153657554915), y: new BigNumber(55.01963125)},
      <Point>{x: new BigNumber(-131.571478), y: new BigNumber(55.0187174)},
      undefined!
    );
    const seg2 = Segment.fromRing(
      <Point>{x: new BigNumber(-131.57153657554915), y: new BigNumber(55.01963125)},
      <Point>{x: new BigNumber(-131.57152375603846), y: new BigNumber(55.01943125)},
      undefined!
    );
    expect(Segment.compare(seg1, seg2)).toBe(-1);
    expect(Segment.compare(seg2, seg1)).toBe(1);
  });

  test("ensure transitive - part of issue 60", () => {
    const seg2 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000018), y: new BigNumber(-9.17)},
      <Point>{x: new BigNumber(-10.000000000000004), y: new BigNumber(-8.79)},
      undefined!
    );
    const seg6 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000016), y: new BigNumber(1.44)},
      <Point>{x: new BigNumber(-9), y: new BigNumber(1.5)},
      undefined!
    );
    const seg4 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.00000000000001), y: new BigNumber(1.75)},
      <Point>{x: new BigNumber(-9), y: new BigNumber(1.5)},
      undefined!
    );

    expect(Segment.compare(seg2, seg6)).toBe(-1);
    expect(Segment.compare(seg6, seg4)).toBe(-1);
    expect(Segment.compare(seg2, seg4)).toBe(-1);

    expect(Segment.compare(seg6, seg2)).toBe(1);
    expect(Segment.compare(seg4, seg6)).toBe(1);
    expect(Segment.compare(seg4, seg2)).toBe(1);
  });

  test("ensure transitive 2 - also part of issue 60", () => {
    const seg1 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000002), y: new BigNumber(1.8181818181818183)},
      <Point>{x: new BigNumber(-9.999999999999996), y: new BigNumber(-3)},
      undefined!
    );
    const seg2 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000002), y: new BigNumber(1.8181818181818183)},
      <Point>{x: new BigNumber(0), y: new BigNumber(0)},
      undefined!
    );
    const seg3 = Segment.fromRing(
      <Point>{x: new BigNumber(-10.000000000000002), y: new BigNumber(1.8181818181818183)},
      <Point>{x: new BigNumber(-10.000000000000002), y: new BigNumber(2)},
      undefined!
    );

    expect(Segment.compare(seg1, seg2)).toBe(-1);
    expect(Segment.compare(seg2, seg3)).toBe(-1);
    expect(Segment.compare(seg1, seg3)).toBe(-1);

    expect(Segment.compare(seg2, seg1)).toBe(1);
    expect(Segment.compare(seg3, seg2)).toBe(1);
    expect(Segment.compare(seg3, seg1)).toBe(1);
  });
});
