import { SplayTreeSet } from "splaytree-ts";
import Segment from "./segment.js";
import SweepEvent, { Point } from "./sweep-event.js";
/**
 * NOTE:  We must be careful not to change any segments while
 *        they are in the SplayTree. AFAIK, there's no way to tell
 *        the tree to rebalance itself - thus before splitting
 *        a segment that's in the tree, we remove it from the tree,
 *        do the split, then re-insert it. (Even though splitting a
 *        segment *shouldn't* change its correct position in the
 *        sweep line tree, the reality is because of rounding errors,
 *        it sometimes does.)
 */
export default class SweepLine {
    private queue;
    private tree;
    segments: Segment[];
    constructor(queue: SplayTreeSet<SweepEvent>, comparator?: typeof Segment.compare);
    process(event: SweepEvent): SweepEvent[];
    _splitSafely(seg: Segment, pt: Point): SweepEvent[];
}
