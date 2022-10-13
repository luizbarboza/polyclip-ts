import { Geom } from "./geom-in.js";
export declare class Operation {
    type: string;
    numMultiPolys: number;
    run(type: string, geom: Geom, moreGeoms: Geom[]): (number[][] | null)[][];
}
declare const operation: Operation;
export default operation;
