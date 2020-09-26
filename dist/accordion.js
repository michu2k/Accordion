/*!
 * Accordion v3.0.0
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright (c) Michał Strumpf
 * Published under MIT License
 */

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
    var eventsAttached = false;

    // Break the array with the selectors
    if (Array.isArray(selectorOrElement)) {
      if (selectorOrElement.length) {
        return selectorOrElement.map(function (single) {
          return new Accordion(single, userOptions);
        });
      }

      return false;
    }

    var core = {
      /**
       * Init accordion
       */
      init: function init() {
        var _this2 = this;
        var defaults = {
          duration: 600, // animation duration in ms {number}
          ariaEnabled: true, // add ARIA elements to the HTML structure {boolean}
          collapse: true, // allow collapse expanded panel {boolean}
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
        var _this$options = this.options,
          elementClass = _this$options.elementClass,
          openOnInit = _this$options.openOnInit;
        var isString = typeof selectorOrElement === 'string';

        this.container = isString ? document.querySelector(selectorOrElement) : selectorOrElement;
        this.elements = Array.from(this.container.querySelectorAll('.'.concat(elementClass)));

        this.firstElement = this.elements[0];
        this.lastElement = this.elements[this.elements.length - 1];
        this.currFocusedIdx = 0;

        this.elements.map(function (element, idx) {
          // When JS is enabled, add the class to the element
          element.classList.add('js-enabled');

          _this2.generateIDs(element);
          _this2.setARIA(element);
          _this2.setTransition(element);

          uniqueId++;
          return openOnInit.includes(idx) ? _this2.showElement(element, false) : _this2.closeElement(element, false);
        });

        _this.attachEvents();
      },

      /**
       * Set transition
       * @param {object} element = accordion item
       */
      setTransition: function setTransition(element) {
        var _this$options2 = this.options,
          duration = _this$options2.duration,
          panelClass = _this$options2.panelClass;
        var el = element.querySelector('.'.concat(panelClass));
        var transition = isWebkit('transitionDuration');

        el.style[transition] = ''.concat(duration, 'ms');
      },

      /**
       * Generate unique IDs for each element
       * @param {object} element = accordion item
       */
      generateIDs: function generateIDs(element) {
        var _this$options3 = this.options,
          triggerClass = _this$options3.triggerClass,
          panelClass = _this$options3.panelClass;
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
        var _this$options4 = this.options,
          ariaEnabled = _this$options4.ariaEnabled,
          triggerClass = _this$options4.triggerClass,
          panelClass = _this$options4.panelClass;
        if (!ariaEnabled) return;

        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-controls', 'ac-panel-'.concat(uniqueId));
        trigger.setAttribute('aria-disabled', false);
        trigger.setAttribute('aria-expanded', false);

        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', 'ac-trigger-'.concat(uniqueId));
      },

      /**
       * Update ARIA
       * @param {object} element = accordion item
       * @param {boolean} ariaExpanded = value of the attribute
       */
      updateARIA: function updateARIA(element, ariaExpanded) {
        var _this$options5 = this.options,
          ariaEnabled = _this$options5.ariaEnabled,
          collapse = _this$options5.collapse,
          triggerClass = _this$options5.triggerClass;
        if (!ariaEnabled) return;

        var trigger = element.querySelector('.'.concat(triggerClass));
        trigger.setAttribute('aria-expanded', ariaExpanded);

        if (collapse) return;
        trigger.setAttribute('aria-disabled', true);
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
        var _this$options6 = this.options,
          panelClass = _this$options6.panelClass,
          activeClass = _this$options6.activeClass,
          beforeOpen = _this$options6.beforeOpen;
        var panel = element.querySelector('.'.concat(panelClass));
        var height = panel.scrollHeight;

        element.classList.add(activeClass);
        if (calcHeight) beforeOpen(element);
        panel.style.height = calcHeight ? ''.concat(height, 'px') : 'auto';

        this.updateARIA(element, true);
      },

      /**
       * Close element
       * @param {object} element = accordion item
       * @param {boolean} calcHeight = calculate the height of the panel
       */
      closeElement: function closeElement(element) {
        var calcHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var _this$options7 = this.options,
          panelClass = _this$options7.panelClass,
          activeClass = _this$options7.activeClass,
          beforeClose = _this$options7.beforeClose;
        var panel = element.querySelector('.'.concat(panelClass));
        var height = panel.scrollHeight;

        element.classList.remove(activeClass);

        if (calcHeight) {
          beforeClose(element);

          // Animation [X]px => 0
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
        var _this$options8 = this.options,
          activeClass = _this$options8.activeClass,
          collapse = _this$options8.collapse;
        var isActive = element.classList.contains(activeClass);

        if (isActive && !collapse) return;
        return isActive ? this.closeElement(element) : this.showElement(element);
      },

      /**
       * Close all elements without the current element
       */
      closeElements: function closeElements() {
        var _this3 = this;
        var _this$options9 = this.options,
          activeClass = _this$options9.activeClass,
          showMultiple = _this$options9.showMultiple;
        if (showMultiple) return;

        this.elements.map(function (element, idx) {
          var isActive = element.classList.contains(activeClass);

          if (isActive && idx != _this3.currFocusedIdx) {
            _this3.closeElement(element);
          }
        });
      },

      /**
       * Handle click
       * @param {object} e = event
       */
      handleClick: function handleClick(e) {
        var _this4 = this;
        var target = e.currentTarget;

        this.elements.map(function (element, idx) {
          if (element.contains(target) && e.target.nodeName !== 'A') {
            _this4.currFocusedIdx = idx;

            _this4.closeElements();
            _this4.focus(e, element);
            _this4.toggleElement(element);
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
        if (e.propertyName !== 'height') return;
        var _this$options10 = this.options,
          onOpen = _this$options10.onOpen,
          onClose = _this$options10.onClose;
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
      },
    };

    /**
     * Attach events
     */
    this.attachEvents = function () {
      if (eventsAttached) return;
      var _core$options = core.options,
        triggerClass = _core$options.triggerClass,
        panelClass = _core$options.panelClass;

      core.handleClick = core.handleClick.bind(core);
      core.handleKeydown = core.handleKeydown.bind(core);
      core.handleTransitionEnd = core.handleTransitionEnd.bind(core);

      core.elements.map(function (element) {
        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.addEventListener('click', core.handleClick);
        trigger.addEventListener('keydown', core.handleKeydown);
        panel.addEventListener('webkitTransitionEnd', core.handleTransitionEnd);
        panel.addEventListener('transitionend', core.handleTransitionEnd);
      });

      eventsAttached = true;
    };

    /**
     * Detach events
     */
    this.detachEvents = function () {
      if (!eventsAttached) return;
      var _core$options2 = core.options,
        triggerClass = _core$options2.triggerClass,
        panelClass = _core$options2.panelClass;

      core.elements.map(function (element) {
        var trigger = element.querySelector('.'.concat(triggerClass));
        var panel = element.querySelector('.'.concat(panelClass));

        trigger.removeEventListener('click', core.handleClick);
        trigger.removeEventListener('keydown', core.handleKeydown);
        panel.removeEventListener('webkitTransitionEnd', core.handleTransitionEnd);
        panel.removeEventListener('transitionend', core.handleTransitionEnd);
      });

      eventsAttached = false;
    };

    /**
     * Open accordion element
     * @param {number} elIdx = element index
     */
    this.open = function (elIdx) {
      console.log({ open: open }, core.elements, elIdx);
      var el = core.elements.find(function (_, idx) {
        return idx === elIdx;
      });
      if (el) core.showElement(el);
    };

    /**
     * Open all accordion elements
     */
    this.openAll = function () {
      core.elements.map(function (element) {
        return core.showElement(element, false);
      });
    };

    /**
     * Close accordion element
     * @param {number} elIdx = element index
     */
    this.close = function (elIdx) {
      var el = core.elements.find(function (_, idx) {
        return idx === elIdx;
      });
      if (el) core.closeElement(el);
    };

    /**
     * Close all accordion elements
     */
    this.closeAll = function () {
      core.elements.map(function (element) {
        return core.closeElement(element, false);
      });
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

    core.init();
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Accordion;
  } else {
    window.Accordion = Accordion;
  }
})(window);
