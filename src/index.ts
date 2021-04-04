type Hook = () => void;

function getPropertyOwner (obj: any, property: string): any {
  if (Object.prototype.hasOwnProperty.call(obj, property)) {
    return obj
  }
  const prototype = Object.getPrototypeOf(obj)
  return prototype ? getPropertyOwner(prototype, property) : null
}

function insertPrototype (obj: any): any {
  const proto = {}
  Object.setPrototypeOf(proto, Object.getPrototypeOf(obj))
  Object.setPrototypeOf(obj, proto)
  return proto
}

function wrap (receiver: any, original: any, callback: Hook) {
  function replacement (): any {
    const result = original.apply(receiver, arguments)
    callback()
    return result
  }
  Object.defineProperty(replacement, 'name', {
    value: original.name,
    writable: false
  })
  return replacement
}

export function hook (obj: any, method: string, callback: Hook) {
  if (obj == null) {
    return
  }
  const owner = getPropertyOwner(obj, method)
  if (!owner) return

  const descriptor = Object.getOwnPropertyDescriptor(owner, method)!
  const original = descriptor.set || descriptor.value
  if (!original || typeof original !== 'function') return

  const replacement = wrap(obj, original, callback)

  if (owner === obj) {
    obj[method] = replacement
  } else {
    const proto = insertPrototype(obj)
    if (descriptor.set) {
      Object.defineProperty(proto, method, {
        get: descriptor.get,
        set: replacement
      })
    } else {
      proto[method] = replacement
    }
  }
}

function toElem (html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  const fragment = template.content
  if (fragment.childElementCount !== 1) {
    throw new Error('html should contain exactly one top-level element')
  }
  return fragment.firstElementChild!
}

type T$ = (selector?: string) => any
type Updater = ($: T$) => any

function elemTo$ (element: Element): T$ {
  return (selector?: string) => {
    return !selector ? element : element.querySelector(selector)
  }
}

function to$ (html: string) {
  return elemTo$(toElem(html))
}

class Ui {
  updater: Updater
  $: any

  constructor (updater: Updater) {
    this.updater = updater
    this.$ = null
  }

  update (callback: any) {
    const self = this
    return function () {
      callback.apply(undefined, arguments)
      self.updater(self.$)
    }
  }

  watch (receiver: any, method: string) {
    hook(receiver, method, () => this.updater(this.$))
  }
}

interface Component {
  ui: Ui
  render: () => Element
}

function render (component: Component | Element, container: Element) {
  if (component instanceof Element) {
    return container.appendChild(component)
  } else {
    const ui = component.ui
    const element = component.render()
    ui.$ = elemTo$(element)
    return container.appendChild(element)
  }
}

export {
  Component,
  T$,
  Ui,
  elemTo$,
  render,
  to$,
  toElem
}
