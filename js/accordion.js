/*
	Simple accordion created with jQuery & CSS. Very useful to create FAQ lists on your website. 
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v1.2.0
*/

(function($){

	const containerClass = '.ac-container',
		  listClass = '.ac',
		  answerClass = '.ac-a',
		  activeClass = 'active';

	this.Accordion = function() {

		//Defaults	
		let defaults = {
			duration: 300,
			showOnlyOne: true,
			showFirst: false
		};

		let that = this;

		this.options = extendDefaults(defaults, arguments[0]);

		$.each($(containerClass), function(index, element) {

			if (that.options.showFirst === true) {
				showFirstElement(element);
			}

			$(element).find(listClass).on('click', function(event) {
				event.preventDefault();

				if (that.options.showOnlyOne === true)
					closeAll(this, that, element);	

				showAnswer(this, that);
			});
		});

	}

	// Extend defaults
	function extendDefaults(defaults, properties) {
		for (let property in properties)
			defaults[property] = properties[property];
		
		return defaults;
	}

	// Show first element
	function showFirstElement(container) {
		$(container)
			.find(listClass)
			.first()
			.addClass(activeClass)
			.children(answerClass)
			.show();
	}

	// Close all the answers
	function closeAll($this, that, container) {
		$(container)
			.find(listClass)
			.not($this)
			.removeClass(activeClass)
			.children(answerClass)	
			.slideUp(that.options.duration);
	}

	//Show answer
	function showAnswer($this, that) {
		$($this)
			.toggleClass(activeClass)
			.children(answerClass)
			.slideToggle(that.options.duration);
	}

})(jQuery);