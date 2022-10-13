import { precision } from "./precision.js";
import operation from "./operation.js";
export const union = (geom, ...moreGeoms) => operation.run("union", geom, moreGeoms);
export const intersection = (geom, ...moreGeoms) => operation.run("intersection", geom, moreGeoms);
export const xor = (geom, ...moreGeoms) => operation.run("xor", geom, moreGeoms);
export const difference = (geom, ...moreGeoms) => operation.run("difference", geom, moreGeoms);
export const setPrecision = precision.set;
