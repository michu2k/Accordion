'use strict'
/*!
 * Accordion v3.0.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2020 Michał Strumpf
 * Published under MIT License
 */;

(function (window) {
  'use strict';

  var uniqueId = 0;

  /**
   * Core
   * @param {string|HTMLElement} selectorOrElement = container in which the script will be initialized
   * @param {object} userOptions = options defined by user
   */
  var Accordion = function Accordion(selectorOrElement, userOptions) {
    var _this = this;

    // Break the array with the selectors
    if (Array.isArray(selectorOrElement)) {
      if (selectorOrElement.length) {
        return selectorOrElement.map(function (single) {
          return new Accordion(single, userOptions);
        });
      }

      return false;
    }

    var ac = {
      /**
       * Init accordion
       */
      init: function init() {
        var _this2 = this;
        var defaults = {
          duration: 600, // animation duration in ms {number}
          aria: true, // add ARIA elements to the HTML structure {boolean}
          collapse: true, // TODO:
          showMultiple: false, // show multiple elements at the same time {boolean}
          openOnInit: [], // show accordion elements during initialization {array}
          elementClass: 'ac', // element class {string}
          triggerClass: 'ac-trigger', // trigger class {string}
          panelClass: 'ac-panel', // panel class {string}
          targetClass: 'ac-target', // target class {string}
          activeClass: 'is-active', // active element class {string}
          beforeOpen: function beforeOpen() {}, // calls before the item is opened {function}
          onOpen: function onOpen() {}, // calls when the item is opened {function}
          beforeClose: function beforeClose() {}, // calls before the item is closed {function}
          onClose: function onClose() {}, // calls when the item is closed {function}
        };

        // Extend default options
        this.options = Object.assign(defaults, userOptions);
        var elementClass = this.options.elementClass;
        var isString = typeof selectorOrElement === 'string';

        this.container = isString ? document.querySelector(selectorOrElement) : selectorOrElement;
        this.elements = Array.from(this.container.querySelectorAll('.'.concat(elementClass)));

        this.firstElement = this.elements[0];
        this.lastElement = this.elements[this.elements.length - 1];
        this.currFocusedIdx = 0;

        this.elements.map(function (element) {
          // When JS is enabled, add the class to the element
          element.classList.add('js-enabled');

          _this2.hideElement(element);
          _this2.setTransition(element);
          _this2.generateIDs(element);
          _this2.setARIA(element);

          uniqueId++;
        });

        this.showElementsOnInit();
        _this.attachEvents();
      },

      /**
       * Show accordion elements during initialization
       */
      showElementsOnInit: function showElementsOnInit() {
        var _this3 = this;
        var openOnInit = this.options.openOnInit;
        if (!openOnInit.length) return;

        openOnInit.map(function (elementIdx) {
          if (elementIdx < _this3.elements.length) {
            var element = _this3.elements[elementIdx];
            _this3.showElement(element, false);
          }
        });
      },

      /**
       * Set transition
       * @param {object} element = accordion item
       */
      setTransition: function setTransition(element) {
        var _this$options = this.options,
          duration = _this$options.duration,
          panelClass = _this$options.panelClass;
        var el = element.querySelector('.'.concat(panelClass));
        var transition = isWebkit('transitionDuration');

        el.style[transition] = duration + 'ms';
      },

      /**
       * Generate unique IDs for each element
       * @param {object} element = accordion item
       */
      generateIDs: function generateIDs(element) {
        var _this$options2 = this.options,
          triggerClass = _this$options2.triggerClass,
          panelClass = _this$options2.panelClass;
        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        element.setAttribute('id', 'ac-'.concat(uniqueId));
        trigger.setAttribute('id', 'ac-trigger-'.concat(uniqueId));
        panel.setAttribute('id', 'ac-panel-'.concat(uniqueId));
      },

      /**
       * Create ARIA
       * @param {object} element = accordion item
       */
      setARIA: function setARIA(element) {
        var _this$options3 = this.options,
          aria = _this$options3.aria,
          triggerClass = _this$options3.triggerClass,
          panelClass = _this$options3.panelClass;
        if (!aria) return;

        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-controls', 'ac-panel-'.concat(uniqueId));
        trigger.setAttribute('aria-disabled', 'false');
        trigger.setAttribute('aria-expanded', 'false');

        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', 'ac-trigger-'.concat(uniqueId));
      },

      /**
       * Update ARIA
       * @param {object} element = accordion item
       * @param {boolean} value = value of the attribute
       */
      updateARIA: function updateARIA(element, value) {
        var _this$options4 = this.options,
          aria = _this$options4.aria,
          triggerClass = _this$options4.triggerClass;
        if (!aria) return;

        var trigger = element.querySelector('.'.concat(triggerClass));
        trigger.setAttribute('aria-expanded', value);
      },

      /**
       * Focus element
       * @param {object} e = event
       * @param {object} element = accordion item
       */
      focus: function focus(e, element) {
        e.preventDefault();
        var triggerClass = this.options.triggerClass;
        var trigger = element.querySelector('.'.concat(triggerClass));
        trigger.focus();
      },

      /**
       * Focus first element
       * @param {object} e = event
       */
      focusFirstElement: function focusFirstElement(e) {
        this.focus(e, this.firstElement);
        this.currFocusedIdx = 0;
      },

      /**
       * Focus last element
       * @param {object} e = event
       */
      focusLastElement: function focusLastElement(e) {
        this.focus(e, this.lastElement);
        this.currFocusedIdx = this.elements.length - 1;
      },

      /**
       * Focus next element
       * @param {object} e = event
       */
      focusNextElement: function focusNextElement(e) {
        var nextElIdx = this.currFocusedIdx + 1;
        if (nextElIdx > this.elements.length - 1) return this.focusFirstElement(e);

        this.focus(e, this.elements[nextElIdx]);
        this.currFocusedIdx = nextElIdx;
      },

      /**
       * Focus previous element
       * @param {object} e = event
       */
      focusPrevElement: function focusPrevElement(e) {
        var prevElIdx = this.currFocusedIdx - 1;
        if (prevElIdx < 0) return this.focusLastElement(e);

        this.focus(e, this.elements[prevElIdx]);
        this.currFocusedIdx = prevElIdx;
      },

      /**
       * Show element
       * @param {object} element = accordion item
       * @param {boolean} calcHeight = calculate the height of the panel
       */
      showElement: function showElement(element) {
        var calcHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var _this$options5 = this.options,
          panelClass = _this$options5.panelClass,
          activeClass = _this$options5.activeClass,
          beforeOpen = _this$options5.beforeOpen;
        var panel = element.querySelector('.'.concat(panelClass));
        var height = panel.scrollHeight;

        element.classList.add(activeClass);
        if (calcHeight) beforeOpen(element);

        panel.style.height = calcHeight ? ''.concat(height, 'px') : 'auto';

        this.updateARIA(element, true);
      },

      /**
       * Hide element
       * @param {object} element = accordion item
       */
      hideElement: function hideElement(element) {
        var _this$options6 = this.options,
          panelClass = _this$options6.panelClass,
          activeClass = _this$options6.activeClass,
          beforeClose = _this$options6.beforeClose;
        var panel = element.querySelector('.'.concat(panelClass));
        var height = panel.scrollHeight;
        var isElActive = element.classList.contains(activeClass);

        element.classList.remove(activeClass);

        if (isElActive) {
          beforeClose(element);

          // Animation X => 0
          requestAnimationFrame(function () {
            panel.style.height = ''.concat(height, 'px');

            requestAnimationFrame(function () {
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
      toggleElement: function toggleElement(element) {
        var activeClass = this.options.activeClass;
        var isActive = element.classList.contains(activeClass);
        return isActive ? this.hideElement(element) : this.showElement(element);
      },

      /**
       * Close all elements without the current element
       */
      closeAllElements: function closeAllElements() {
        var _this4 = this;
        var showMultiple = this.options.showMultiple;
        if (showMultiple) return;

        this.elements.map(function (element, idx) {
          if (idx != _this4.currFocusedIdx) {
            _this4.hideElement(element);
          }
        });
      },

      /**
       * Show all elements
       */
      showAllElements: function showAllElements() {
        var _this5 = this;
        var _this$options7 = this.options,
          panelClass = _this$options7.panelClass,
          activeClass = _this$options7.activeClass;

        this.elements.map(function (element) {
          element.classList.add(activeClass);
          var panel = element.querySelector('.'.concat(panelClass));
          panel.style.height = 'auto';
          _this5.showElement(element, false);
        });
      },

      /**
       * Handle click
       * @param {object} e = event
       */
      handleClick: function handleClick(e) {
        var _this6 = this;
        var target = e.currentTarget;

        this.elements.map(function (element, idx) {
          if (element.contains(target) && e.target.nodeName !== 'A') {
            _this6.currFocusedIdx = idx;

            _this6.closeAllElements();
            _this6.focus(e, element);
            _this6.toggleElement(element);
          }
        });
      },

      /**
       * Handle keydown
       * @param {object} e = event
       */
      handleKeydown: function handleKeydown(e) {
        var KEYS = {
          ARROW_UP: 38,
          ARROW_DOWN: 40,
          HOME: 36,
          END: 35,
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
      handleTransitionEnd: function handleTransitionEnd(e) {
        if (e.propertyName === 'height') {
          var _this$options8 = this.options,
            onOpen = _this$options8.onOpen,
            onClose = _this$options8.onClose;
          var panel = e.currentTarget;
          var height = parseInt(panel.style.height);
          var element = this.elements.find(function (element) {
            return element.contains(panel);
          });

          if (height > 0) {
            panel.style.height = 'auto';
            onOpen(element);
          } else {
            onClose(element);
          }
        }
      },
    };

    var eventsAttached = null;

    /**
     * Attach events
     */
    this.attachEvents = function () {
      if (eventsAttached) return;

      var _this = ac;
      var _this$options9 = _this.options,
        triggerClass = _this$options9.triggerClass,
        panelClass = _this$options9.panelClass;

      _this.handleClick = _this.handleClick.bind(_this);
      _this.handleKeydown = _this.handleKeydown.bind(_this);
      _this.handleTransitionEnd = _this.handleTransitionEnd.bind(_this);

      _this.elements.map(function (element) {
        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.addEventListener('click', _this.handleClick);
        trigger.addEventListener('keydown', _this.handleKeydown);
        panel.addEventListener('transitionend', _this.handleTransitionEnd);
      });

      if (eventsAttached !== null) {
        _this.showElementsOnInit();
      }
      eventsAttached = true;
    };

    /**
     * Detach events
     */
    this.detachEvents = function () {
      if (!eventsAttached) return;

      var _this = ac;
      var _this$options10 = _this.options,
        triggerClass = _this$options10.triggerClass,
        panelClass = _this$options10.panelClass;

      _this.elements.map(function (element) {
        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.removeEventListener('click', _this.handleClick);
        trigger.removeEventListener('keydown', _this.handleKeydown);
        panel.removeEventListener('transitionend', _this.handleTransitionEnd);
      });

      _this.showAllElements();
      eventsAttached = false;
    };

    /**
     * Get supported property and add webkit prefix if needed
     * @param {string} property = property name
     * @return {string} property = property with optional webkit prefix
     */
    var isWebkit = function isWebkit(property) {
      if (typeof document.documentElement.style[property] === 'string') {
        return property;
      }

      property = capitalizeFirstLetter(property);
      property = 'webkit'.concat(property);

      return property;
    };

    /**
     * Capitalize the first letter in the string
     * @param {string} string = string
     * @return {string} string = changed string
     */
    var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    ac.init();
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Accordion;
  } else {
    window.Accordion = Accordion;
  }
})(window);
