/*
	Simple accordion created in pure Javascript.
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v2.2.1
*/

(function(window){

	let options;

	/* 
		Core
		selector = container, where script will be defined [string]
		userOptions = new options defined by user [object]
	*/
	let Accordion = function(selector, userOptions) {

		// Defaults	
		let defaults = {
			duration:		600,
			closeOthers:	true,
			showFirst:		false,
			elClass:		'ac',
			qClass:			'ac-q',
			aClass:			'ac-a'
		};

		options = extendDefaults(defaults, userOptions);

		// Get all container elements
		let containers = document.querySelectorAll(selector);

		containers.forEach(function(container) {

			let elements = container.querySelectorAll('.' + options.elClass);

			for (let i = 0; i < elements.length; i++) 
			{
				hideElement(elements[i]);
				setTransition(elements[i]);

				elements[i].addEventListener('click', function(event){
					event.preventDefault();

					let _this = this;

					if (event.target.classList.contains(options.qClass)) 
					{
						if (options.closeOthers === true) 
						{
							closeAllElements(elements, i);	
						}

						toggleElement(_this);
					}
				});
			}	

			if (options.showFirst === true) 
			{
				toggleElement(elements[0]);
			}

		});

		// Window resize
		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	containers.forEach(function(container) {
		    		let elements = container.querySelectorAll('.' + options.elClass);
		    		changeHeight(elements);
		    	});
		    }, 100);	
		});
	}

	/* 
		Extend defaults
		defaults = defaults options defined in script [object]
		properties = options defined by user [object]
	*/
	function extendDefaults(defaults, properties) {
		if (properties != null && properties != undefined && properties != 'undefined') 
		{
			for (let property in properties)
				defaults[property] = properties[property];
		}

		return defaults;
	}

	/* 
		Change element height, when window is resized and when element is active
		el = all elements [object]
	*/
	function changeHeight(el) {
		let height, answer
		for (let i = 0; i < el.length; i++) 
		{
			if (el[i].classList.contains('active')) 
			{
				answer = el[i].querySelector('.' + options.aClass);

				answer.style.height = 'auto';
				height = answer.offsetHeight;
				answer.style.height = height + 'px';
			}
		}
	}

	/*
	 	Hide element, set height to 0
	 	element = current element [object]
	*/
	function hideElement(element) {
		let answer = element.querySelector('.' + options.aClass);
		answer.style.height = 0;
	}

	/*
	 	Set transition 
	 	element = current element [object]
	*/
	function setTransition(element) {
		let el = element.querySelector('.' + options.aClass);
		el.style.WebkitTransitionDuration = options.duration + 'ms'; 
		el.style.transitionDuration = options.duration + 'ms';
	}

	/* 
		Toggle current element
		element = current element [object]
	*/
	function toggleElement(element) {
		let height, answer = element.querySelector('.' + options.aClass);
		element.classList.toggle('active');

		if (parseInt(answer.style.height) > 0)
			answer.style.height = 0;
		else { 
			// Set to auto, get height and set back to 0
			answer.style.height = 'auto';
			height = answer.offsetHeight;
			answer.style.height = 0;

			setTimeout(function() {
				answer.style.height = height + 'px';
			}, 10);
		}
	}

	/* 
		Close all elements without the current element
		el = elements [object]
		current = current target [number]
	*/
	function closeAllElements(el, current) {
		el = Array.prototype.slice.call(el, 0);
		el.splice(current, 1);

		for (let i = 0; i < el.length; i++) 
		{
			el[i].classList.remove('active');
			hideElement(el[i]);
		}
	}

	window.Accordion = Accordion;

})(window);