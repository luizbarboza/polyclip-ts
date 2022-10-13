/* eslint-env jest */

import SweepLine from "../src/sweep-line"

const comparator = (a, b) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

describe("sweep line", () => {
  test("test filling up the tree then emptying it out", () => {
    const sl = new SweepLine(null, comparator)
    const k1 = 4
    const k2 = 9
    const k3 = 13
    const k4 = 44

    sl.tree.add(k1)
    sl.tree.add(k2)
    sl.tree.add(k3)
    sl.tree.add(k4)

    let n1 = sl.tree.lookup(k1)
    let n2 = sl.tree.lookup(k2)
    let n3 = sl.tree.lookup(k3)
    let n4 = sl.tree.lookup(k4)

    expect(n1).toBe(k1)
    expect(n2).toBe(k2)
    expect(n3).toBe(k3)
    expect(n4).toBe(k4)

    expect(sl.tree.lastBefore(n1)).toBeNull()
    expect(sl.tree.firstAfter(n1)).toBe(k2)

    expect(sl.tree.lastBefore(n2)).toBe(k1)
    expect(sl.tree.firstAfter(n2)).toBe(k3)

    expect(sl.tree.lastBefore(n3)).toBe(k2)
    expect(sl.tree.firstAfter(n3)).toBe(k4)

    expect(sl.tree.lastBefore(n4)).toBe(k3)
    expect(sl.tree.firstAfter(n4)).toBeNull()

    sl.tree.delete(k2)
    expect(sl.tree.lookup(k2)).toBeNull()

    n1 = sl.tree.lookup(k1)
    n3 = sl.tree.lookup(k3)
    n4 = sl.tree.lookup(k4)

    expect(sl.tree.lastBefore(n1)).toBeNull()
    expect(sl.tree.firstAfter(n1)).toBe(k3)

    expect(sl.tree.lastBefore(n3)).toBe(k1)
    expect(sl.tree.firstAfter(n3)).toBe(k4)

    expect(sl.tree.lastBefore(n4)).toBe(k3)
    expect(sl.tree.firstAfter(n4)).toBeNull()

    sl.tree.delete(k4)
    expect(sl.tree.lookup(k4)).toBeNull()

    n1 = sl.tree.lookup(k1)
    n3 = sl.tree.lookup(k3)

    expect(sl.tree.lastBefore(n1)).toBeNull()
    expect(sl.tree.firstAfter(n1)).toBe(k3)

    expect(sl.tree.lastBefore(n3)).toBe(k1)
    expect(sl.tree.firstAfter(n3)).toBeNull()

    sl.tree.delete(k1)
    expect(sl.tree.lookup(k1)).toBeNull()

    n3 = sl.tree.lookup(k3)

    expect(sl.tree.lastBefore(n3)).toBeNull()
    expect(sl.tree.firstAfter(n3)).toBeNull()

    sl.tree.delete(k3)
    expect(sl.tree.lookup(k3)).toBeNull()
  })
})
