import BigNumber from "bignumber.js";
export interface Vector {
    x: BigNumber;
    y: BigNumber;
}
export declare const crossProduct: (a: Vector, b: Vector) => BigNumber;
export declare const dotProduct: (a: Vector, b: Vector) => BigNumber;
export declare const length: (v: Vector) => BigNumber;
export declare const sineOfAngle: (pShared: Vector, pBase: Vector, pAngle: Vector) => BigNumber;
export declare const cosineOfAngle: (pShared: Vector, pBase: Vector, pAngle: Vector) => BigNumber;
export declare const horizontalIntersection: (pt: Vector, v: Vector, y: BigNumber) => {
    x: BigNumber;
    y: BigNumber;
} | null;
export declare const verticalIntersection: (pt: Vector, v: Vector, x: BigNumber) => {
    x: BigNumber;
    y: BigNumber;
} | null;
export declare const intersection: (pt1: Vector, v1: Vector, pt2: Vector, v2: Vector) => Vector | null;
export declare const perpendicular: (v: Vector) => {
    x: BigNumber;
    y: BigNumber;
};
