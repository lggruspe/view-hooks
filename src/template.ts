// Functions for creating elements from HTML string templates.

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

  check () {
    if (this.$ == null) {
      throw new Error('component ui has not been rendered')
    }
  }

  init ($: T$) {
    if (this.$ != null) {
      throw new Error('component ui has already been rendered')
    }
    this.$ = $
  }

  update (callback: any) {
    const self = this
    return function () {
      self.check()
      callback.apply(undefined, arguments)
      self.updater(self.$)
    }
  }
}

interface Component {
  ui: Ui
  render: () => Element
}

function render (component: Component | Element, container: Element) {
  if (component instanceof Element) {
    container.appendChild(component)
  } else {
    const ui = component.ui
    const element = component.render()
    ui.init(elemTo$(element))
    container.appendChild(element)
  }
}

export {
  Component,
  Ui,
  elemTo$,
  render,
  to$,
  toElem
}
