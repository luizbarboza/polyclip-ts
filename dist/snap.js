import BigNumber from "bignumber.js";
import { SplayTreeSet } from "splaytree-ts";
import compare from "./compare.js";
import identity from "./identity.js";
export default (eps) => {
    if (eps) {
        const xTree = new SplayTreeSet(compare(eps));
        const yTree = new SplayTreeSet(compare(eps));
        const snapCoord = (coord, tree) => {
            tree.add(coord);
            return tree.lookup(coord);
        };
        const snap = (v) => {
            return {
                x: snapCoord(v.x, xTree),
                y: snapCoord(v.y, yTree),
            };
        };
        snap({ x: new BigNumber(0), y: new BigNumber(0) });
        return snap;
    }
    return identity;
};
