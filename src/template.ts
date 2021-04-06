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

function elemTo$ (element: Element): T$ {
  return (selector?: string) => {
    return !selector ? element : element.querySelector(selector)
  }
}

function to$ (html: string) {
  return elemTo$(toElem(html))
}

export { toElem, elemTo$, to$, T$ }
