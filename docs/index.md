---
title: Getting started with loulou
author: Levi Gruspe
...

What is loulou?
---------------

[Loulou](https://github.com/lggruspe/loulou) is an easy to use library for creating web user interfaces.

Installation
------------

```bash
npm install loulou
```

Hello, world!
-------------

The easiest way to get started with loulou is to use a CDN.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Example</title>
        <script src="https://cdn.jsdelivr.net/npm/loulou@1.2.4"></script>
        <script type="module">
            function hello (name = 'world') {
                return loulou.toElem(`<p>Hello, ${name}!</p>`)
            }
            loulou.render(hello('loulou'), document.querySelector('.root'))
        </script>
    </head>
    <body>
        <div class="root"></div>
    </body>
</html>
```

CDN links
---------

- <https://cdn.jsdelivr.net/npm/loulou@1.2.4>
- <https://cdn.jsdelivr.net/npm/loulou@1.2.4/dist/index.esm.min.js>
- <https://unpkg.com/loulou@1.2.4/dist/index.min.js>
- <https://unpkg.com/loulou@1.2.4/dist/index.esm.min.js>
- <https://cdn.skypack.dev/loulou>

How to create DOM elements
--------------------------

Loulou provides two functions to create DOM elements from HTML strings:
`toElem` and `to$`.
These functions return actual DOM elements; loulou doesn't use a virtual DOM.

### `toElem`

```javascript
const list = loulou.toElem(`
    <ul>
        <li>Foo</li>
        <li>Bar</li>
        <li>Baz</li>
    </ul>
`)
```

It has the same result as the following.

```javascript
const list = document.createElement('ul')
list.innerHTML = `
    <li>Foo</li>
    <li>Bar</li>
    <li>Baz</li>
`
```

### `to$`

The `to$` function is similar to `toElem`, but it returns a `$` function instead of a DOM element.

```javascript
const $ = loulou.to$(`
    <div class="app">
        <div class="foo">
            <button>Foo</button>
        </div>
        <div class="bar">
            <button>Bar</button>
        </div>
    </div>
`)
```

The `$` function
----------------

The `$` function can be used to query selectors in the element you created.
It is useful when you want to modify nested elements; for example, to add event listeners.

```javascript
$('.foo button').onclick = () => alert('Foo')
$('.bar button').onclick = () => alert('Bar')
```

Calling the `$` function without arguments returns the parent element.

The `render` function
---------------------

The `render` function inserts elements into the DOM (or inside other elements).

```javascript
const elem = loulou.toElem('<p>Hello, world!</p>')
loulou.render(elem, document.body)
```

Note that in this case, you could have just done the following.
(Recall that `toElem` returns an actual DOM element.)

```javascript
document.body.appendChild(elem)
```

The difference between `appendChild` and `render` is that `render` does additional things to [components that contain state](#components-that-contain-state).

Composing elements
------------------

The primary way to compose elements is to use the `render` function.

```javascript
function li (content) {
    return loulou.toElem(`<li>${content}</li>`)
}

function ul (...items) {
    const elem = loulou.toElem('<ul></ul>')
    for (const item of items) {
        loulou.render(li(item), elem)
    }
    return elem
}

function app () {
    const elem = loulou.toElem('<div clas="app"></div>')
    loulou.render(ul('foo', 'bar', 'baz'), elem)
    return elem
}

loulou.render(app(), document.body)
```

Components that contain state
-----------------------------

In loulou, a component is an object that contains a `ui` variable and a `render` method.
It also typically contains some form of state.
Otherwise, you could write the component as a function instead, like in earlier examples.

```javascript
class Counter {
    constructor (count = 0) {
        this.count = count
        this.ui = new loulou.Ui($ => this.update($))
        this.ui.watch(this, 'count')
    }

    render () {
        const $ = loulou.to$(`
            <div class="counter">
                <span class="count">${this.count}</span>
                <button class="button">Add</button>
            </div>
        `)
        $('.button').onclick = () => { this.count++ }
        return $()
    }

    update ($) {
        $('.count').textContent = this.count
    }
}

loulou.render(new Counter(), document.body)
```

### Initial `render`

The `render` method in components defines the initial state of the interface.
It returns a DOM element.
In the example, `$()` is equal to the `.counter` div.

This is where you create the element and add event listeners.

### Updating the `ui`

The UI update function is passed as a callback to the `Ui` constructor.
Note that the update function takes a `$` function (used for querying).

The update function should modify the UI to reflect state changes.

### Triggering UI updates

How does the UI object know when to call the update function?

The UI object has a `watch` method that you can use to specify which properties to observe.
The property can be a function, a getter/setter or a variable.
Whenever the function gets invoked (or the variable gets modified), the UI object automatically calls the update function.

In the example, the button click handler modifies `this.count`, which triggers the update function.
