# FAQ Accordion
Very light and simple module. With the module you can create accordion on your website, useful for creating FAQ lists. It only need jQuery and little CSS.

Demo: [Accordion](http://michu2k.pl/accordion/)

## Version
1.1

## How to use ?

###### Include files.
```
<link rel="stylesheet" href="css/accordion.css"> 
<script src="js/accordion.min.js"></script>  
```
Script also require jQuery.

###### Create HTML tags.
```
<div class="ac">
    <a href="#" class="ac-q">Lorem ipsum ?</a>
    <div class="ac-a">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
</div>
```

###### Initiate the module.
```
<script>
    Accordion.init(); 
</script>
```

## Settings
**animationTime** - animation duration  
**showOnlyOne** - shows only one answer at the same time if set to true

```
<script>
    Accordion.init({
        animationTime:  300,     //default
        showOnlyOne: true        //default
    }); 
</script>
```

## Author
Created by Michał Strumpf
- [Website](http://michu2k.pl/)
- [GitHub](https://github.com/michu2k/)