/* eslint no-console: "off" */

import fs from "fs"
import Benchmark from "benchmark"
import UnionOp from "jsts/org/locationtech/jts/operation/union/UnionOp.js"
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js"
import w8r from "martinez-polygon-clipping"
import * as polyclip from "polyclip-ts"

const options = {
  onStart() {
    console.log(this.name)
  },
  onError(event) {
    console.log(event.target.error)
  },
  onCycle(event) {
    console.log(String(event.target))
  },
  onComplete() {
    console.log("- Fastest is " + this.filter("fastest").map("name") + "\n")
  },
}

// JSTS reader to reuse.
const reader = new GeoJSONReader()

const holeHole = JSON.parse(fs.readFileSync("./bench/fixtures/hole_hole.geojson"))
new Benchmark.Suite("Hole_Hole", options)
  .add("polyclip-ts", () => {
    polyclip.union(
      holeHole.features[0].geometry.coordinates,
      holeHole.features[1].geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      holeHole.features[0].geometry.coordinates,
      holeHole.features[1].geometry.coordinates,
    )
  })
  .add("JSTS", () => {
    UnionOp.union(
      reader.read(holeHole.features[0].geometry),
      reader.read(holeHole.features[1].geometry),
    );
  })
  .run()

const asia = JSON.parse(fs.readFileSync("./bench/fixtures/asia.geojson"))
const unionPoly = JSON.parse(fs.readFileSync("./bench/fixtures/asia_unionPoly.geojson"))
new Benchmark.Suite("Asia union", options)
  .add("polyclip-ts", () => {
    polyclip.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      asia.features[0].geometry.coordinates,
      unionPoly.geometry.coordinates,
    )
  })
   .add("JSTS", () => {
      UnionOp.union(
        reader.read(asia.features[0].geometry),
        reader.read(unionPoly.geometry),
      )
    })
  .run()

const states = JSON.parse(fs.readFileSync("./bench/fixtures/states_source.geojson"));
new Benchmark.Suite("States clip", options)
  .add("polyclip-ts", () => {
    polyclip.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates,
    )
  })
  .add("w8r", () => {
    w8r.union(
      states.features[0].geometry.coordinates,
      states.features[1].geometry.coordinates,
    )
  })
  .add("JSTS", () => {
    UnionOp.union(
      reader.read(states.features[0].geometry),
      reader.read(states.features[1].geometry),
    )
  })
  .run()
