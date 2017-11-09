/*
	Simple accordion created in pure Javascript.
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v2.2.3
*/

(function(window){

	let options;

	/* 
		Core
		selector = container, where script will be defined [string]
		userOptions = new options defined by user [object]
	*/
	let Accordion = function(selector, userOptions)
	{

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

		for (let i = 0; i < containers.length; i++)
		{
			let elements = containers[i].querySelectorAll('.' + options.elClass);

			for (let i = 0; i < elements.length; i++)
			{
				hideElement(elements[i]);
				setTransition(elements[i]);

				console.log(elements[i]);

				elements[i].addEventListener('click', function(event)
				{
					let _this = this;
					let target = event.target || event.srcElement;

					if (target.className.match(options.qClass)) 
					{
						event.preventDefault ? event.preventDefault() : (event.returnValue = false);

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
		}

		// Window resize
		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	for (let i = 0; i < containers.length; i++)
				{
		    		let elements = containers[i].querySelectorAll('.' + options.elClass);
		    		changeHeight(elements);
		    	}
		    }, 100);	
		});
	}

	/* 
		Extend defaults
		defaults = defaults options defined in script [object]
		properties = options defined by user [object]
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

	/* 
		Change element height, when window is resized and when element is active
		el = all elements [object]
	*/
	function changeHeight(el)
	{
		let height, answer
		for (let i = 0; i < el.length; i++) 
		{
			if (el[i].className.match('active')) 
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
	function hideElement(element)
	{
		let answer = element.querySelector('.' + options.aClass);
		answer.style.height = 0;
	}

	/*
	 	Set transition 
	 	element = current element [object]
	*/
	function setTransition(element)
	{
		let el = element.querySelector('.' + options.aClass);
		el.style.WebkitTransitionDuration = options.duration + 'ms'; 
		el.style.transitionDuration = options.duration + 'ms';
	}

	/* 
		Toggle current element
		element = current element [object]
	*/
	function toggleElement(element)
	{
		let height, answer = element.querySelector('.' + options.aClass);

		if (element.classList)
		{
			element.classList.toggle('active');
		}
		else
		{
			// For IE
			let classes = element.className.split(' ');
			let i = classes.indexOf('active');

			if (i >= 0)
				classes.splice(i, 1);
			else
				classes.push('active');

			element.className = classes.join(' ');
		} 

		if (parseInt(answer.style.height) > 0)
			answer.style.height = 0;
		else
		{ 
			// Set to auto, get height and set back to 0
			answer.style.height = 'auto';
			height = answer.offsetHeight;
			answer.style.height = 0;

			setTimeout(() => {
				answer.style.height = height + 'px';
			}, 10);
		}
	}

	/* 
		Close all elements without the current element
		el = elements [object]
		current = current element [number]
	*/
	function closeAllElements(el, current)
	{
		for (let i = 0; i < el.length; i++) 
		{
			if(i != current)
			{
 				let newClassName = '';
				let classes = el[i].className.split(' ');

				for(let i = 0; i < classes.length; i++)
				{
					if(classes[i] !== 'active')
						newClassName += classes[i];
				}

				el[i].className = newClassName;

				hideElement(el[i]);
			}
		}
	}

	window.Accordion = Accordion;

})(window);