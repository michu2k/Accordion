/**
 * Simple accordion created in pure Javascript.
 * Author: Michał Strumpf https://github.com/michu2k
 * License: MIT
 * Version: v2.3.1
 */

(function(window){

	'use strict';
	
	let options;

	/**
	 * Core
	 * @param selector = container, where script will be defined [string]
	 * @param userOptions = options defined by user [object]
	 */
	let Accordion = function(selector, userOptions)
	{

		// Defaults	
		let defaults = {
			duration:		600,
			itemNumber:  	0,
			closeOthers:	true,
			showItem: 		false,
			elementClass:	'ac',
			questionClass:	'ac-q',
			answerClass:	'ac-a',
			targetClass: 	'ac-target'
		};

		options = extendDefaults(defaults, userOptions);

		// Get all container elements
		let containers = document.querySelectorAll(selector);

		for (let i = 0; i < containers.length; i++)
		{
			let elements = containers[i].querySelectorAll('.' + options.elementClass);

			for (let i = 0; i < elements.length; i++)
			{
				hideElement(elements[i]);
				setTransition(elements[i]);

				// On click
				elements[i].addEventListener('click', function(event)
				{
					let target = event.target || event.srcElement;
					
					if (target.className.match(options.questionClass) || target.className.match(options.targetClass)) 
					{
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);

						if (options.closeOthers === true) 
						{
							closeAllElements(elements, i);	
						}

						toggleElement(this);
					}
				});
			}	

			// Show element when script is loaded
			if (options.showItem === true) 
			{
				let el = elements[0];

				if (typeof options.itemNumber === 'number' && options.itemNumber < elements.length)
				{
					el = elements[options.itemNumber];
				}

				toggleElement(el, false);
			}
		}

		// Window resize
		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	changeHeight(containers);
		    }, 100);	
		});
	}

	/**
	 * Change element height, when window is resized and when element is active
	 * @param containers = list of containers [object]
	 */
	function changeHeight(containers)
	{
		let height, answer;

		for (let i = 0; i < containers.length; i++)
		{
			let elements = containers[i].querySelectorAll('.' + options.elementClass);

			for (let i = 0; i < elements.length; i++)
			{
				if (elements[i].className.match('active')) 
				{
					answer = elements[i].querySelector('.' + options.answerClass);

					answer.style.height = 'auto';
					height = answer.offsetHeight;
					answer.style.height = height + 'px';
				}
			}
		}
	}

	/**
	 * Hide element
	 * @param element = current element [object]
	 */
	function hideElement(element)
	{
		let answer = element.querySelector('.' + options.answerClass);
		answer.style.height = 0;
	}

	/**
	 * Set transition 
	 * @param element = current element [object]
	 */
	function setTransition(element)
	{
		let el = element.querySelector('.' + options.answerClass);
		el.style.WebkitTransitionDuration = options.duration + 'ms'; 
		el.style.transitionDuration = options.duration + 'ms';
	}

	/** 
	 * Toggle current element
	 * @param element = current element [object]
	 * @param animation = turn on animation [boolean]
	 */
	function toggleElement(element, animation = true)
	{
		let height, answer = element.querySelector('.' + options.answerClass);

		// Toggle class
		if (element.classList)
		{
			element.classList.toggle('active');
		}
		else
		{
			// For IE
			let classes = element.className.split(' '),
				j = classes.indexOf('active');

			if (j >= 0)
				classes.splice(j, 1);
			else
				classes.push('active');

			element.className = classes.join(' ');
		} 

		// Set height
		if (parseInt(answer.style.height) > 0)
			answer.style.height = 0;
		else
		{ 
			// Set to auto, get height and set back to 0, if animation is not set to true.
			answer.style.height = 'auto';
			height = answer.offsetHeight;

			if (animation == false) {
				answer.style.height = height + 'px';
				return;
			}

			answer.style.height = 0;

			setTimeout(() => {
				answer.style.height = height + 'px';
			}, 10);
		}
	}

	/**
	 * Close all elements without the current element
	 * @param elements = list of elements [object]
	 * @param current = current element [number]
	 */
	function closeAllElements(elements, current)
	{
		for (let i = 0; i < elements.length; i++) 
		{
			if(i != current)
			{
 				let newClassName = '';
				let classes = elements[i].className.split(' ');

				for(let i = 0; i < classes.length; i++)
				{
					if(classes[i] !== 'active')
						newClassName += classes[i];
				}

				elements[i].className = newClassName;

				hideElement(elements[i]);
			}
		}
	}

	/** 
	 * Extend defaults
	 * @param defaults = defaults options defined in script [object]
	 * @param properties = options defined by user [object]
	 * @return defaults = modified options [object]
	 */
	function extendDefaults(defaults, properties)
	{
		if (properties != null && properties != undefined && properties != 'undefined') 
		{
			for (let property in properties)
				defaults[property] = properties[property];
		}

		return defaults;
	}

	window.Accordion = Accordion;

})(window);