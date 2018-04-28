/*!
 * Accordion v2.5.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function (window) {

    'use strict';

    var options = void 0;
    var uniqueId = 0;

    /**
     * Core
     * @param {string} selector = container, where script will be defined
     * @param {object} userOptions = options defined by user
     */
    var Accordion = function Accordion(selector, userOptions) {

        // Defaults 
        var defaults = {
            duration: 600,
            itemNumber: 0,
            aria: true,
            closeOthers: true,
            showItem: false,
            elementClass: 'ac',
            questionClass: 'ac-q',
            answerClass: 'ac-a',
            targetClass: 'ac-target'
        };

        options = extendDefaults(defaults, userOptions);

        // Get container elements
        var container = document.querySelector(selector);
        var elements = container.querySelectorAll('.' + options.elementClass);

        if (options.aria === true) {
            container.setAttribute('role', 'tablist');
        }

        // For each element

        var _loop = function _loop(i) {
            hideElement(elements[i]);
            setTransition(elements[i]);
            generateID(elements[i]);

            // set ARIA
            if (options.aria === true) {
                setARIA(elements[i]);
            }

            // On click
            elements[i].addEventListener('click', function (event) {

                var target = event.target || event.srcElement;

                // Check if target has one of the classes
                if (target.className.match(options.questionClass) || target.className.match(options.targetClass)) {

                    event.preventDefault ? event.preventDefault() : event.returnValue = false;

                    if (options.closeOthers === true) {
                        closeAllElements(elements, i);
                    }

                    toggleElement(this);
                }
            });
        };

        for (var i = 0; i < elements.length; i++) {
            _loop(i);
        }

        // Show element when script is loaded
        if (options.showItem === true) {

            // Default value
            var el = elements[0];

            if (typeof options.itemNumber === 'number' && options.itemNumber < elements.length) {
                el = elements[options.itemNumber];
            }

            toggleElement(el, false);
        }

        // Window resize
        var resize = void 0;

        window.addEventListener('resize', function () {
            cancelAnimationFrame(resize);
            resize = requestAnimationFrame(function () {
                changeHeight(container);
            });
        });
    };

    /**
     * Create ARIA
     * @param {object} element = list item
     */
    function setARIA(element) {
        var question = void 0;
        var answer = void 0;

        question = element.querySelector('.' + options.questionClass);
        question.setAttribute('role', 'tab');
        question.setAttribute('aria-expanded', 'false');

        answer = element.querySelector('.' + options.answerClass);
        answer.setAttribute('role', 'tabpanel');
    }

    /**
     * Update ARIA
     * @param {object} element = list item
     * @param {boolean} value = value of the attribute
     */
    function updateARIA(element, value) {
        var question = element.querySelector('.' + options.questionClass);
        question.setAttribute('aria-expanded', value);
    }

    /**
     * Generate unique ID for each element
     * @param {object} element = list item
     */
    function generateID(element) {
        element.setAttribute('id', 'ac-' + uniqueId);
        uniqueId++;
    }

    /**
     * Change element height, when window is resized and when element is active
     * @param {object} container = accordion container
     */
    function changeHeight(container) {
        var height = void 0;
        var answer = void 0;
        var elements = container.querySelectorAll('.' + options.elementClass);

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].className.match('active')) {

                answer = elements[i].querySelector('.' + options.answerClass);

                // Set to auto and get new height
                requestAnimationFrame(function () {
                    answer.style.height = 'auto';
                    height = answer.offsetHeight;

                    requestAnimationFrame(function () {
                        answer.style.height = height + 'px';
                    });
                });
            }
        }
    }

    /**
     * Hide element
     * @param {object} element = list item
     */
    function hideElement(element) {
        var question = element.querySelector('.' + options.questionClass);
        var answer = element.querySelector('.' + options.answerClass);

        requestAnimationFrame(function () {
            answer.style.height = 0;
        });
    }

    /**
     * Set transition 
     * @param {object} element = current element
     */
    function setTransition(element) {
        var el = element.querySelector('.' + options.answerClass);
        var transition = getSupportedProperty('Transition');

        el.style[transition] = options.duration + 'ms';
    }

    /** 
     * Toggle current element
     * @param {object} element = current element
     * @param {boolean} animation = turn on animation
     */
    function toggleElement(element) {
        var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var answer = element.querySelector('.' + options.answerClass);
        var height = answer.scrollHeight;

        // Toggle class
        if (element.classList) {
            element.classList.toggle('active');
        } else {
            // For IE
            var classes = element.className.split(' ');
            var j = classes.indexOf('active');

            if (j >= 0) {
                classes.splice(j, 1);
            } else {
                classes.push('active');
            }

            element.className = classes.join(' ');
        }

        // Open element without animation
        if (animation === false) {
            answer.style.height = 'auto';
        }

        // Set height
        if (parseInt(answer.style.height) > 0) {
            // Update ARIA
            if (options.aria === true) {
                updateARIA(element, false);
            }

            requestAnimationFrame(function () {
                answer.style.height = 0;
            });
        } else {
            // Update ARIA
            if (options.aria === true) {
                updateARIA(element, true);
            }

            requestAnimationFrame(function () {
                answer.style.height = height + 'px';
            });
        }
    }

    /**
     * Close all elements without the current element
     * @param {object} elements = list of elements
     * @param {number} current = current element
     */
    function closeAllElements(elements, current) {
        for (var i = 0; i < elements.length; i++) {
            if (i != current) {

                // Update ARIA
                if (options.aria === true) {
                    updateARIA(elements[i], false);
                }

                var newClassName = '';
                var classes = elements[i].className.split(' ');

                for (var _i = 0; _i < classes.length; _i++) {
                    if (classes[_i] !== 'active') {
                        newClassName += classes[_i];
                    }
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
    function getSupportedProperty(property) {
        var prefix = ['-', 'webkit', 'moz', 'ms', 'o'];
        var propertyWithPrefix = void 0;

        for (var i = 0; i < prefix.length; i++) {
            if (prefix[i] == '-') {
                propertyWithPrefix = property.toLowerCase();
            } else {
                propertyWithPrefix = prefix[i] + property;
            }

            if (typeof document.body.style[propertyWithPrefix] != 'undefined') {
                return propertyWithPrefix;
            }
        }

        return null;
    }

    /** 
     * Extend defaults
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = options defined by user
     * @return {object} defaults = modified options
     */
    function extendDefaults(defaults, properties) {
        if (properties != null && properties != undefined && properties != 'undefined') {
            for (var property in properties) {
                defaults[property] = properties[property];
            }
        }

        return defaults;
    }

    /**
     * RequestAnimationFrame support
     */
    window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    }();

    /**
     * CancelAnimationFrame support
     */
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }

    window.Accordion = Accordion;
})(window);