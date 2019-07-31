# Accordion
Very light and simple module. With the module you can create accordion on your website, useful for creating FAQ lists.
<br> Browsers support: All modern browsers, Internet Explorer 10+

## Version
2.7.3

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
https://unpkg.com/accordion-js@2.7.3/dist/accordion.min.css
https://unpkg.com/accordion-js@2.7.3/dist/accordion.min.js
```

```html
<link rel="stylesheet" href="[CDN CSS URL]"> 
<script src="[CDN JS URL]"></script>
```

###### Github
You can also download files from Github and attach them manually to your project. <br>
Note: On production use files (JS and CSS) only from **dist/** folder.

```html
<link rel="stylesheet" href="accordion.min.css"> 
<script src="accordion.min.js"></script>  
```

## Usage

###### Include files
See the section above.

###### Create HTML layout
This is just an example of a layout. You can create your own HTML structure.
```html
<div class="accordion-container">
  <div class="ac">
    <h2 class="ac-q" tabindex="0">Lorem ipsum</h2>
    <div class="ac-a">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-q" tabindex="0">Lorem ipsum</h2>
    <div class="ac-a">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-q" tabindex="0">Lorem ipsum</h2>
    <div class="ac-a">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
  </div>
</div>
```

###### Initialize the module
```javascript
<script>
  new Accordion('.accordion-container');  
</script>
```

## API

###### Example
new Accordion(container, options)

* container - string (required), selector of accordion container 
* options - object (optional), accordion options

You can initialize more than one accordion per page.
```javascript
<script>
  // Default options
  new Accordion('.container-first');  

  // User options
  new Accordion('.container-second', {
    duration: 500,
    showItem: true,
    onToggle: function(currentElement, allElements) {
      console.log(currentElement);
    }
  }); 

  // Define several accordions with the same options
  new Accordion(['.container-first', '.container-second']); 
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| duration | number | 600 | Animation duration in ms |
| itemNumber | number | 0 | Item number which will be shown (Default first) |
| aria | boolean | true | Add ARIA elements to the HTML structure |
| closeOthers | boolean | true | Show only one element at the same time |
| showItem | boolean | false | Always show element that has `itemNumber` number |
| elementClass | string | 'ac' | Element class |
| questionClass | string | 'ac-q' | Question class |
| answerClass | string | 'ac-a' | Answer class |
| targetClass | string | 'ac-target' | Target class [Read more below] |
| onToggle | function | - | Function called after clicking on the element. Can take two params <br> **1st** - element that was clicked <br> **2nd** - list of all accordion elements <br> [Read more below]|

###### Comments

**targetClass** - If an element has the `targetClass` class and is inside box with `qClass` class, then when you click on it, the list will be expanded. Otherwise expanded will not take place and clicked element will take you to the top of the page.

**onToggle** - Function is not working on initiated element, when `showItem` is set to `true`.