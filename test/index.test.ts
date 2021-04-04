import { hook } from '../src/index'
import * as assert from 'assert'

describe('hook', () => {
  describe('if object does not contain method', () => {
    it('should not do anything', () => {
      const fn = () => {}
      hook(undefined, '', fn)
      hook(null, '', fn)
      hook({ fn }, 'f', fn)
      assert.ok(true)
    })
  })

  describe('to setter', () => {
    class HasSetter {
      _val: number
      constructor (val: number) {
        this._val = val
      }

      get val (): number {
        return this._val
      }

      set val (value: number) {
        this._val = value
      }
    }

    it('should invoke callback whenever setter gets invoked', () => {
      const data: string[] = []
      const obj = new HasSetter(0)
      obj.val = 1
      hook(obj, 'val', () => data.push('foo'))
      assert.deepStrictEqual(data, [])

      obj.val = 2
      assert.strictEqual(obj.val, 2)
      assert.deepStrictEqual(data, ['foo'])
    })

    it('getter should still work', () => {
      const obj = new HasSetter(0)
      hook(obj, 'val', () => {})
      obj.val = 3
      assert.strictEqual(obj.val, 3)
      obj.val = 4
      assert.strictEqual(obj.val, 4)
    })
  })

  describe('if object contains property but is not a method', () => {
    it('should not do anything', () => {
      const obj = { foo: 'foo' }
      hook(obj, 'foo', () => assert.ok(false))
      assert.strictEqual(obj.foo, 'foo')
    })
  })

  describe('if object contains method', () => {
    it('should invoke callback whenever method gets called', () => {
      const data: string[] = []
      const obj = { foo: () => data.push('foo') }
      obj.foo()
      assert.deepStrictEqual(data, ['foo'])
      hook(obj, 'foo', () => data.push('bar'))
      obj.foo()
      assert.deepStrictEqual(data, ['foo', 'foo', 'bar'])
    })

    it('should not change the name of the method', () => {
      const obj = { foo: () => {} }
      assert.strictEqual(obj.foo.name, 'foo')
      hook(obj, 'foo', function bar () {})
      assert.strictEqual(obj.foo.name, 'foo')
    })

    it('replacement method should still return the original value', () => {
      const obj = { foo: () => 'foo' }
      assert.strictEqual(obj.foo(), 'foo')
      hook(obj, 'foo', () => 'bar')
      assert.strictEqual(obj.foo(), 'foo')
    })
  })
})
