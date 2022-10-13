import { Vector } from "./vector.js";
export interface Bbox {
    ll: Vector;
    ur: Vector;
}
/**
 * A bounding box has the format:
 *
 *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
 *
 */
export declare const isInBbox: (bbox: Bbox, point: Vector) => boolean;
export declare const getBboxOverlap: (b1: Bbox, b2: Bbox) => Bbox | null;
