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

interface Options {
  container: HTMLElement
  state: any
  hooks: string[]
}

export abstract class View {
  state: any
  container: HTMLElement

  constructor (options?: Options) {
    this.state = options?.state
    this.container = options?.container ||
      document.body.appendChild(document.createElement('div'))
    for (const method of options?.hooks || []) {
      hook(this.state, method, () => this.update())
    }
  }

  abstract update (): void;

  $ (selector: string): HTMLElement | null {
    return this.container.querySelector(selector)
  }
}
