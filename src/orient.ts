import BigNumber from "bignumber.js";
import constant from "./constant.js";
import { Vector } from "./vector.js";

export default function (eps?: number) {
    const almostCollinear = eps ? (area2: BigNumber, ax: BigNumber, ay: BigNumber, cx: BigNumber, cy: BigNumber) =>
        area2.exponentiatedBy(2).isLessThanOrEqualTo(
            cx.minus(ax).exponentiatedBy(2).plus(cy.minus(ay).exponentiatedBy(2))
                .times(eps))
        : constant(false)

    return (a: Vector, b: Vector, c: Vector) => {
        const ax = a.x, ay = a.y, cx = c.x, cy = c.y

        const area2 = ay.minus(cy).times(b.x.minus(cx)).minus(ax.minus(cx).times(b.y.minus(cy)))

        if (almostCollinear(area2, ax, ay, cx, cy)) return 0

        return area2.comparedTo(0)
    }
}