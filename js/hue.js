/*
Name: Hue v1.0
Description: Simple FAQ list with jQuery & CSS3
Author: Michał Strumpf 
License: MIT
*/

var Hue = (function($) {

	//Defaults	
	var	defaults = {
		animationTime: 300,
		showOnlyOne: true
	};

	//Vars
	var containerClass = ".hue",
		answerClass = ".hue-a",
		activeClass = "active";

	//Close all the answers		
	var _closeAll = function($this) {
		$(containerClass)
			.not($this)
			.removeClass(activeClass)
			.children(answerClass)	
			.slideUp(defaults.animationTime);	
	}	

	//Show answer
	var _showOne = function($this) {
		$($this)
			.toggleClass(activeClass)
			.children(answerClass)
			.slideToggle(defaults.animationTime);
	}

	//Core
	var hueCore = function() {
		$(containerClass).click(function(e) {
			e.preventDefault();

			if (defaults.showOnlyOne === true)
				_closeAll(this);	

			_showOne(this);

		});			
	};

	//Init
	var hueInit = function(options) {
		$.extend(true, defaults, options);
		hueCore();
	}

	//Return
	return {
		init : hueInit
	}

})(jQuery);
