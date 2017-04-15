# HUE
HUE to moduł, który pozwala stworzyć rozwijaną listę, przydatną m.in. przy tworzeniu list FAQ. Waży bardzo mało a do działania potrzebuje jedynie biblioteki jQuery oraz trochę CSS'a :)

Strona skryptu: [HUE](http://www.michu2k.pl/hue/)

## Wersja
1.0

## Licencja 
Skrypt jest oparty na licencji MIT. Masz nieograniczone prawo do używania, kopiowania, modyfikowania i rozpowszechniania skryptu. Jedynym wymaganiem jest zachowanie warunków licencyjnych i informacje o autorze.

## Jak używać ?

###### Dołącz odpowiednie pliki do dokumentu.
```
<link rel="stylesheet" href="css/hue.css"> 
<script src="js/hue.min.js"></script>  
```

###### Stwórz znaczniki HTML.
```
<div class="hue">
    <a href="#" class="hue-q">Lorem ipsum ?</a>
    <div class="hue-a">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis lacinia nibh.</p>
    </div>
</div>
```

###### Aktywuj HUE wklejając poniższy kod na koniec dokumentu.
```
<script>
    Hue.init(); 
</script>
```

## Ustawienia
**animationTime** - czas trwania animacji rozwijania  
**showOnlyOne** - ustawione na false wyłącza automatyczne chowanie rozwiniętych list

```
<script>
    Hue.init({
        animationTime:  300,     //default
        showOnlyOne: true        //default
    }); 
</script>
```

## Autor
Autorem projektu jest Michał Strumpf  
- [Strona internetowa](http://www.michu2k.pl/)
- [Profil GitHub](https://github.com/michu2k/)