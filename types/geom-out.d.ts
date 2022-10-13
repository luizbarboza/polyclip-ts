import Segment from "./segment.js";
import SweepEvent from "./sweep-event.js";
export declare class RingOut {
    events: SweepEvent[];
    poly: PolyOut | null;
    _isExteriorRing: boolean | undefined;
    _enclosingRing: RingOut | null | undefined;
    static factory(allSegments: Segment[]): RingOut[];
    constructor(events: SweepEvent[]);
    getGeom(): number[][] | null;
    isExteriorRing(): boolean;
    enclosingRing(): RingOut | null | undefined;
    _calcEnclosingRing(): RingOut | null | undefined;
}
export declare class PolyOut {
    exteriorRing: RingOut;
    interiorRings: RingOut[];
    constructor(exteriorRing: RingOut);
    addInterior(ring: RingOut): void;
    getGeom(): (number[][] | null)[] | null;
}
export declare class MultiPolyOut {
    rings: RingOut[];
    polys: PolyOut[];
    constructor(rings: RingOut[]);
    getGeom(): (number[][] | null)[][];
    _composePolys(rings: RingOut[]): PolyOut[];
}
