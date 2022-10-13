import { Geom } from "./geom-in.js"
import { precision } from "./precision.js"
import operation from "./operation.js"

const union = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("union", geom, moreGeoms)

const intersection = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("intersection", geom, moreGeoms)

const xor = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("xor", geom, moreGeoms)

const difference = (subjectGeom: Geom, ...clippingGeoms: Geom[]) =>
  operation.run("difference", subjectGeom, clippingGeoms)

export default {
  union: union,
  intersection: intersection,
  xor: xor,
  difference: difference,
  setPrecision: precision.set
}
