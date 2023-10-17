# polyclip-ts

Apply boolean polygon clipping operations (`intersection`, `union`, `difference`, `xor`) to your Polygons & MultiPolygons.

## Installing

If you use npm, `npm install polyclip-ts`. You can also download the [latest release on GitHub](https://github.com/luizbarboza/polyclip-ts/tags). For vanilla HTML in modern browsers, import polyclip-ts from Skypack:

```html
<script type="module">
import * as polyclip from "https://cdn.skypack.dev/polyclip-ts";

polyclip.intersection(…)
</script>
```

For legacy environments, you can load polyclip-ts’s UMD bundle from an npm-based CDN such as jsDelivr; a polyclip global is exported:

```html
<script src="https://cdn.jsdelivr.net/npm/polyclip-ts/dist/polyclip-ts.umd.min.js"></script>
<script>
polyclip.intersection(…)
</script>
```

## Quickstart

<!-- prettier-ignore-start -->
```javascript
import * as polyclip from "polyclip-ts"

const poly1 = [[[0,0],[2,0],[0,2],[0,0]]]
const poly2 = [[[-1,0],[1,0],[0,1],[-1,0]]]

polyclip.union       (poly1, poly2 /* , poly3, ... */)
polyclip.intersection(poly1, poly2 /* , poly3, ... */)
polyclip.xor         (poly1, poly2 /* , poly3, ... */)
polyclip.difference  (poly1, poly2 /* , poly3, ... */)
```
<!-- prettier-ignore-end -->

## API

```javascript
/* All functions take one or more [multi]polygon(s) as input */

polyclip.union       (geom, ...moreGeoms)
polyclip.intersection(geom, ...moreGeoms)
polyclip.xor         (geom, ...moreGeoms)

/* The moreGeoms will be subtracted from the geom */
polyclip.difference  (geom, ...moreGeoms)
```

### Input

Each positional argument (`geom`) may be either a Polygon or a MultiPolygon. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:

- MultiPolygons may contain touching or overlapping Polygons.
- rings are not required to be self-closing.
- rings may contain repeated points, which are ignored.
- rings may be self-touching and/or self-crossing. Self-crossing rings will be interpreted using the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule).
- winding order of rings does not matter.
- inner rings may extend outside their outer ring. The portion of inner rings outside their outer ring is dropped.
- inner rings may touch or overlap each other.

### Output

For non-empty results, output will always be a MultiPolygon containing one or more non-overlapping, non-edge-sharing Polygons. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:

- outer rings will be wound counter-clockwise, and inner rings clockwise.
- inner rings will not extend outside their outer ring.
- rings will not overlap, nor share an edge with each other.
- rings will be self-closing.
- rings will not contain repeated points.
- rings will not contain superfluous points (intermediate points along a straight line).
- rings will not be self-touching nor self-crossing.
- rings _may_ touch each other, but _may not_ cross each other.

In the event that the result of the operation is the empty set, output will be a MultiPolygon with no Polygons: `[]`.

## Correctness

Run: `npm test`

The tests are broken up into unit tests and end-to-end tests. The end-to-end tests are organized as GeoJSON files, to make them easy to visualize thanks to [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/). Browse those tests [here](test/end-to-end).

## Performance

The Martinez-Rueda-Feito polygon clipping algorithm is used to compute the result in `O((n+k)*log(n))` time, where `n` is the total number of edges in all polygons involved and `k` is the number of intersections between edges.

## Authors

- [Luiz F. M. Barboza](https://github.com/SBanksX)
- [Mike Fogel](https://github.com/mfogel)
- [Alexander Milevski](https://github.com/w8r)
- [Vladimir Ovsyannikov](https://github.com/sh1ng)

## Based on

- [A simple algorithm for Boolean operations on polygons](https://www.sciencedirect.com/science/article/abs/pii/S0965997813000379) by Francisco Martinez, Antonio Jesus Rueda, Francisco Ramon Feito (2009)
