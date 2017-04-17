# HUE
HUE is very light and simple module. With the module you can create accordion on your website, useful for creating FAQ lists. It only need jQuery and little CSS.

Website: [HUE](http://www.michu2k.pl/hue/)

## Version
1.0

## License 
The module uses the MIT license. You can use, copy, modify and spread the module. You must only keep the license terms and informations about author.

## How to use ?

###### Include files.
```
<link rel="stylesheet" href="css/hue.css"> 
<script src="js/hue.min.js"></script>  
```

###### Create HTML tags.
```
<div class="hue">
    <a href="#" class="hue-q">Lorem ipsum ?</a>
    <div class="hue-a">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
</div>
```

###### Initiate the module.
```
<script>
    Hue.init(); 
</script>
```

## Settings
**animationTime** - animation duration  
**showOnlyOne** - shows only one answer at the same time if set to true

```
<script>
    Hue.init({
        animationTime:  300,     //default
        showOnlyOne: true        //default
    }); 
</script>
```

## Author
Created by Michał Strumpf
- [Website](http://www.michu2k.pl/)
- [GitHub](https://github.com/michu2k/)