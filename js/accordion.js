/*
Name: FAQ Accordion 
Description: Simple FAQ list with jQuery & CSS3
Version: 1.1
Author: Michał Strumpf https://github.com/michu2k
License: MIT
*/

let Accordion = (($) => {
	'use strict';

	//Defaults	
	let defaults = {
		animationTime: 300,
		showOnlyOne: true
	};

	const containerClass = '.ac',
		  answerClass = '.ac-a',
		  activeClass = 'active';

	//Close all the answers		
	const _closeAll = ($this) => {
		$(containerClass)
			.not($this)
			.removeClass(activeClass)
			.children(answerClass)	
			.slideUp(defaults.animationTime);	
	}	

	//Show answer
	const _showOne = ($this) => {
		$($this)
			.toggleClass(activeClass)
			.children(answerClass)
			.slideToggle(defaults.animationTime);
	}

	//Core
	const _core = () => {
		$(containerClass).click(function(event) {
			event.preventDefault();
			
			if (defaults.showOnlyOne === true)
				_closeAll(this);	

			_showOne(this);

		});			
	};

	//Init
	const _init = (options) => {
		const result = Object.assign(defaults, options);
		_core();
	}

	//Return
	return {
		init : _init
	}

})(jQuery);


