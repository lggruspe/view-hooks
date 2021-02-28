type Hook = () => void;

export function hook (obj: any, method: string, callback: Hook) {
  if (obj == null) {
    return
  }
  const original = obj[method]
  if (!original || typeof original !== 'function') {
    return
  }
  function replacement (): any {
    const result = original.apply(obj, arguments)
    callback()
    return result
  }
  Object.defineProperty(replacement, 'name', {
    value: original.name,
    writable: false
  })
  obj[method] = replacement
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
    this.container = options?.container || document.body
    for (const method of options?.hooks || []) {
      hook(this.state, method, () => this.update())
    }
    this.initialize(this.container)
  }

  abstract initialize (container: HTMLElement): void;
  abstract update (): void;
}
