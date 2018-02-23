# Accordion
Very light and simple module. With the module you can create accordion on your website, useful for creating FAQ lists.

## Version
v2.3.1

## Usage
On production use files (JS and CSS) only from dist/ folder

## Install
```
npm install accordion-js
```

###### Include files
```html
<link rel="stylesheet" href="accordion.min.css"> 
<script src="accordion.min.js"></script>  
```

###### Create HTML layout
```html
<div class="accordion-container">
	<div class="ac">
	    <a href="#" class="ac-q">Lorem ipsum</a>
	    <div class="ac-a">
	        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
	    </div>
	</div>

	<div class="ac">
	    <a href="#" class="ac-q">Lorem ipsum</a>
	    <div class="ac-a">
	        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
	    </div>
	</div>	

	<div class="ac">
	    <a href="#" class="ac-q">Lorem ipsum</a>
	    <div class="ac-a">
	        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
	    </div>
	</div>
</div>
```

###### Initialize the module
```javascript
<script>
	var accordion = new Accordion('.accordion-container');	
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
	var accordion = new Accordion('.container-first');	

	// User options
	var accordion = new Accordion('.container-second', {
		duration: 500,
		showItem: true
	});	
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| duration | number | 600 | Animation duration in ms |
| itemNumber | number | 0 | Item number which will be shown (Default first) |
| closeOthers | boolean | true | Show only one element at the same time |
| showItem | boolean | false | Always show element that has `itemNumber` number |
| elementClass | string | 'ac' | Element class |
| questionClass | string | 'ac-q' | Question class |
| answerClass | string | 'ac-a' | Answer class |
| targetClass | string | 'ac-target' | Target class [Read more below] |

###### Comments

**targetClass** - If an element has the `targetClass` class and is inside box with `qClass` class, then when you click on it, the list will be expanded. Otherwise expanded will not take place and clicked element will take you to the top of the page.
