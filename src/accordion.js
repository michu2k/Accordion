/*!
 * Accordion v2.7.3
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
        const length = this.elements.length;

        // Set ARIA
        if (this.options.aria) {
          this.container.setAttribute('role', 'tablist');
        }

        // For each element
        for (let i = 0; i < length; i++) {
          const element = this.elements[i];

          // When JS is enabled, add the class to the elements
          element.classList.add('js-enabled');

          this.hideElement(element);
          this.setTransition(element);
          this.generateID(element);

          // Set ARIA
          if (this.options.aria) {
            this.setARIA(element);
          }

          // On press Enter
          element.addEventListener('keydown', event => {
            if (event.keyCode == 13) {
              this.callEvent(i, event);
            }
          });  

          // On click
          element.addEventListener('click', event => {
            this.callEvent(i, event);
          });
        }

        // Show accordion element when script is loaded
        if (this.options.showItem) {
          // Default value
          let el = this.elements[0];

          if (typeof this.options.itemNumber === 'number' && this.options.itemNumber < length) {
            el = this.elements[this.options.itemNumber];
          }

          this.toggleElement(el, false);
        }

        this.resizeHandler();
      },

      /**
       * Hide element
       * @param {object} element = list item
       */
      hideElement(element) {
        const answer = element.querySelector('.' + this.options.answerClass);
        answer.style.height = 0; 
      },

      /**
       * Set transition 
       * @param {object} element = current element
       */
      setTransition(element) {
        const el = element.querySelector('.' + this.options.answerClass);
        const transition = isWebkit('transition');

        el.style[transition] = this.options.duration + 'ms';
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
        const question = element.querySelector('.' + this.options.questionClass);
        const answer = element.querySelector('.' + this.options.answerClass);

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
        const question = element.querySelector('.' + this.options.questionClass);
        question.setAttribute('aria-expanded', value);       
      },

      /**
       * Call event
       * @param {number} index = item index
       * @param {object} event = event type
       */
      callEvent(index, event) {
        const target = event.target.className;

        // Check if target has one of the classes
        if (target.match(this.options.questionClass) || target.match(this.options.targetClass)) {

          event.preventDefault();

          if (this.options.closeOthers) {
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
      toggleElement(element, animation = true) {
        const answer = element.querySelector('.' + this.options.answerClass);
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
        if (this.options.aria) {
          this.updateARIA(element, ariaValue);
        }

        // Call onToggle function
        if (animation) {
          this.options.onToggle(element, this.elements);
        }
      },

      /**
       * Close all elements without the current element
       * @param {number} current = current element
       */
      closeAllElements(current) {
        const length = this.elements.length;

        for (let i = 0; i < length; i++) {
          if (i != current) {
            const element = this.elements[i];

            // Remove active class
            if (element.classList.contains('is-active')) {
              element.classList.remove('is-active');
            }

            // Update ARIA
            if (this.options.aria) {
              this.updateARIA(element, false);
            }

            this.hideElement(element);
          }
        }   
      },

      /**
       * Change element height, when window is resized and when element is active
       */
      changeHeight() {
        let height;
        let answer;
        const activeElement = this.container.querySelectorAll('.' + this.options.elementClass + '.is-active');

        for (let i = 0; i < activeElement.length; i++) {
          answer = activeElement[i].querySelector('.' + this.options.answerClass);

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
       * Resize handler
       */
      resizeHandler() {
        window.addEventListener('resize', () => {
          this.changeHeight();
        });
      }
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