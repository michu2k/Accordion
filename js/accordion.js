/*
Name: FAQ Accordion 
Description: Simple FAQ list with jQuery & CSS3
Version: 1.0
Author: Michał Strumpf (Michu2k) 
License: MIT
*/

var Accordion = (function($) {

	//Defaults	
	var	defaults = {
		animationTime: 300,
		showOnlyOne: true
	};

	//Vars
	var containerClass = ".ac",
		answerClass = ".ac-a",
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
	var Core = function() {
		$(containerClass).click(function(e) {
			e.preventDefault();

			if (defaults.showOnlyOne === true)
				_closeAll(this);	

			_showOne(this);

		});			
	};

	//Init
	var AcInit = function(options) {
		$.extend(true, defaults, options);
		Core();
	}

	//Return
	return {
		init : AcInit
	}

})(jQuery);
