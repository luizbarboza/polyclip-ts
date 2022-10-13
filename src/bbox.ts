import { Vector } from "./vector.js";

export interface Bbox {
  ll: Vector;
  ur: Vector;
}

/**
 * A bounding box has the format:
 *
 *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
 *
 */

export const isInBbox = (bbox: Bbox, point: Vector) => {
  return (
    bbox.ll.x.isLessThanOrEqualTo(point.x) &&
    point.x.isLessThanOrEqualTo(bbox.ur.x) &&
    bbox.ll.y.isLessThanOrEqualTo(point.y) &&
    point.y.isLessThanOrEqualTo(bbox.ur.y) 
  )
}

/* Returns either null, or a bbox (aka an ordered pair of points)
 * If there is only one point of overlap, a bbox with identical points
 * will be returned */
export const getBboxOverlap = (b1: Bbox, b2: Bbox) => {
  // check if the bboxes overlap at all
  if (
    b2.ur.x.isLessThan(b1.ll.x) ||
    b1.ur.x.isLessThan(b2.ll.x) ||
    b2.ur.y.isLessThan(b1.ll.y) ||
    b1.ur.y.isLessThan(b2.ll.y) 
  )
    return null

  // find the middle two X values
  const lowerX = b1.ll.x.isLessThan(b2.ll.x) ? b2.ll.x : b1.ll.x
  const upperX = b1.ur.x.isLessThan(b2.ur.x) ? b1.ur.x : b2.ur.x

  // find the middle two Y values
  const lowerY = b1.ll.y.isLessThan(b2.ll.y) ? b2.ll.y : b1.ll.y
  const upperY = b1.ur.y.isLessThan(b2.ur.y) ? b1.ur.y : b2.ur.y

  // put those middle values together to get the overlap
  return { ll: { x: lowerX, y: lowerY }, ur: { x: upperX, y: upperY } } as Bbox
}
