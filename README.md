# Accordion
Lightweight and accessible accordion module with an extensible API. With the module you can create accordion on your website, useful especially for creating FAQ lists.

## Version
3.3.2

## Installation

###### npm
Install the package & import files
```
npm install accordion-js
```

```javascript
import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';
```

###### CDN
Include files using CDN.

```
https://unpkg.com/accordion-js@3.3.2/dist/accordion.min.css
https://unpkg.com/accordion-js@3.3.2/dist/accordion.min.js
```

```html
<link rel="stylesheet" href="[CDN CSS URL]">
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
      <button type="button" class="ac-trigger">Lorem ipsum dolor sit amet.</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Lorem ipsum dolor sit amet.</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Lorem ipsum dolor sit amet.</button>
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
  new Accordion('.accordion-container');
</script>
```

## API

###### Examples
new Accordion(container, options)

* `container` - string | HTMLElement (required), selector of accordion container
* `options` - object (optional), accordion options

```javascript
// Default options
new Accordion('.container-first');

// User options
new Accordion('.container-second', {
  duration: 400,
  showMultiple: true,
  onOpen: function(currentElement) {
    console.log(currentElement);
  }
});

// Define several accordions with the same options (pass an array with selectors)
new Accordion(['.container-first', '.container-second'], {});

// or pass an array with HTMLElements
const accordions = Array.from(document.querySelectorAll('.accordion-container'));
new Accordion(accordions, {});

// Detach events
const accordion = new Accordion('.container-first');
accordion.detachEvents();
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| duration | number | 600 | Animation duration in ms |
| ariaEnabled | boolean | true | Add ARIA elements to the HTML structure |
| collapse | boolean | true | Allow collapse expanded panel |
| showMultiple | boolean | false | Show multiple elements at the same time |
| onlyChildNodes | boolean | true | Disabling this option will find all items in the container. Warning: Setting to `false` will break the functionality of nested accordions |
| openOnInit | array | [] | Show accordion elements during initialization |
| elementClass | string | 'ac' | Element class |
| triggerClass | string | 'ac-trigger' | Trigger class |
| panelClass | string | 'ac-panel' | Panel class |
| activeClass | string | 'is-active' | Active element class |
| beforeOpen | function | - | Calls before the item is opened. <br> `beforeOpen: (currElement) => {}`|
| onOpen | function | - | Calls when the item is opened. <br> `onOpen: (currElement) => {}`|
| beforeClose | function | - | Calls before the item is closed. <br> `beforeClose: (currElement) => {}`|
| onClose | function | - | Calls when the item is closed. <br> `onClose: (currElement) => {}`|

###### Methods

| Option  | Description | Arguments |
| ----- | ----- | ----- |
| attachEvents() | Attach events | - |
| detachEvents() | Detach events | - |
| open() | Open the accordion element with the given idx <br> E.g. `acc.open(1)` | `idx` - element index |
| close() | Close the accordion element with the given idx <br> E.g. `acc.close(1)` | `idx` - element index |
| toggle() | Toggle the accordion element with the given idx <br> E.g. `acc.toggle(1)` | `idx` - element index |
| openAll() | Open all accordion elements (without animation) | - |
| closeAll() | Close all accordion elements (without animation) | - |
| update() | If there are new items added by lazy load, you can run this method to update the Accordion | - |
| destroy() | Destroy accordion instance: <br> Open elements, remove events, IDs & ARIA | - |

## v3 Release Info
There have been a lot of changes to the API in version `3.0.0`, so if you are using previous versions of the accordion (`2.8.0` and below), I recommend updating the package to the latest version with new structure and options.
