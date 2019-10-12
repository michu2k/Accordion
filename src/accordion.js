/*!
 * Accordion v2.8.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2019 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

  'use strict';

  let uniqueId = 0;

  /**
   * Core
   * @param {string} selector = container in which the script will be initialized
   * @param {object} userOptions = options defined by user
   */
  const Accordion = function(selector, userOptions) {
    const _this = this;
        
    const ac = {
      /**
       * Init accordion
       */
      init() {
        // Defaults 
        const defaults = {
          duration: 600, // animation duration in ms {number}
          itemNumber: 0, // item number which will be shown {number}
          aria: true, // add ARIA elements to the HTML structure {boolean}
          closeOthers: true, // show only one element at the same time {boolean}
          showItem: false, // always show element that has itemNumber number {boolean}
          elementClass: 'ac', // element class {string}
          questionClass: 'ac-q', // question class {string}
          answerClass: 'ac-a', // answer class {string}
          targetClass: 'ac-target', // target class {string}
          onToggle: () => {} // calls when toggling an item {function}
        };

        // Break the array with the selectors
        if (Array.isArray(selector)) {
          if (selector.length) {
            selector.map(single => new Accordion(single, userOptions));
          }

          return false;
        }

        this.options = extendDefaults(defaults, userOptions);
        this.container = document.querySelector(selector);
        this.elements = this.container.querySelectorAll('.' + this.options.elementClass);
        const { aria, showItem, itemNumber } = this.options;

        // Set ARIA
        if (aria) {
          this.container.setAttribute('role', 'tablist');
        }

        // For each element
        for (let i = 0; i < this.elements.length; i++) {
          const element = this.elements[i];

          // When JS is enabled, add the class to the elements
          element.classList.add('js-enabled');

          this.hideElement(element);
          this.setTransition(element);
          this.generateID(element);

          // Set ARIA
          if (aria) {
            this.setARIA(element);
          }
        }

        // Show accordion element when script is loaded
        if (showItem) {
          let el = this.elements[0]; // Default value
          if (typeof itemNumber === 'number' && itemNumber < this.elements.length) {
            el = this.elements[itemNumber];
          }

          this.toggleElement(el, false);
        }

        _this.attachEvents();
      },

      /**
       * Set transition 
       * @param {object} element = current element
       */
      setTransition(element) {
        const { duration, answerClass } = this.options;
        const el = element.querySelector('.' + answerClass);
        const transition = isWebkit('transition');

        el.style[transition] = duration + 'ms';
      },

      /**
       * Generate unique ID for each element
       * @param {object} element = list item
       */
      generateID(element) {
        element.setAttribute('id', `ac-${uniqueId}`);
        uniqueId++;
      },

      /**
       * Create ARIA
       * @param {object} element = list item
       */
      setARIA(element) {
        const { questionClass, answerClass } = this.options;
        const question = element.querySelector('.' + questionClass);
        const answer = element.querySelector('.' + answerClass);

        question.setAttribute('role', 'tab');
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('role', 'tabpanel'); 
      },

      /**
       * Update ARIA
       * @param {object} element = list item
       * @param {boolean} value = value of the attribute
       */
      updateARIA(element, value) {
        const { questionClass } = this.options;
        const question = element.querySelector('.' + questionClass);
        question.setAttribute('aria-expanded', value);       
      },

      /**
       * Show specific accordion element
       * @param {object} e = event
       */
      callSpecificElement(e) {
        const target = e.target;
        const { questionClass, targetClass, closeOthers } = this.options;

        for (let i = 0; i < this.elements.length; i++) {
          if (this.elements[i].contains(target)) {

            // Check if target has one of the classes
            if (target.className.match(questionClass) || target.className.match(targetClass)) {
              e.preventDefault();

              if (closeOthers) {
                this.closeAllElements(i);
              }

              this.toggleElement(this.elements[i]);
            } 

            break;
          } 
        }
      },

      /**
       * Hide element
       * @param {object} element = list item
       */
      hideElement(element) {
        const { answerClass } = this.options;
        const answer = element.querySelector('.' + answerClass);
        answer.style.height = 0; 
      },

      /** 
       * Toggle current element
       * @param {object} element = current element
       * @param {boolean} animation = turn on animation
       */
      toggleElement(element, animation = true) {
        const { answerClass, aria, onToggle } = this.options;
        const answer = element.querySelector('.' + answerClass);
        const height = answer.scrollHeight;
        let ariaValue;

        // Toggle class
        element.classList.toggle('is-active');

        // Open element without animation
        if (!animation) {
          answer.style.height = 'auto';
        }

        // Set height
        if (parseInt(answer.style.height) > 0) {
          ariaValue = false;

          requestAnimationFrame(() => {
            answer.style.height = 0;
          });
        } else {
          ariaValue = true;

          requestAnimationFrame(() => {
            answer.style.height = height + 'px';
          });
        }

        // Update ARIA
        if (aria) {
          this.updateARIA(element, ariaValue);
        }

        // Call onToggle function
        if (animation) {
          onToggle(element, this.elements);
        }
      },

      /**
       * Close all elements without the current element
       * @param {number} current = current element
       */
      closeAllElements(current) {
        const { aria } = this.options;
        const length = this.elements.length;

        for (let i = 0; i < length; i++) {
          if (i != current) {
            const element = this.elements[i];

            // Remove active class
            if (element.classList.contains('is-active')) {
              element.classList.remove('is-active');
            }

            // Update ARIA
            if (aria) {
              this.updateARIA(element, false);
            }

            this.hideElement(element);
          }
        }   
      },

      /**
       * Resize handler
       */
      resizeHandler() {
        let height, answer;
        const { elementClass, answerClass } = this.options;
        const activeElement = this.container.querySelectorAll('.' + elementClass + '.is-active');

        // Change element height, when window is resized and when element is active
        for (let i = 0; i < activeElement.length; i++) {
          answer = activeElement[i].querySelector('.' + answerClass);

          // Set to auto and get new height
          requestAnimationFrame(() => {
            answer.style.height = 'auto';
            height = answer.offsetHeight;

            requestAnimationFrame(() => {
              answer.style.height = height + 'px';
            });
          });
        }   
      },

      /**
       * Click handler
       * @param {object} e = event
       */
      clickHandler(e) {
        this.callSpecificElement(e);
      },

      /**
       * Keydown handler
       * @param {object} e = event
       */
      keydownHandler(e) {
        const ENTER = 13;
        if (e.keyCode === ENTER) {
          this.callSpecificElement(e);
        }
      }
    };

    /**
     * Attach events
     */
    this.attachEvents = () => {
      const _this = ac;

      _this.clickHandler = _this.clickHandler.bind(_this);
      _this.keydownHandler = _this.keydownHandler.bind(_this);
      _this.resizeHandler = _this.resizeHandler.bind(_this);

      _this.container.addEventListener('click', _this.clickHandler);
      _this.container.addEventListener('keydown', _this.keydownHandler);
      window.addEventListener('resize', _this.resizeHandler);
    };

    /**
     * Detach events
     */
    this.detachEvents = () => {
      const _this = ac;

      _this.container.removeEventListener('click', _this.clickHandler);
      _this.container.removeEventListener('keydown', _this.keydownHandler);
      window.removeEventListener('resize', _this.resizeHandler);
    };

    /**
     * Get supported property and add webkit prefix if needed
     * @param {string} property = property name
     * @return {string} property = property with optional webkit prefix
     */
    const isWebkit = property => {
      if (typeof document.documentElement.style[property] === 'string') {
        return property;
      }

      property = capitalizeFirstLetter(property);
      property = `webkit${property}`;

      return property;
    }

    /**
     * Capitalize the first letter in the string
     * @param {string} string = string
     * @return {string} string = changed string
     */
    const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

    /** 
     * Extend defaults
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = options defined by user
     * @return {object} defaults = modified options
     */
    const extendDefaults = (defaults, properties) => {
      for (let property in properties) {
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
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    ac.init();
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Accordion;
  } else {
    window.Accordion = Accordion;
  }

})(window);