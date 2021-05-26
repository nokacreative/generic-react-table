import { getNestedValue } from './general'

describe('Utils - General', () => {
  describe('getNestedValue()', () => {
    const nestedObject = {
      a: {
        aa: 'aaValue',
        ab: {
          abc: 'abcValue',
        },
      },
      b: 'bValue',
      c: ['a', 'b', 'c'],
      d: {
        lvl2: {
          lvl3: {
            arr: [1, 2, 3, 4, 5],
          },
          nope: 'asdf',
        },
      },
    }

    it('returns the correct value for a root-level path', () => {
      const result = getNestedValue(nestedObject, 'b')
      expect(result).toEqual(nestedObject.b)
    })

    it('returns the correct value for a level 2 (1 nesting level) path', () => {
      const result = getNestedValue(nestedObject, 'a.aa')
      expect(result).toEqual(nestedObject.a.aa)
    })

    it('returns the correct value for a level 3 (2 nesting levels) path', () => {
      const result = getNestedValue(nestedObject, 'a.ab.abc')
      expect(result).toEqual(nestedObject.a.ab.abc)
    })

    it('returns the correct value for array index access', () => {
      const firstItem = getNestedValue(nestedObject, 'c.0')
      expect(firstItem).toEqual(nestedObject.c[0])

      const secondItem = getNestedValue(nestedObject, 'c.1')
      expect(secondItem).toEqual(nestedObject.c[1])

      const thirdItem = getNestedValue(nestedObject, 'c.2')
      expect(thirdItem).toEqual(nestedObject.c[2])
    })

    it('returns the correct value for complex paths (combines all of the above)', () => {
      const result = getNestedValue(nestedObject, 'd.lvl2.lvl3.arr.3')
      expect(result).toEqual(nestedObject.d.lvl2.lvl3.arr[3])
    })
  })
})
