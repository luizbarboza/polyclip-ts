import compare from "./compare.js";
import orient from "./orient.js";
import snap from "./snap.js";
const set = (eps) => {
    return {
        set: (eps) => { precision = set(eps); },
        reset: () => set(eps),
        compare: compare(eps),
        snap: snap(eps),
        orient: orient(eps)
    };
};
export let precision = set();
