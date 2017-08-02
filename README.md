# Accordion
Very light and simple module. With the module you can create accordion on your website, useful for creating FAQ lists. It only need jQuery and little CSS.

## Version
v1.2.0

## Usage

###### Include files
```html
<link rel="stylesheet" href="css/accordion.css"> 
<script src="js/accordion.min.js"></script>  
```
Script also require jQuery.

###### Create HTML layout
```html
<div class="ac-container">
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
```
<script>
	var accordion = new Accordion();	
</script>
```

## API

###### Example

```
<script>
	var accordion = new Accordion({
		option: value,
		duration: 500
	});	
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| duration | number | 300 | Duration in ms |
| showOnlyOne | boolean | true | Show only one element |
| showFirst | boolean | false | Always show first element |
