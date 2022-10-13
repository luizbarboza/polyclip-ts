import constant from "./constant.js";
export default (eps) => {
    const almostEqual = eps ? (a, b) => b.minus(a).abs().isLessThanOrEqualTo(eps)
        : constant(false);
    return (a, b) => {
        if (almostEqual(a, b))
            return 0;
        return a.comparedTo(b);
    };
};
