/**
 * Accordion v2.4.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function(window){

	'use strict';
	
	let options;

	/**
	 * Core
	 * @param {string} selector = container, where script will be defined
	 * @param {object} userOptions = options defined by user
	 */
	let Accordion = function(selector, userOptions)
	{

		// Defaults	
		let defaults = {
			duration: 600,
			itemNumber: 0,
			closeOthers: true,
			showItem: false,
			elementClass: 'ac',
			questionClass: 'ac-q',
			answerClass: 'ac-a',
			targetClass: 'ac-target'
		};

		options = extendDefaults(defaults, userOptions);

		// Get all container elements
		let containers = document.querySelectorAll(selector);

		for (let i = 0; i < containers.length; i++)
		{
			let elements = containers[i].querySelectorAll('.' + options.elementClass);

			// For each element
			for (let i = 0; i < elements.length; i++)
			{
				hideElement(elements[i]);
				setTransition(elements[i]);

				// On click
				elements[i].addEventListener('click', function(event)
				{
					let target = event.target || event.srcElement;
					
					// Check if target has one of the classes
					if (target.className.match(options.questionClass) || target.className.match(options.targetClass)) 
					{
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);

						if (options.closeOthers === true) 
							closeAllElements(elements, i);

						toggleElement(this);
					}
				});
			}	

			// Show element when script is loaded
			if (options.showItem === true) 
			{
				// Default value
				let el = elements[0];

				if (typeof options.itemNumber === 'number' && options.itemNumber < elements.length)
					el = elements[options.itemNumber];

				toggleElement(el, false);
			}
		}

		// Window resize
		let resize;
		window.addEventListener('resize', () => {
			cancelAnimationFrame(resize);
			resize = requestAnimationFrame(() => {
				changeHeight(containers);
			});
		});
	}

	/**
	 * Change element height, when window is resized and when element is active
	 * @param {object} containers = list of containers
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

					// Set to auto and get new height
					requestAnimationFrame(() => {
						answer.style.height = 'auto';
						height = answer.offsetHeight;

						requestAnimationFrame(() => {
							answer.style.height = height + 'px';
						});
					});
				}
			}
		}
	}

	/**
	 * Hide element
	 * @param {object} element = current element
	 */
	function hideElement(element)
	{
		let answer = element.querySelector('.' + options.answerClass);

		requestAnimationFrame(() => {
			answer.style.height = 0;
		});
	}

	/**
	 * Set transition 
	 * @param {object} element = current element
	 */
	function setTransition(element)
	{
		let el = element.querySelector('.' + options.answerClass),
			transition = getSupportedProperty('Transition');

		el.style[transition] = options.duration + 'ms';
	}

	/** 
	 * Toggle current element
	 * @param {object} element = current element
	 * @param {boolean} animation = turn on animation
	 */
	function toggleElement(element, animation = true)
	{
		let answer = element.querySelector('.' + options.answerClass),
			height = answer.scrollHeight;

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

		// Open element without animation
		if (animation === false)
			answer.style.height = 'auto';

		// Set height
		if (parseInt(answer.style.height) > 0)
		{
			requestAnimationFrame(() => {
				answer.style.height = 0;
			});
		}
		else
		{ 
			requestAnimationFrame(() => {
				answer.style.height = height + 'px';
			});
		}
	}

	/**
	 * Close all elements without the current element
	 * @param {object} elements = list of elements
	 * @param {number} current = current element
	 */
	function closeAllElements(elements, current)
	{
		for (let i = 0; i < elements.length; i++) 
		{
			if(i != current)
			{
 				let newClassName = '',
					classes = elements[i].className.split(' ');

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
	 * Get supported property and add prefix if needed
	 * @param {string} property = property name
	 * @return {string} propertyWithPrefix = property prefix
	 */
	function getSupportedProperty(property)
	{
		let prefix = ['-', 'webkit', 'moz', 'ms', 'o'],
			propertyWithPrefix;

		for (let i = 0; i < prefix.length; i++) 
		{
			if (prefix[i] == '-')
				propertyWithPrefix = property.toLowerCase();
			else
				propertyWithPrefix = prefix[i] + property;

			if (typeof document.body.style[propertyWithPrefix] != 'undefined')
	           return propertyWithPrefix;
		}

		return null;	
	}

	/** 
	 * Extend defaults
	 * @param {object} defaults = defaults options defined in script
	 * @param {object} properties = options defined by user
	 * @return {object} defaults = modified options
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

	/**
	 * RequestAnimationFrame support
	 */
	window.requestAnimationFrame = (() => {
		return window.requestAnimationFrame ||
			   window.webkitRequestAnimationFrame ||
			   window.mozRequestAnimationFrame ||
			   function(callback) {
			       window.setTimeout(callback, 1000 / 60);
			   };
	})();

	/**
	 * CancelAnimationFrame support
	 */
	if (!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = (id) =>
		{
			clearTimeout(id);
		};
	}

	window.Accordion = Accordion;

})(window);