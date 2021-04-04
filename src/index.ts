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
