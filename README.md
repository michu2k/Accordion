# Accordion
Light and accessible accordion module. With the module you can create accordion on your website, useful for creating FAQ lists.
<br> Browsers support: All modern browsers, Internet Explorer 10+

## Version
3.0.0

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
https://unpkg.com/accordion-js@3.0.0/dist/accordion.min.css
https://unpkg.com/accordion-js@3.0.0/dist/accordion.min.js
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
      <button class="ac-trigger">Lorem ipsum dolor sit amet.</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button class="ac-trigger">Lorem ipsum dolor sit amet.</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button class="ac-trigger">Lorem ipsum dolor sit amet.</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
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

###### Example
```javascript
new Accordion(container, options)
```

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

// Define several accordions with the same options
new Accordion(['.container-first', '.container-second'], {});

// Detach events
var accordion = new Accordion('.container-first');
accordion.detachEvents();
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| duration | number | 600 | Animation duration in ms |
| ariaEnabled | boolean | true | Add ARIA elements to the HTML structure |
| collapse | boolean | true | Allow collapse expanded panel |
| showMultiple | boolean | false | Show multiple elements at the same time |
| openOnInit | array | [] | Show accordion elements during initialization |
| elementClass | string | 'ac' | Element class |
| triggerClass | string | 'ac-trigger' | Trigger class |
| panelClass | string | 'ac-panel' | Panel class |
| activeClass | string | 'is-active' | Active element class |
| beforeOpen | function | - | Calls before the item is opened. <br> `beforeOpen: (currentElement) => {}`|
| onOpen | function | - | Calls when the item is opened. <br> `onOpen: (currentElement) => {}`|
| beforeClose | function | - | Calls before the item is closed. <br> `beforeClose: (currentElement) => {}`|
| onClose | function | - | Calls when the item is closed. <br> `onClose: (currentElement) => {}`|

###### Methods

| Option  | Description | Parameters |
| ----- | ----- | ----- |
| attachEvents | Attach events | - |
| detachEvents | Detach events | - |
| open | Open the accordion element with the given idx | `idx` - element index (required) |
| close | Close the accordion element with the given idx| `idx` - element index (required) |
| openAll | It will open all accordion elements without animation | - |
| closeAll | It will close all accordion elements without animations | - |
| destroy | Destroy accordion instance | - |
