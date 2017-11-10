/*
	Simple accordion created in pure Javascript.
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v2.2.5
*/

'use strict';

(function (window) {

	var options = void 0;

	/* 
 	Core
 	selector = container, where script will be defined [string]
 	userOptions = new options defined by user [object]
 */
	var Accordion = function Accordion(selector, userOptions) {

		// Defaults	
		var defaults = {
			duration: 600,
			closeOthers: true,
			showFirst: false,
			elClass: 'ac',
			qClass: 'ac-q',
			aClass: 'ac-a'
		};

		options = extendDefaults(defaults, userOptions);

		// Get all container elements
		var containers = document.querySelectorAll(selector);

		var _loop = function _loop(i) {
			var elements = containers[i].querySelectorAll('.' + options.elClass);

			var _loop2 = function _loop2(_i) {
				hideElement(elements[_i]);
				setTransition(elements[_i]);

				elements[_i].addEventListener('click', function (event) {
					var _this = this;
					var target = event.target || event.srcElement;

					if (target.className.match(options.qClass)) {
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						if (options.closeOthers === true) {
							closeAllElements(elements, _i);
						}

						toggleElement(_this);
					}
				});
			};

			for (var _i = 0; _i < elements.length; _i++) {
				_loop2(_i);
			}

			if (options.showFirst === true) {
				toggleElement(elements[0]);
			}
		};

		for (var i = 0; i < containers.length; i++) {
			_loop(i);
		}

		// Window resize
		window.addEventListener('resize', function () {
			clearTimeout(window.resizeTimer);
			window.resizeTimer = setTimeout(function () {
				for (var i = 0; i < containers.length; i++) {
					var _elements = containers[i].querySelectorAll('.' + options.elClass);
					changeHeight(_elements);
				}
			}, 100);
		});
	};

	/* 
 	Extend defaults
 	defaults = defaults options defined in script [object]
 	properties = options defined by user [object]
 */
	function extendDefaults(defaults, properties) {
		if (properties != null && properties != undefined && properties != 'undefined') {
			for (var property in properties) {
				defaults[property] = properties[property];
			}
		}

		return defaults;
	}

	/* 
 	Change element height, when window is resized and when element is active
 	el = all elements [object]
 */
	function changeHeight(el) {
		var height = void 0,
		    answer = void 0;
		for (var i = 0; i < el.length; i++) {
			if (el[i].className.match('active')) {
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
		var answer = element.querySelector('.' + options.aClass);
		answer.style.height = 0;
	}

	/*
  	Set transition 
  	element = current element [object]
 */
	function setTransition(element) {
		var el = element.querySelector('.' + options.aClass);
		el.style.WebkitTransitionDuration = options.duration + 'ms';
		el.style.transitionDuration = options.duration + 'ms';
	}

	/* 
 	Toggle current element
 	element = current element [object]
 */
	function toggleElement(element) {
		var height = void 0,
		    answer = element.querySelector('.' + options.aClass);

		if (element.classList) {
			element.classList.toggle('active');
		} else {
			// For IE
			var classes = element.className.split(' ');
			var i = classes.indexOf('active');

			if (i >= 0) classes.splice(i, 1);else classes.push('active');

			element.className = classes.join(' ');
		}

		if (parseInt(answer.style.height) > 0) answer.style.height = 0;else {
			// Set to auto, get height and set back to 0
			answer.style.height = 'auto';
			height = answer.offsetHeight;
			answer.style.height = 0;

			setTimeout(function () {
				answer.style.height = height + 'px';
			}, 10);
		}
	}

	/* 
 	Close all elements without the current element
 	el = elements [object]
 	current = current element [number]
 */
	function closeAllElements(el, current) {
		for (var i = 0; i < el.length; i++) {
			if (i != current) {
				var newClassName = '';
				var classes = el[i].className.split(' ');

				for (var _i2 = 0; _i2 < classes.length; _i2++) {
					if (classes[_i2] !== 'active') newClassName += classes[_i2];
				}

				el[i].className = newClassName;

				hideElement(el[i]);
			}
		}
	}

	window.Accordion = Accordion;
})(window);