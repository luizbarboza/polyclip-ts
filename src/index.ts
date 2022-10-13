import { Geom } from "./geom-in.js"
import { precision } from "./precision.js"
import operation from "./operation.js"

export const union = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("union", geom, moreGeoms)

export const intersection = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("intersection", geom, moreGeoms)

export const xor = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("xor", geom, moreGeoms)

export const difference = (geom: Geom, ...moreGeoms: Geom[]) =>
  operation.run("difference", geom, moreGeoms)

export const setPrecision = precision.set