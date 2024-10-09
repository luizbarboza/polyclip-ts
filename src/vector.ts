import * as bn from "bignumber.js";

export interface Vector {
  x: bn.BigNumber;
  y: bn.BigNumber;
}

/* Cross Product of two vectors with first point at origin */
export const crossProduct = (a: Vector, b: Vector) => a.x.times(b.y).minus(a.y.times(b.x))

/* Dot Product of two vectors with first point at origin */
export const dotProduct = (a: Vector, b: Vector) => a.x.times(b.x).plus(a.y.times(b.y))

export const length = (v: Vector) => dotProduct(v, v).sqrt()

/* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */
export const sineOfAngle = (pShared: Vector, pBase: Vector, pAngle: Vector) => {
  const vBase = { x: pBase.x.minus(pShared.x), y: pBase.y.minus(pShared.y) }
  const vAngle = { x: pAngle.x.minus(pShared.x), y: pAngle.y.minus(pShared.y) }
  return crossProduct(vAngle, vBase).div(length(vAngle)).div(length(vBase))
}

/* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */
export const cosineOfAngle = (pShared: Vector, pBase: Vector, pAngle: Vector) => {
  const vBase = { x: pBase.x.minus(pShared.x), y: pBase.y.minus(pShared.y) }
  const vAngle = { x: pAngle.x.minus(pShared.x), y: pAngle.y.minus(pShared.y) }
  return dotProduct(vAngle, vBase).div(length(vAngle)).div(length(vBase))
}

/* Get the x coordinate where the given line (defined by a point and vector)
 * crosses the horizontal line with the given y coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const horizontalIntersection = (pt: Vector, v: Vector, y: bn.BigNumber) => {
  if (v.y.isZero()) return null
  return { x: pt.x.plus((v.x.div(v.y)).times(y.minus(pt.y))), y: y }
}

/* Get the y coordinate where the given line (defined by a point and vector)
 * crosses the vertical line with the given x coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const verticalIntersection = (pt: Vector, v: Vector, x: bn.BigNumber) => {
  if (v.x.isZero()) return null
  return { x: x, y: pt.y.plus((v.y.div(v.x)).times(x.minus(pt.x))) }
}

/* Get the intersection of two lines, each defined by a base point and a vector.
 * In the case of parrallel lines (including overlapping ones) returns null. */
export const intersection = (pt1: Vector, v1: Vector, pt2: Vector, v2: Vector) => {
  // take some shortcuts for vertical and horizontal lines
  // this also ensures we don't calculate an intersection and then discover
  // it's actually outside the bounding box of the line
  if (v1.x.isZero()) return verticalIntersection(pt2, v2, pt1.x)
  if (v2.x.isZero()) return verticalIntersection(pt1, v1, pt2.x)
  if (v1.y.isZero()) return horizontalIntersection(pt2, v2, pt1.y)
  if (v2.y.isZero()) return horizontalIntersection(pt1, v1, pt2.y)

  // General case for non-overlapping segments.
  // This algorithm is based on Schneider and Eberly.
  // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244

  const kross = crossProduct(v1, v2)
  if (kross.isZero()) return null

  const ve = { x: pt2.x.minus(pt1.x), y: pt2.y.minus(pt1.y) }
  const d1 = crossProduct(ve, v1).div(kross)
  const d2 = crossProduct(ve, v2).div(kross)

  // take the average of the two calculations to minimize rounding error
  const x1 = pt1.x.plus(d2.times(v1.x)),
    x2 = pt2.x.plus(d1.times(v2.x))
  const y1 = pt1.y.plus(d2.times(v1.y)),
    y2 = pt2.y.plus(d1.times(v2.y))
  const x = x1.plus(x2).div(2)
  const y = y1.plus(y2).div(2)
  return { x: x, y: y } as Vector
}

/* Given a vector, return one that is perpendicular */
export const perpendicular = (v: Vector) => {
  return { x: v.y.negated(), y: v.x }
}