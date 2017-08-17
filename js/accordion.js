/*
	Simple accordion created with jQuery & CSS. Very useful to create FAQ lists on your website. 
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v2.0.0
*/

(function(){

	let that;

	// Core
	this.Accordion = function() {

		// Defaults	
		let defaults = {
			duration:		600,
			closeOthers:	true,
			showFirst:		false,
			containerClass:	'ac-container',
			elClass:		'ac',
			qClass:			'ac-q',
			aClass:			'ac-a'
		};

		this.options = extendDefaults(defaults, arguments[0]);
		that = this;

		// Get all container elements
		let containers = document.querySelectorAll('.' + that.options.containerClass);

		containers.forEach(function(container, index) {

			let elements = container.querySelectorAll('.' + that.options.elClass);

			for (let i = 0; i < elements.length; i++) {

				hideElement(elements[i]);
				setTransition(elements[i]);

				elements[i].addEventListener('click', function(event){
					event.preventDefault();

					let _this = this;

					if (event.target.classList.contains(that.options.qClass)) {

						if (that.options.closeOthers === true) {
							closeAllElements(elements, i);	
						}

						toggleElement(_this);
					}
					
				});
			}	

			if (that.options.showFirst === true) {
				toggleElement(elements[0]);
			}

		});

		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	containers.forEach(function(container, index) {
		    		let elements = container.querySelectorAll('.' + that.options.elClass);
		    		changeHeight(elements);
		    	});
		    }, 100);	
		});
	}

	/* 
		Extend defaults
		defaults = defaults options defined in script
		properties = new options
	*/
	function extendDefaults(defaults, properties) {
		for (let property in properties)
			defaults[property] = properties[property];
		
		return defaults;
	}

	/* 
		Change element height, when window is resized and when element is active
		elements = all elements
	*/
	function changeHeight(elements) {
		let answer, height
		for (let i = 0; i < elements.length; i++) {
			if (elements[i].classList.contains('active')) {

				answer = elements[i].querySelector('.' + that.options.aClass);
				answer.style.height = 'auto';
				height = answer.offsetHeight;
				answer.style.height = 0;

				setTimeout(function() {
					answer.style.height = height + 'px';
				}, 0);
			}
		}
	}

	/*
	 	Hide element, set height to 0
	 	element = current element
	*/
	function hideElement(element) {
		let answer = element.querySelector('.' + that.options.aClass);
		answer.style.height = 0;
	}

	/*
	 	Set transition 
	 	element = current element
	*/
	function setTransition(element) {
		let el = element.querySelector('.' + that.options.aClass);
		el.style.WebkitTransitionDuration = that.options.duration + 'ms'; 
		el.style.transitionDuration = that.options.duration + 'ms';
	}

	/* 
		Toggle current element
		element = current element
	*/
	function toggleElement(element) {
		let answer = element.querySelector('.' + that.options.aClass);
		let height;
		element.classList.toggle('active');

		if (parseInt(answer.style.height) > 0)
			answer.style.height = 0;
		else { 
			// Set to auto, get height and set to 0
			answer.style.height = 'auto';
			height = answer.offsetHeight;
			answer.style.height = 0;

			setTimeout(function() {
				answer.style.height = height + 'px';
			}, 0);
		}
	}

	/* 
		Close all elements without the current element
		el = elements
		current = current target
	*/
	function closeAllElements(el, current) {
		el = Array.prototype.slice.call(el, 0);
		el.splice(current, 1);

		for (let i = 0; i < el.length; i++) {
			el[i].classList.remove('active');
			hideElement(el[i]);
		}
	}

})();