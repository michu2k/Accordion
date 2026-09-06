# Accordion

Lightweight and accessible accordion module with an extensible API. With the module you can create accordion on your website, useful especially for creating FAQ lists.

## Version

4.0.0

## Installation

###### Package manager

Install the package & import files

```
npm install accordion-js
```

```javascript
import Accordion from "accordion-js";
import "accordion-js/dist/accordion.min.css";
```

###### CDN

Include files using CDN.

```
https://unpkg.com/accordion-js@4.0.0/dist/accordion.min.css
https://unpkg.com/accordion-js@4.0.0/dist/accordion.min.js
```

```html
<link rel="stylesheet" href="[CDN CSS URL]" />
<script src="[CDN JS URL]"></script>
```

###### Github

You can also download files from Github and attach them manually to your project. <br>
Note: On production use files (JS and CSS) only from **dist/** folder.

## Usage

###### Include files

See the section above.

###### Create HTML layout

This is just an example of a layout. You can create your own HTML structure.

```html
<div class="accordion-container">
  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Lorem ipsum</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Lorem ipsum</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Lorem ipsum</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>
</div>
```

###### Initialize the module

```html
<script>
  new Accordion(".accordion-container");
</script>
```

## API

###### Examples

new Accordion(container, options)

- `container` - _string | HTMLElement | Array<string | HTMLElement> (required)_, A selector string, an HTMLElement, or an array of selector strings or HTMLElements that specify the accordion container(s).
- `options` - _object (optional)_, Configuration options for the accordion. See the table below for available options.

```javascript
// Default options
new Accordion(".container-first");

// User options
new Accordion(".container-second", {
  duration: 400,
  showMultiple: true,
  onOpen: function (item) {
    console.log(item);
  }
});

// Define several accordions with the same options (pass an array with selectors)
new Accordion([".container-first", ".container-second"], {});

// or pass an array with HTMLElements
const accordions = Array.from(document.querySelectorAll(".accordion-container"));
new Accordion(accordions, {});

// Detach events
const accordion = new Accordion(".container-first");
accordion.detachEvents();
```

###### Options

| Option         | Type     | Default value | Description                                                                                                                               |
| -------------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| duration       | number   | 500           | Animation duration in ms                                                                                                                  |
| ariaEnabled    | boolean  | true          | Add ARIA items to the HTML structure                                                                                                      |
| collapse       | boolean  | true          | Allow collapse expanded panel                                                                                                             |
| showMultiple   | boolean  | false         | Show multiple items at the same time                                                                                                      |
| openOnInit     | array    | []            | Show accordion items during initialization                                                                                                |
| itemClass      | string   | "ac"          | Item class                                                                                                                                |
| triggerClass   | string   | "ac-trigger"  | Trigger class                                                                                                                             |
| panelClass     | string   | "ac-panel"    | Panel class                                                                                                                               |
| activeClass    | string   | "is-active"   | Active item class                                                                                                                         |
| beforeOpen     | function | -             | Calls before the item is opened. <br> `beforeOpen: (item) => {}`                                                                          |
| onOpen         | function | -             | Calls when the item is opened. <br> `onOpen: (item) => {}`                                                                                |
| beforeClose    | function | -             | Calls before the item is closed. <br> `beforeClose: (item) => {}`                                                                         |
| onClose        | function | -             | Calls when the item is closed. <br> `onClose: (item) => {}`                                                                               |

###### Methods

| Option         | Description                                                                                | Arguments              |
| -------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| attachEvents() | Attach events                                                                              | -                      |
| detachEvents() | Detach events                                                                              | -                      |
| open()         | Open the accordion item with the given index <br> E.g. `acc.open(1)`                       | `itemIdx` - item index |
| close()        | Close the accordion item with the given index <br> E.g. `acc.close(1)`                     | `itemIdx` - item index |
| toggle()       | Toggle the accordion item with the given index <br> E.g. `acc.toggle(1)`                   | `itemIdx` - item index |
| openAll()      | Open all accordion items (without animation)                                               | -                      |
| closeAll()     | Close all accordion items (without animation)                                              | -                      |
| update()       | If there are new items added by lazy load, you can run this method to update the Accordion | -                      |
| destroy()      | Destroy accordion instance: <br> Open items, remove events, IDs & ARIA                     | -                      |

## License

This project is under the MIT license.
