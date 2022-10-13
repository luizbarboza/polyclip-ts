import { Geom } from "./geom-in.js";
export declare const union: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
export declare const intersection: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
export declare const xor: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
export declare const difference: (geom: Geom, ...moreGeoms: Geom[]) => (number[][] | null)[][];
export declare const setPrecision: (eps?: number | undefined) => void;
