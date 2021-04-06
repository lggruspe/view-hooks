type Hook = () => void;

/** Returns prototype of obj that contains the property. */
function getPropertyOwner (obj: any, property: string | symbol): any {
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

/** Replace plain variable with getter and setter. */
function getterize (obj: any, member: string | symbol) {
  const proto = insertPrototype(obj)

  const name = Symbol('impl')
  proto[name] = obj[member]
  delete obj[member]

  Object.defineProperty(proto, member, {
    get: function () {
      return proto[name]
    },
    set: function (val) {
      proto[name] = val
    },
    enumerable: false,
    configurable: true
  })
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

export function hook (obj: any, member: string | symbol, callback: Hook): void {
  if (obj == null) {
    return
  }
  const owner = getPropertyOwner(obj, member)
  if (!owner) return

  const descriptor = Object.getOwnPropertyDescriptor(owner, member)!

  if (typeof descriptor.value !== 'function' && descriptor.get == null) {
    getterize(owner, member)
    return hook(obj, member, callback)
  }

  const original = descriptor.set || descriptor.value
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
