/*!
 * Accordion v2.6.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function (window) {

    'use strict';

    var uniqueId = 0;

    /**
     * Core
     * @param {string} selector = container, where script will be defined
     * @param {object} userOptions = options defined by user
     */
    var Accordion = function Accordion(selector, userOptions) {

        var ac = {
            /**
             * Init accordion
             */
            init: function init() {
                var _this = this;

                // Defaults 
                var defaults = {
                    duration: 600, // animation duration in ms {number}
                    itemNumber: 0, // item number which will be shown {number}
                    aria: true, // add ARIA elements to the HTML structure {boolean}
                    closeOthers: true, // show only one element at the same time {boolean}
                    showItem: false, // always show element that has itemNumber number {boolean}
                    elementClass: 'ac', // element class {string}
                    questionClass: 'ac-q', // question class {string}
                    answerClass: 'ac-a', // answer class {string}
                    targetClass: 'ac-target' // target class {string}
                };

                this.options = extendDefaults(defaults, userOptions);

                // Get container elements
                this.container = document.querySelector(selector);
                this.elements = this.container.querySelectorAll('.' + this.options.elementClass);

                if (this.options.aria === true) {
                    this.container.setAttribute('role', 'tablist');
                }

                // For each element

                var _loop = function _loop(i) {
                    var element = _this.elements[i];

                    _this.hideElement(element);
                    _this.setTransition(element);
                    _this.generateID(element);

                    // Set ARIA
                    if (_this.options.aria === true) {
                        _this.setARIA(element);
                    }

                    // On press Enter
                    element.addEventListener('keydown', function (event) {
                        if (event.keyCode == 13) {
                            _this.callEvent(i, event);
                        }
                    });

                    // On click
                    element.addEventListener('click', function (event) {
                        _this.callEvent(i, event);
                    });
                };

                for (var i = 0; i < this.elements.length; i++) {
                    _loop(i);
                }

                // Show accordion element when script is loaded
                if (this.options.showItem === true) {

                    // Default value
                    var el = this.elements[0];

                    if (typeof this.options.itemNumber === 'number' && this.options.itemNumber < this.elements.length) {
                        el = this.elements[this.options.itemNumber];
                    }

                    this.toggleElement(el, false);
                }

                this.resize.call(this);
            },

            /**
             * Hide element
             * @param {object} element = list item
             */
            hideElement: function hideElement(element) {
                var answer = element.querySelector('.' + this.options.answerClass);
                answer.style.height = 0;
            },

            /**
             * Set transition 
             * @param {object} element = current element
             */
            setTransition: function setTransition(element) {
                var el = element.querySelector('.' + this.options.answerClass);
                var transition = isWebkit('transition');

                el.style[transition] = this.options.duration + 'ms';
            },

            /**
             * Generate unique ID for each element
             * @param {object} element = list item
             */
            generateID: function generateID(element) {
                element.setAttribute('id', 'ac-' + uniqueId);
                uniqueId++;
            },

            /**
             * Create ARIA
             * @param {object} element = list item
             */
            setARIA: function setARIA(element) {
                var question = void 0;
                var answer = void 0;

                question = element.querySelector('.' + this.options.questionClass);
                question.setAttribute('role', 'tab');
                question.setAttribute('aria-expanded', 'false');

                answer = element.querySelector('.' + this.options.answerClass);
                answer.setAttribute('role', 'tabpanel');
            },

            /**
             * Update ARIA
             * @param {object} element = list item
             * @param {boolean} value = value of the attribute
             */
            updateARIA: function updateARIA(element, value) {
                var question = element.querySelector('.' + this.options.questionClass);
                question.setAttribute('aria-expanded', value);
            },

            /**
             * Call event
             * @param {number} index = item index
             * @param {object} event = event type
             */
            callEvent: function callEvent(index, event) {
                var target = event.target || event.srcElement;

                // Check if target has one of the classes
                if (target.className.match(this.options.questionClass) || target.className.match(this.options.targetClass)) {

                    event.preventDefault ? event.preventDefault() : event.returnValue = false;

                    if (this.options.closeOthers === true) {
                        this.closeAllElements(index);
                    }

                    this.toggleElement(this.elements[index]);
                }
            },

            /** 
             * Toggle current element
             * @param {object} element = current element
             * @param {boolean} animation = turn on animation
             */
            toggleElement: function toggleElement(element) {
                var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                var answer = element.querySelector('.' + this.options.answerClass);
                var height = answer.scrollHeight;
                var ariaValue = void 0;

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
                    ariaValue = false;

                    requestAnimationFrame(function () {
                        answer.style.height = 0;
                    });
                } else {
                    ariaValue = true;

                    requestAnimationFrame(function () {
                        answer.style.height = height + 'px';
                    });
                }

                // Update ARIA
                if (this.options.aria === true) {
                    this.updateARIA(element, ariaValue);
                }
            },

            /**
             * Close all elements without the current element
             * @param {number} current = current element
             */
            closeAllElements: function closeAllElements(current) {
                for (var i = 0; i < this.elements.length; i++) {
                    if (i != current) {
                        var _element = this.elements[i];

                        //Remove active class
                        if (_element.classList) {
                            if (_element.classList.contains('active')) {
                                _element.classList.remove('active');
                            }
                        } else {
                            // For IE
                            var classes = _element.className.split(' ');
                            var j = classes.indexOf('active');

                            if (j >= 0) {
                                classes.splice(j, 1);
                            }

                            _element.className = classes.join(' ');
                        }

                        // Update ARIA
                        if (this.options.aria === true) {
                            this.updateARIA(_element, false);
                        }

                        this.hideElement(_element);
                    }
                }
            },

            /**
             * Change element height, when window is resized and when element is active
             */
            changeHeight: function changeHeight() {
                var height = void 0;
                var answer = void 0;
                var activeElement = this.container.querySelectorAll('.' + this.options.elementClass + '.active');

                for (var i = 0; i < activeElement.length; i++) {
                    answer = activeElement[i].querySelector('.' + this.options.answerClass);

                    // Set to auto and get new height
                    requestAnimationFrame(function () {
                        answer.style.height = 'auto';
                        height = answer.offsetHeight;

                        requestAnimationFrame(function () {
                            answer.style.height = height + 'px';
                        });
                    });
                }
            },

            /**
             * Calculate the slider when changing the window size
             */
            resize: function resize() {
                var _this2 = this;

                window.addEventListener('resize', function () {
                    _this2.changeHeight();
                });
            }
        };

        /**
         * Get supported property and add webkit prefix if needed
         * @param {string} property = property name
         * @return {string} property = property with optional webkit prefix
         */
        function isWebkit(property) {
            if (typeof document.documentElement.style[property] === 'string') {
                return property;
            }

            property = capitalizeFirstLetter(property);
            property = 'webkit' + property;

            return property;
        }

        /**
         * Capitalize the first letter in the string
         * @param {string} string = string
         * @return {string} string = changed string
         */
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
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

        ac.init();
    };

    window.Accordion = Accordion;
})(window);