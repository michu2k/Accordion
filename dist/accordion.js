/**
 * Simple accordion created in pure Javascript.
 * Author: Michał Strumpf https://github.com/michu2k
 * License: MIT
 * Version: v2.3.0
 */

(function (window) {

	'use strict';

	var options = void 0;

	/**
  * Core
  * @param selector = container, where script will be defined [string]
  * @param userOptions = options defined by user [object]
  */
	var Accordion = function Accordion(selector, userOptions) {

		// Defaults	
		var defaults = {
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
		var containers = document.querySelectorAll(selector);

		var _loop = function _loop(i) {
			var elements = containers[i].querySelectorAll('.' + options.elementClass);

			var _loop2 = function _loop2(_i) {
				hideElement(elements[_i]);
				setTransition(elements[_i]);

				// On click
				elements[_i].addEventListener('click', function (event) {
					var target = event.target || event.srcElement;

					if (target.className.match(options.questionClass) || target.className.match(options.targetClass)) {
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						if (options.closeOthers === true) {
							closeAllElements(elements, _i);
						}

						toggleElement(this);
					}
				});
			};

			for (var _i = 0; _i < elements.length; _i++) {
				_loop2(_i);
			}

			// Show element when script is loaded
			if (options.showItem === true) {
				var el = elements[0];

				if (typeof options.itemNumber === 'number' && options.itemNumber < elements.length) {
					el = elements[options.itemNumber];
				}

				toggleElement(el, false);
			}
		};

		for (var i = 0; i < containers.length; i++) {
			_loop(i);
		}

		// Window resize
		window.addEventListener('resize', function () {
			clearTimeout(window.resizeTimer);
			window.resizeTimer = setTimeout(function () {
				changeHeight(containers);
			}, 100);
		});
	};

	/**
  * Change element height, when window is resized and when element is active
  * @param elements = all elements [object]
  */
	function changeHeight(containers) {
		var height = void 0,
		    answer = void 0;

		for (var i = 0; i < containers.length; i++) {
			var _elements = containers[i].querySelectorAll('.' + options.elementClass);

			for (var _i2 = 0; _i2 < _elements.length; _i2++) {
				if (_elements[_i2].className.match('active')) {
					answer = _elements[_i2].querySelector('.' + options.answerClass);

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
	function hideElement(element) {
		var answer = element.querySelector('.' + options.answerClass);
		answer.style.height = 0;
	}

	/**
  * Set transition 
  * @param element = current element [object]
  */
	function setTransition(element) {
		var el = element.querySelector('.' + options.answerClass);
		el.style.WebkitTransitionDuration = options.duration + 'ms';
		el.style.transitionDuration = options.duration + 'ms';
	}

	/** 
  * Toggle current element
  * @param element = current element [object]
  */
	function toggleElement(element) {
		var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

		var height = void 0,
		    answer = element.querySelector('.' + options.answerClass);

		// Toggle class
		if (element.classList) {
			element.classList.toggle('active');
		} else {
			// For IE
			var classes = element.className.split(' '),
			    j = classes.indexOf('active');

			if (j >= 0) classes.splice(j, 1);else classes.push('active');

			element.className = classes.join(' ');
		}

		// Set height
		if (parseInt(answer.style.height) > 0) answer.style.height = 0;else {
			// Set to auto, get height and set back to 0, if animation is not set to true.
			answer.style.height = 'auto';
			height = answer.offsetHeight;

			if (animation == false) {
				answer.style.height = height + 'px';
				return;
			}

			answer.style.height = 0;

			setTimeout(function () {
				answer.style.height = height + 'px';
			}, 10);
		}
	}

	/**
  * Close all elements without the current element
  * @param el = elements [object]
  * @param current = current element [number]
  */
	function closeAllElements(el, current) {
		for (var i = 0; i < el.length; i++) {
			if (i != current) {
				var newClassName = '';
				var classes = el[i].className.split(' ');

				for (var _i3 = 0; _i3 < classes.length; _i3++) {
					if (classes[_i3] !== 'active') newClassName += classes[_i3];
				}

				el[i].className = newClassName;

				hideElement(el[i]);
			}
		}
	}

	/** 
  * Extend defaults
  * @param defaults = defaults options defined in script [object]
  * @param properties = options defined by user [object]
  * @return defaults = modified options [object]
  */
	function extendDefaults(defaults, properties) {
		if (properties != null && properties != undefined && properties != 'undefined') {
			for (var property in properties) {
				defaults[property] = properties[property];
			}
		}

		return defaults;
	}

	window.Accordion = Accordion;
})(window);