import { MultiPolyIn, RingIn } from "./geom-in.js";
import { RingOut } from "./geom-out.js";
import SweepEvent, { Point } from "./sweep-event.js";
interface State {
    rings: RingIn[];
    windings: number[];
    multiPolys: MultiPolyIn[];
}
export default class Segment {
    id: number;
    leftSE: SweepEvent;
    rightSE: SweepEvent;
    rings: RingIn[] | null;
    windings: number[] | null;
    ringOut: RingOut | undefined;
    consumedBy: Segment | undefined;
    prev: Segment | null | undefined;
    _prevInResult: Segment | null | undefined;
    _beforeState: State | undefined;
    _afterState: State | undefined;
    _isInResult: boolean | undefined;
    static compare(a: Segment, b: Segment): number;
    constructor(leftSE: SweepEvent, rightSE: SweepEvent, rings: RingIn[], windings: number[]);
    static fromRing(pt1: Point, pt2: Point, ring: RingIn): Segment;
    replaceRightSE(newRightSE: SweepEvent): void;
    bbox(): {
        ll: {
            x: import("bignumber.js").BigNumber;
            y: import("bignumber.js").BigNumber;
        };
        ur: {
            x: import("bignumber.js").BigNumber;
            y: import("bignumber.js").BigNumber;
        };
    };
    vector(): {
        x: import("bignumber.js").BigNumber;
        y: import("bignumber.js").BigNumber;
    };
    isAnEndpoint(pt: Point): boolean;
    comparePoint(point: Point): number;
    /**
     * Given another segment, returns the first non-trivial intersection
     * between the two segments (in terms of sweep line ordering), if it exists.
     *
     * A 'non-trivial' intersection is one that will cause one or both of the
     * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
     *
     *   * endpoint of segA with endpoint of segB --> trivial
     *   * endpoint of segA with point along segB --> non-trivial
     *   * endpoint of segB with point along segA --> non-trivial
     *   * point along segA with point along segB --> non-trivial
     *
     * If no non-trivial intersection exists, return null
     * Else, return null.
     */
    getIntersection(other: Segment): Point | null;
    /**
     * Split the given segment into multiple segments on the given points.
     *  * Each existing segment will retain its leftSE and a new rightSE will be
     *    generated for it.
     *  * A new segment will be generated which will adopt the original segment's
     *    rightSE, and a new leftSE will be generated for it.
     *  * If there are more than two points given to split on, new segments
     *    in the middle will be generated with new leftSE and rightSE's.
     *  * An array of the newly generated SweepEvents will be returned.
     *
     * Warning: input array of points is modified
     */
    split(point: Point): SweepEvent[];
    swapEvents(): void;
    consume(other: Segment): void;
    prevInResult(): Segment | null | undefined;
    beforeState(): State;
    afterState(): State;
    isInResult(): boolean | undefined;
}
export {};
