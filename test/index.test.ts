import { hook, View } from '../src/index'
import { JSDOM } from 'jsdom'
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

describe('View', () => {
  class TestState {
    value: number
    constructor (value: number = 0) {
      this.value = value
    }

    increase () {
      this.value++
    }

    decrease () {
      this.value--
    }
  }

  beforeEach(() => {
    const dom = new JSDOM('<div class="app"></div>')
    const writable = true
    Object.defineProperties(global, {
      dom: { value: dom, writable },
      window: { value: dom.window, writable },
      document: { value: dom.window.document, writable }
    })
  })

  describe('constructor', () => {
    describe('without arguments', () => {
      it('should use reasonable default options', () => {
        class EmptyView extends View {
          initialize (container: HTMLElement) {
            assert.ok(container)
          }

          update () {}
        }
        const view = new EmptyView()
        assert.strictEqual(view.state, undefined)
        assert.strictEqual(view.container, document.body.lastChild)
      })
    })
  })

  describe('TestView', () => {
    class TestView extends View {
      constructor (state: TestState, container: HTMLElement) {
        const hooks = ['increase', 'decrease']
        super({ state, container, hooks })
      }

      initialize (container: HTMLElement) {
        container.innerHTML = `
          <div class="test">
            <span class="value">${this.state.value}</span>
            <button type="button" class="increase">Increase</button>
            <button type="button" class="decrease">Decrease</button>
          </div>
        `
        this.$('.increase')!.addEventListener('click', () => this.state.increase())
        this.$('.decrease')!.addEventListener('click', () => this.state.decrease())
      }

      update () {
        this.$('.value')!.textContent = this.state.value
      }
    }

    describe('click increase button', () => {
      it('should increase counter value', () => {
        const state = new TestState(-2)
        const container = document.querySelector('.app')
        const view = new TestView(state, container as HTMLElement)
        assert.ok(view)

        const button = document.querySelector('.increase') as HTMLElement
        const value = document.querySelector('.value')!
        assert.ok(button)
        assert.ok(value)

        assert.strictEqual(value.textContent, '-2')
        button.click()
        assert.strictEqual(value.textContent, '-1')
        button.click()
        assert.strictEqual(value.textContent, '0')
      })
    })

    describe('click decrease button', () => {
      it('should decrease counter value', () => {
        const state = new TestState(0)
        const container = document.querySelector('.app')
        const view = new TestView(state, container as HTMLElement)
        assert.ok(view)

        const button = document.querySelector('.decrease') as HTMLElement
        const value = document.querySelector('.value')!
        assert.ok(button)
        assert.ok(value)

        assert.strictEqual(value.textContent, '0')
        button.click()
        assert.strictEqual(value.textContent, '-1')
        button.click()
        assert.strictEqual(value.textContent, '-2')
      })
    })
  })
})
