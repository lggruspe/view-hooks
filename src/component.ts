import { hook } from './hook'
import { elemTo$, T$ } from './template'

type Updater = ($: T$) => any

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

export { Component, Ui, render }
