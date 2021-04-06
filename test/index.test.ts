import { T$, Ui, elemTo$, to$, toElem, hook, render } from '../src/index'
import * as assert from 'assert'

afterEach(function () {
  document.body.innerHTML = ''
})

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

  describe('if property is a plain variable', () => {
    it('should override the variable by a property', () => {
      let sum = 0
      const obj = { foo: 'foo' }
      assert.ok(Object.getOwnPropertyNames(obj).includes('foo'))
      hook(obj, 'foo', () => { sum += 1 })
      assert.ok(!Object.getOwnPropertyNames(obj).includes('foo'))

      assert.strictEqual(sum, 0)
      obj.foo = 'bar'
      assert.strictEqual(obj.foo, 'bar')
      assert.strictEqual(sum, 1)
      obj.foo = 'baz'
      assert.strictEqual(obj.foo, 'baz')
      assert.strictEqual(sum, 2)
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

describe('toElem', () => {
  describe('with incorrect number of top-level elements', () => {
    it('should throw error', () => {
      assert.throws(() => toElem(''))
      assert.throws(() => toElem('<input><input>'))
    })
  })

  describe('with single top-level element', () => {
    const elem = toElem(
      '<div class="test">' +
        '<span class="foo">Foo</span>' +
        '<span class="bar">Bar</span>' +
        '<span class="baz">Baz</span>' +
      '</div>'
    )
    assert.ok(elem)
    assert.strictEqual(elem.tagName, 'DIV')
    assert.strictEqual(elem.textContent, 'FooBarBaz')
    assert.strictEqual(elem.childElementCount, 3)
    assert.ok(elem.querySelector('.foo'))
    assert.ok(elem.querySelector('.bar'))
    assert.ok(elem.querySelector('.baz'))
  })
})

describe('to$ result', () => {
  const $ = to$(
    '<div class="test">' +
      '<span class="foo">Foo</span>' +
      '<span class="bar">Bar</span>' +
      '<span class="baz">Baz</span>' +
    '</div>'
  )

  describe('with no input selector', () => {
    it('should return root element', () => {
      assert.strictEqual($().tagName, 'DIV')
      assert.strictEqual($().className, 'test')
    })
  })

  describe('with input selector', () => {
    it('should query selector', () => {
      assert.strictEqual($('.foo').textContent, 'Foo')
      assert.strictEqual($('.bar').textContent, 'Bar')
      assert.strictEqual($('.baz').textContent, 'Baz')
    })
  })
})

describe('render', () => {
  describe('with element input', () => {
    const elem = toElem('<input>')

    it('should return input element', () => {
      assert.strictEqual(elem, render(elem, document.body))
    })

    it('should insert element into DOM', () => {
      render(elem, document.body)
      assert.strictEqual(document.body.firstChild, elem)
    })
  })
})

describe('Ui usage example', () => {
  describe('Countdown (version 1)', () => {
    class Countdown {
      count: number
      constructor () {
        this.count = 10
      }

      countdown () {
        this.count = this.count > 0 ? this.count - 1 : 0
      }

      update ($: T$) {
        $().textContent = this.count > 0
          ? this.count
          : 'boom!'
      }

      render () {
        const elem = toElem(`<button>${this.count}</button>`) as HTMLButtonElement
        elem.onclick = () => {
          this.countdown()
          this.update(elemTo$(elem))
        }
        return elem
      }
    }

    it('should count down to 0 and BOOM!', () => {
      const elem = new Countdown().render()
      document.body.appendChild(elem)
      for (let i = 10; i > 0; i--) {
        assert.strictEqual(document.body.textContent, String(i))
        elem.click()
      }
      assert.strictEqual(document.body.textContent, 'boom!')
      elem.click()
      assert.strictEqual(document.body.textContent, 'boom!')
    })
  })

  describe('Countdown (version 2)', () => {
    class Countdown {
      ui: Ui
      count: number
      constructor () {
        this.ui = new Ui($ => this.update($))
        this.count = 10
      }

      countdown () {
        this.count = this.count > 0 ? this.count - 1 : 0
      }

      update ($: T$) {
        $().textContent = this.count > 0
          ? this.count
          : 'boom!'
      }

      render () {
        const elem = toElem(`<button>${this.count}</button>`) as HTMLButtonElement
        elem.onclick = this.ui.update(() => this.countdown())
        return elem
      }
    }

    it('should count down to 0 and BOOM!', () => {
      const elem = render(new Countdown(), document.body) as HTMLButtonElement
      for (let i = 10; i > 0; i--) {
        assert.strictEqual(document.body.textContent, String(i))
        elem.click()
      }
      assert.strictEqual(document.body.textContent, 'boom!')
      elem.click()
      assert.strictEqual(document.body.textContent, 'boom!')
    })
  })

  describe('Countdown (version 3)', () => {
    class Countdown {
      ui: Ui
      count: number
      constructor () {
        this.count = 10
        this.ui = new Ui($ => this.update($))
        this.ui.watch(this, 'countdown')
      }

      countdown () {
        this.count = this.count > 0 ? this.count - 1 : 0
      }

      update ($: T$) {
        $().textContent = this.count > 0
          ? this.count
          : 'boom!'
      }

      render () {
        const elem = toElem(`<button>${this.count}</button>`) as HTMLButtonElement
        elem.onclick = () => this.countdown()
        return elem
      }
    }

    it('should count down to 0 and BOOM!', () => {
      const elem = render(new Countdown(), document.body) as HTMLButtonElement
      for (let i = 10; i > 0; i--) {
        assert.strictEqual(document.body.textContent, String(i))
        elem.click()
      }
      assert.strictEqual(document.body.textContent, 'boom!')
      elem.click()
      assert.strictEqual(document.body.textContent, 'boom!')
    })
  })
})
