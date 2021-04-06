type Hook = () => void;

/** Returns prototype of obj that contains the property. */
function getPropertyOwner (obj: any, property: string): any {
  if (Object.prototype.hasOwnProperty.call(obj, property)) {
    return obj
  }
  const prototype = Object.getPrototypeOf(obj)
  return prototype ? getPropertyOwner(prototype, property) : null
}

/** Inserts new prototype into the prototype chain of obj. */
function insertPrototype (obj: any): any {
  const proto = Object.create(Object.getPrototypeOf(obj))
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

export function hook (obj: any, member: string, callback: Hook) {
  if (obj == null) {
    return
  }
  const owner = getPropertyOwner(obj, member)
  if (!owner) return

  const descriptor = Object.getOwnPropertyDescriptor(owner, member)!
  const original = descriptor.set || descriptor.value
  if (!original || typeof original !== 'function') return

  const replacement = wrap(obj, original, callback)

  if (owner === obj) {
    obj[member] = replacement
  } else {
    const proto = insertPrototype(obj)
    if (descriptor.set) {
      Object.defineProperty(proto, member, {
        get: descriptor.get,
        set: replacement
      })
    } else {
      proto[member] = replacement
    }
  }
}
