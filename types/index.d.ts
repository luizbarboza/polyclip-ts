import { Geom } from "./geom-in.js";
declare const _default: {
    union: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
    intersection: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
    xor: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
    difference: (subjectGeom: Geom, ...clippingGeoms: Geom[]) => (number[][] | null)[][];
    setPrecision: (eps?: number | undefined) => {
        set: any;
        reset: () => any;
        compare: (a: import("bignumber.js").BigNumber, b: import("bignumber.js").BigNumber) => number;
        snap: (v: import("./vector.js").Vector) => import("./vector.js").Vector;
        orient: (a: import("./vector.js").Vector, b: import("./vector.js").Vector, c: import("./vector.js").Vector) => number;
    };
};
export default _default;
