import Segment from "./segment.js";
import { Vector } from "./vector.js";
export interface Point extends Vector {
    events: SweepEvent[];
}
export default class SweepEvent {
    point: Point;
    isLeft: boolean;
    segment: Segment;
    otherSE: SweepEvent;
    consumedBy: SweepEvent | undefined;
    static compare(a: SweepEvent, b: SweepEvent): number;
    static comparePoints(aPt: Point, bPt: Point): 1 | -1 | 0;
    constructor(point: Point, isLeft: boolean);
    link(other: SweepEvent): void;
    checkForConsuming(): void;
    getAvailableLinkedEvents(): SweepEvent[];
    /**
     * Returns a comparator function for sorting linked events that will
     * favor the event that will give us the smallest left-side angle.
     * All ring construction starts as low as possible heading to the right,
     * so by always turning left as sharp as possible we'll get polygons
     * without uncessary loops & holes.
     *
     * The comparator function has a compute cache such that it avoids
     * re-computing already-computed values.
     */
    getLeftmostComparator(baseEvent: SweepEvent): (a: SweepEvent, b: SweepEvent) => 1 | -1 | 0;
}
