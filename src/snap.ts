import BigNumber from "bignumber.js";
import { SplayTreeSet } from "splaytree-ts"
import compare from "./compare.js";
import identity from "./identity.js";
import { Vector } from "./vector.js";

export default (eps?: number) => {
  if (eps) {

    const xTree = new SplayTreeSet(compare(eps))
    const yTree = new SplayTreeSet(compare(eps))

    const snapCoord = (coord: BigNumber, tree: SplayTreeSet<BigNumber>) => {
      return tree.addAndReturn(coord)
    }

    const snap = (v: Vector) => {
      return {
        x: snapCoord(v.x, xTree),
        y: snapCoord(v.y, yTree),
      } as Vector
    }

    snap({ x: new BigNumber(0), y: new BigNumber(0)})

    return snap
  }

  return identity<Vector>
}