/*!
 * Accordion v3.0.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2020 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

  'use strict';

  let uniqueId = 0;

  /**
   * Core
   * @param {string|HTMLElement} selectorOrElement = container in which the script will be initialized
   * @param {object} userOptions = options defined by user
   */
  const Accordion = function(selectorOrElement, userOptions) {
    const _this = this;

    // Break the array with the selectors
    if (Array.isArray(selectorOrElement)) {
      if (selectorOrElement.length) {
        return selectorOrElement.map(single => new Accordion(single, userOptions));
      }

      return false;
    }

    const ac = {
      /**
       * Init accordion
       */
      init() {
        const defaults = {
          duration: 600, // animation duration in ms {number}
          ariaEnabled: true, // add ARIA elements to the HTML structure {boolean}
          collapse: true, // allow collapse expanded panel
          showMultiple: false, // show multiple elements at the same time {boolean}
          openOnInit: [], // show accordion elements during initialization {array}
          elementClass: 'ac', // element class {string}
          triggerClass: 'ac-trigger', // trigger class {string}
          panelClass: 'ac-panel', // panel class {string}
          targetClass: 'ac-target', // target class {string}
          activeClass: 'is-active', // active element class {string}
          beforeOpen: () => {}, // calls before the item is opened {function}
          onOpen: () => {}, // calls when the item is opened {function}
          beforeClose: () => {}, // calls before the item is closed {function}
          onClose: () => {} // calls when the item is closed {function}
        };

        // Extend default options
        this.options = Object.assign(defaults, userOptions);

        const { elementClass } = this.options;
        const isString = (typeof selectorOrElement === 'string');

        this.container = isString ? document.querySelector(selectorOrElement) : selectorOrElement;
        this.elements = Array.from(this.container.querySelectorAll(`.${elementClass}`));

        this.firstElement = this.elements[0];
        this.lastElement = this.elements[this.elements.length - 1];
        this.currFocusedIdx = 0;

        this.elements.map(element => {
          // When JS is enabled, add the class to the element
          element.classList.add('js-enabled');

          this.hideElement(element);
          this.setTransition(element);
          this.generateIDs(element);
          this.setARIA(element);

          uniqueId++;
        });

        this.showElementsOnInit();
        _this.attachEvents();
      },

      /**
       * Show accordion elements during initialization
       */
      showElementsOnInit() {
        const { openOnInit } = this.options;
        if (!openOnInit.length) return;

        openOnInit.map((elementIdx) => {
          if (elementIdx < this.elements.length) {
            const element = this.elements[elementIdx];
            this.showElement(element, false);
          }
        });
      },

      /**
       * Set transition
       * @param {object} element = accordion item
       */
      setTransition(element) {
        const { duration, panelClass } = this.options;
        const el = element.querySelector(`.${panelClass}`);
        const transition = isWebkit('transitionDuration');

        el.style[transition] = duration + 'ms';
      },

      /**
       * Generate unique IDs for each element
       * @param {object} element = accordion item
       */
      generateIDs(element) {
        const { triggerClass, panelClass } = this.options;
        const trigger = element.querySelector(`.${triggerClass}`);
        const panel = element.querySelector(`.${panelClass}`);

        element.setAttribute('id', `ac-${uniqueId}`);
        trigger.setAttribute('id', `ac-trigger-${uniqueId}`);
        panel.setAttribute('id', `ac-panel-${uniqueId}`);
      },

      /**
       * Create ARIA
       * @param {object} element = accordion item
       */
      setARIA(element) {
        const { ariaEnabled, triggerClass, panelClass } = this.options;
        if (!ariaEnabled) return;

        const trigger = element.querySelector(`.${triggerClass}`);
        const panel = element.querySelector(`.${panelClass}`);

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-controls', `ac-panel-${uniqueId}`);
        trigger.setAttribute('aria-disabled', false);
        trigger.setAttribute('aria-expanded', false);

        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', `ac-trigger-${uniqueId}`);
      },

      /**
       * Update ARIA
       * @param {object} element = accordion item
       * @param {boolean} ariaExpanded = value of the attribute
       */
      updateARIA(element, ariaExpanded) {
        const { ariaEnabled, collapse, triggerClass } = this.options;
        if (!ariaEnabled) return;

        const trigger = element.querySelector(`.${triggerClass}`);
        trigger.setAttribute('aria-expanded', ariaExpanded);

        if (collapse) return;
        trigger.setAttribute('aria-disabled', true);
      },

      /**
       * Focus element
       * @param {object} e = event
       * @param {object} element = accordion item
       */
      focus(e, element) {
        e.preventDefault();

        const { triggerClass } = this.options;
        const trigger = element.querySelector(`.${triggerClass}`);
        trigger.focus();
      },

      /**
       * Focus first element
       * @param {object} e = event
       */
      focusFirstElement(e) {
        this.focus(e, this.firstElement);
        this.currFocusedIdx = 0;
      },

      /**
       * Focus last element
       * @param {object} e = event
       */
      focusLastElement(e) {
        this.focus(e, this.lastElement);
        this.currFocusedIdx = this.elements.length - 1;
      },

      /**
       * Focus next element
       * @param {object} e = event
       */
      focusNextElement(e) {
        const nextElIdx = this.currFocusedIdx + 1;
        if (nextElIdx > this.elements.length - 1) return this.focusFirstElement(e);

        this.focus(e, this.elements[nextElIdx]);
        this.currFocusedIdx = nextElIdx;
      },

      /**
       * Focus previous element
       * @param {object} e = event
       */
      focusPrevElement(e) {
        const prevElIdx = this.currFocusedIdx - 1;
        if (prevElIdx < 0) return this.focusLastElement(e);

        this.focus(e, this.elements[prevElIdx]);
        this.currFocusedIdx = prevElIdx;
      },

      /**
       * Show element
       * @param {object} element = accordion item
       * @param {boolean} calcHeight = calculate the height of the panel
       */
      showElement(element, calcHeight = true) {
        const { panelClass, activeClass, beforeOpen } = this.options;
        const panel = element.querySelector(`.${panelClass}`);
        const height = panel.scrollHeight;

        element.classList.add(activeClass);
        if (calcHeight) beforeOpen(element);

        panel.style.height = calcHeight ? `${height}px` : 'auto';

        this.updateARIA(element, true);
      },

      /**
       * Hide element
       * @param {object} element = accordion item
       */
      hideElement(element) {
        const { panelClass, activeClass, beforeClose } = this.options;
        const panel = element.querySelector(`.${panelClass}`);
        const height = panel.scrollHeight;
        const isElActive = element.classList.contains(activeClass);

        element.classList.remove(activeClass);

        if (isElActive) {
          beforeClose(element);

          // Animation X => 0
          requestAnimationFrame(() => {
            panel.style.height = `${height}px`;

            requestAnimationFrame(() => {
              panel.style.height = 0;
            });
          });

          this.updateARIA(element, false);
        } else {
          // Hide element without animation 'auto' => 0
          panel.style.height = 0;
        }
      },

      /**
       * Toggle element
       * @param {object} element = accordion item
       */
      toggleElement(element) {
        const { activeClass, collapse } = this.options;
        const isActive = element.classList.contains(activeClass);

        if (isActive && !collapse) return;
        return isActive ? this.hideElement(element) : this.showElement(element);
      },

      /**
       * Close all elements without the current element
       */
      closeAllElements() {
        const { showMultiple } = this.options;
        if (showMultiple) return;

        this.elements.map((element, idx) => {
          if (idx != this.currFocusedIdx) {
            this.hideElement(element);
          }
        });
      },

      /**
       * Show all elements
       */
      showAllElements() {
        const { panelClass, activeClass } = this.options;

        this.elements.map(element => {
          element.classList.add(activeClass);
          const panel = element.querySelector(`.${panelClass}`);
          panel.style.height = 'auto';
          this.showElement(element, false);
        });
      },

      /**
       * Handle click
       * @param {object} e = event
       */
      handleClick(e) {
        const target = e.currentTarget;

        this.elements.map((element, idx) => {
          if (element.contains(target) && e.target.nodeName !== 'A') {
            this.currFocusedIdx = idx;

            this.closeAllElements();
            this.focus(e, element);
            this.toggleElement(element);
          }
        });
      },

      /**
       * Handle keydown
       * @param {object} e = event
       */
      handleKeydown(e) {
        const KEYS = {
          ARROW_UP: 38,
          ARROW_DOWN: 40,
          HOME: 36,
          END: 35
        };

        switch (e.keyCode) {
          case KEYS.ARROW_UP:
            return this.focusPrevElement(e);

          case KEYS.ARROW_DOWN:
            return this.focusNextElement(e);

          case KEYS.HOME:
            return this.focusFirstElement(e);

          case KEYS.END:
            return this.focusLastElement(e);

          default:
            return null;
        }
      },

      /**
       * Handle transitionend
       * @param {object} e = event
       */
      handleTransitionEnd(e) {
        if (e.propertyName === 'height') {
          const { onOpen, onClose } = this.options;
          const panel = e.currentTarget;
          const height = parseInt(panel.style.height);
          const element = this.elements.find(element => element.contains(panel));

          if (height > 0) {
            panel.style.height = 'auto';
            onOpen(element);
          } else {
            onClose(element);
          }
        }
      }
    };

    let eventsAttached = null;

    /**
     * Attach events
     */
    this.attachEvents = () => {
      if (eventsAttached) return;

      const _this = ac;
      const { triggerClass, panelClass } = _this.options;

      _this.handleClick = _this.handleClick.bind(_this);
      _this.handleKeydown = _this.handleKeydown.bind(_this);
      _this.handleTransitionEnd = _this.handleTransitionEnd.bind(_this);

      _this.elements.map(element => {
        const trigger = element.querySelector(`.${triggerClass}`);
        const panel = element.querySelector(`.${panelClass}`);

        trigger.addEventListener('click', _this.handleClick);
        trigger.addEventListener('keydown', _this.handleKeydown);
        panel.addEventListener('transitionend', _this.handleTransitionEnd);
      });

      // if (eventsAttached !== null) {
      //   _this.showElementsOnInit();
      // }
      eventsAttached = true;
    };

    /**
     * Detach events
     */
    this.detachEvents = () => {
      if (!eventsAttached) return;

      const _this = ac;
      const { triggerClass, panelClass } = _this.options;

      _this.elements.map(element => {
        const trigger = element.querySelector(`.${triggerClass}`);
        const panel = element.querySelector(`.${panelClass}`);

        trigger.removeEventListener('click', _this.handleClick);
        trigger.removeEventListener('keydown', _this.handleKeydown);
        panel.removeEventListener('transitionend', _this.handleTransitionEnd);
      });

      // _this.showAllElements();
      eventsAttached = false;
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
    };

    /**
     * Capitalize the first letter in the string
     * @param {string} string = string
     * @return {string} string = changed string
     */
    const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

    ac.init();
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Accordion;
  } else {
    window.Accordion = Accordion;
  }

})(window);