import BigNumber from "bignumber.js";
import { Bbox } from "./bbox.js";
import Segment from "./segment.js";
declare type Ring = [BigNumber, BigNumber][];
export declare type Poly = Ring[];
export declare type MultiPoly = Poly[];
export declare type Geom = Poly | MultiPoly;
export declare class RingIn {
    poly: PolyIn;
    isExterior: boolean;
    segments: Segment[];
    bbox: Bbox;
    constructor(geomRing: Ring, poly: PolyIn, isExterior: boolean);
    getSweepEvents(): import("./sweep-event.js").default[];
}
export declare class PolyIn {
    multiPoly: MultiPolyIn;
    exteriorRing: RingIn;
    interiorRings: RingIn[];
    bbox: Bbox;
    constructor(geomPoly: Poly, multiPoly: MultiPolyIn);
    getSweepEvents(): import("./sweep-event.js").default[];
}
export declare class MultiPolyIn {
    isSubject: boolean;
    polys: PolyIn[];
    bbox: Bbox;
    constructor(geom: Geom, isSubject: boolean);
    getSweepEvents(): import("./sweep-event.js").default[];
}
export {};
