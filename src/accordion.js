(function (window) {
  "use strict";

  let uniqueId = 0;

  /**
   * Core
   * @param {string|HTMLElement|Array<string|HTMLElement>} selectorOrElement = container in which the script will be initialized
   * @param {object} userOptions = options defined by user
   */
  const Accordion = function (selectorOrElement, userOptions) {
    const JS_ENABLED_CLASS = "js-enabled";
    const _this = this;
    let eventsAttached = false;

    // Break the array with the selectors
    if (Array.isArray(selectorOrElement)) {
      if (selectorOrElement.length) {
        return selectorOrElement.map((single) => new Accordion(single, userOptions));
      }

      return false;
    }

    const core = {
      /**
       * Init accordion
       */
      init() {
        const defaults = {
          duration: 500, // animation duration in ms {number}
          ariaEnabled: true, // add ARIA elements to the HTML structure {boolean}
          collapse: true, // allow collapse expanded panel {boolean}
          showMultiple: false, // show multiple elements at the same time {boolean}
          onlyChildNodes: true, // disabling this option will find all items in the container {boolean}
          openOnInit: [], // show accordion elements during initialization {array}
          elementClass: "ac", // element class {string}
          triggerClass: "ac-trigger", // trigger class {string}
          panelClass: "ac-panel", // panel class {string}
          activeClass: "is-active", // active element class {string}
          beforeOpen: () => {}, // calls before the item is opened {function}
          onOpen: () => {}, // calls when the item is opened {function}
          beforeClose: () => {}, // calls before the item is closed {function}
          onClose: () => {} // calls when the item is closed {function}
        };

        // Extend default options
        this.options = Object.assign(defaults, userOptions);

        const isString = typeof selectorOrElement === "string";

        this.container = isString ? document.querySelector(selectorOrElement) : selectorOrElement;
        this.createDefinitions();

        _this.attachEvents();
      },

      /**
       * Create element definitions
       */
      createDefinitions() {
        const {elementClass, openOnInit, onlyChildNodes} = this.options;

        const allElements = onlyChildNodes
          ? this.container.childNodes
          : this.container.querySelectorAll(cn(elementClass));

        this.elements = Array.from(allElements).filter((el) => el.classList && el.classList.contains(elementClass));

        this.firstElement = this.elements[0];
        this.lastElement = this.elements[this.elements.length - 1];

        this.elements
          .filter((element) => !element.classList.contains(JS_ENABLED_CLASS))
          .forEach((element) => {
            // When JS is enabled, add the class to the element
            element.classList.add(JS_ENABLED_CLASS);

            this.generateIDs(element);
            this.setARIA(element);
            this.setTransition(element);

            const index = this.elements.indexOf(element);

            uniqueId++;
            openOnInit.includes(index) ? this.showElement(element, false) : this.closeElement(element, false);
          });
      },

      /**
       * Set transition
       * @param {HTMLElement} element = accordion item
       * @param {boolean} clear = clear transition duration
       */
      setTransition(element, clear = false) {
        const {duration, panelClass} = this.options;
        const panel = element.querySelector(cn(panelClass));

        panel.style.transitionDuration = clear ? null : `${duration}ms`;
      },

      /**
       * Generate unique IDs for each element
       * @param {HTMLElement} element = accordion item
       */
      generateIDs(element) {
        const {triggerClass, panelClass} = this.options;
        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        element.setAttribute("id", element.id || `ac-${uniqueId}`);
        trigger.setAttribute("id", trigger.id || `ac-trigger-${uniqueId}`);
        panel.setAttribute("id", panel.id || `ac-panel-${uniqueId}`);
      },

      /**
       * Remove IDs
       * @param {HTMLElement} element = accordion item
       */
      removeIDs(element) {
        const {triggerClass, panelClass} = this.options;
        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        if (element.id.startsWith("ac-")) element.removeAttribute("id");
        if (trigger.id.startsWith("ac-")) trigger.removeAttribute("id");
        if (panel.id.startsWith("ac-")) panel.removeAttribute("id");
      },

      /**
       * Create ARIA
       * @param {HTMLElement} element = accordion item
       */
      setARIA(element) {
        const {ariaEnabled, triggerClass, panelClass} = this.options;
        if (!ariaEnabled) return;

        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        trigger.setAttribute("role", "button");
        trigger.setAttribute("aria-controls", panel.id);
        trigger.setAttribute("aria-disabled", false);
        trigger.setAttribute("aria-expanded", false);

        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", trigger.id);
      },

      /**
       * Update ARIA
       * @param {HTMLElement} element = accordion item
       * @param {object} options
       * @param {boolean} options.ariaExpanded = value of the attribute
       * @param {boolean} options.ariaDisabled = value of the attribute
       */
      updateARIA(element, {ariaExpanded, ariaDisabled}) {
        const {ariaEnabled, triggerClass} = this.options;
        if (!ariaEnabled) return;

        const trigger = element.querySelector(cn(triggerClass));
        trigger.setAttribute("aria-expanded", ariaExpanded);
        trigger.setAttribute("aria-disabled", ariaDisabled);
      },

      /**
       * Remove ARIA
       * @param {HTMLElement} element = accordion item
       */
      removeARIA(element) {
        const {ariaEnabled, triggerClass, panelClass} = this.options;
        if (!ariaEnabled) return;

        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        trigger.removeAttribute("role");
        trigger.removeAttribute("aria-controls");
        trigger.removeAttribute("aria-disabled");
        trigger.removeAttribute("aria-expanded");

        panel.removeAttribute("role");
        panel.removeAttribute("aria-labelledby");
      },

      /**
       * Focus element
       * @param {Event} e = event
       * @param {HTMLElement} element = accordion item
       */
      focus(e, element) {
        e.preventDefault();

        const {triggerClass} = this.options;
        const trigger = element.querySelector(cn(triggerClass));
        trigger.focus();
      },

      /**
       * Focus first element
       * @param {Event} e = event
       */
      focusFirstElement(e) {
        this.focus(e, this.firstElement);
        this.currFocusedIdx = 0;
      },

      /**
       * Focus last element
       * @param {Event} e = event
       */
      focusLastElement(e) {
        this.focus(e, this.lastElement);
        this.currFocusedIdx = this.elements.length - 1;
      },

      /**
       * Focus next element
       * @param {Event} e = event
       */
      focusNextElement(e) {
        const nextElIdx = this.currFocusedIdx + 1;
        if (nextElIdx > this.elements.length - 1) return this.focusFirstElement(e);

        this.focus(e, this.elements[nextElIdx]);
        this.currFocusedIdx = nextElIdx;
      },

      /**
       * Focus previous element
       * @param {Event} e = event
       */
      focusPrevElement(e) {
        const prevElIdx = this.currFocusedIdx - 1;
        if (prevElIdx < 0) return this.focusLastElement(e);

        this.focus(e, this.elements[prevElIdx]);
        this.currFocusedIdx = prevElIdx;
      },

      /**
       * Show element
       * @param {HTMLElement} element = accordion item
       * @param {boolean} calcHeight = calculate the height of the panel
       */
      showElement(element, calcHeight = true) {
        const {panelClass, activeClass, collapse, beforeOpen} = this.options;
        if (calcHeight) beforeOpen(element);

        const panel = element.querySelector(cn(panelClass));
        const height = panel.scrollHeight;

        element.classList.add(activeClass);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            panel.style.height = calcHeight ? `${height}px` : "auto";
          });
        });

        this.updateARIA(element, {
          ariaExpanded: true,
          ariaDisabled: !collapse
        });
      },

      /**
       * Close element
       * @param {HTMLElement} element = accordion item
       * @param {boolean} calcHeight = calculate the height of the panel
       */
      closeElement(element, calcHeight = true) {
        const {panelClass, activeClass, beforeClose} = this.options;
        const panel = element.querySelector(cn(panelClass));
        const height = panel.scrollHeight;

        element.classList.remove(activeClass);

        if (calcHeight) {
          beforeClose(element);

          // Animation [X]px => 0
          requestAnimationFrame(() => {
            panel.style.height = `${height}px`;

            requestAnimationFrame(() => {
              panel.style.height = 0;
            });
          });
        } else {
          // Hide element without animation 'auto' => 0
          panel.style.height = 0;
        }

        this.updateARIA(element, {
          ariaExpanded: false,
          ariaDisabled: false
        });
      },

      /**
       * Toggle element
       * @param {HTMLElement} element = accordion item
       */
      toggleElement(element) {
        const {activeClass, collapse} = this.options;
        const isActive = element.classList.contains(activeClass);

        if (isActive && !collapse) return;
        return isActive ? this.closeElement(element) : this.showElement(element);
      },

      /**
       * Close all elements without the current element
       */
      closeElements() {
        const {activeClass, showMultiple} = this.options;
        if (showMultiple) return;

        this.elements.forEach((element, idx) => {
          const isActive = element.classList.contains(activeClass);

          if (isActive && idx !== this.currFocusedIdx) {
            this.closeElement(element);
          }
        });
      },

      /**
       * Handle trigger click
       * @param {PointerEvent} e = event
       */
      handleClick(e) {
        const target = e.currentTarget;

        this.elements.forEach((element, idx) => {
          if (element.contains(target) && e.target.nodeName !== "A") {
            this.currFocusedIdx = idx;

            this.closeElements();
            this.focus(e, element);
            this.toggleElement(element);
          }
        });
      },

      /**
       * Handle trigger keydown
       * @param {KeyboardEvent} e = event
       */
      handleKeydown(e) {
        switch (e.key) {
          case "ArrowUp":
            return this.focusPrevElement(e);
          case "ArrowDown":
            return this.focusNextElement(e);
          case "Home":
            return this.focusFirstElement(e);
          case "End":
            return this.focusLastElement(e);
          default:
            return null;
        }
      },

      /**
       * Handle trigger focus
       * @param {KeyboardEvent} e = event
       */
      handleFocus(e) {
        const target = e.currentTarget;

        const currElement = this.elements.find((element) => element.contains(target));
        this.currFocusedIdx = this.elements.indexOf(currElement);
      },

      /**
       * Handle panel transitionend
       * @param {TransitionEvent} e = event
       */
      handleTransitionEnd(e) {
        e.stopPropagation();

        if (e.propertyName !== "height") return;

        const {onOpen, onClose} = this.options;
        const panel = e.currentTarget;
        const height = parseInt(panel.style.height);
        const element = this.elements.find((element) => element.contains(panel));

        if (height > 0) {
          panel.style.height = "auto";
          onOpen(element);
        } else {
          onClose(element);
        }
      }
    };

    /**
     * Attach events
     */
    this.attachEvents = () => {
      if (eventsAttached) return;
      const {triggerClass, panelClass} = core.options;

      core.handleClick = core.handleClick.bind(core);
      core.handleKeydown = core.handleKeydown.bind(core);
      core.handleFocus = core.handleFocus.bind(core);
      core.handleTransitionEnd = core.handleTransitionEnd.bind(core);

      core.elements.forEach((element) => {
        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        trigger.addEventListener("click", core.handleClick);
        trigger.addEventListener("keydown", core.handleKeydown);
        trigger.addEventListener("focus", core.handleFocus);
        panel.addEventListener("transitionend", core.handleTransitionEnd);
      });

      eventsAttached = true;
    };

    /**
     * Detach events
     */
    this.detachEvents = () => {
      if (!eventsAttached) return;
      const {triggerClass, panelClass} = core.options;

      core.elements.forEach((element) => {
        const trigger = element.querySelector(cn(triggerClass));
        const panel = element.querySelector(cn(panelClass));

        trigger.removeEventListener("click", core.handleClick);
        trigger.removeEventListener("keydown", core.handleKeydown);
        trigger.removeEventListener("focus", core.handleFocus);
        panel.removeEventListener("transitionend", core.handleTransitionEnd);
      });

      eventsAttached = false;
    };

    /**
     * Toggle accordion element
     * @param {number} elIdx = element index
     */
    this.toggle = (elIdx) => {
      const el = core.elements[elIdx];
      if (el) core.toggleElement(el);
    };

    /**
     * Open accordion element
     * @param {number} elIdx = element index
     */
    this.open = (elIdx) => {
      const el = core.elements[elIdx];
      if (el) core.showElement(el);
    };

    /**
     * Open all hidden accordion elements
     */
    this.openAll = () => {
      const {activeClass, onOpen} = core.options;

      core.elements.forEach((element) => {
        const isActive = element.classList.contains(activeClass);

        if (!isActive) {
          core.showElement(element, false);
          onOpen(element);
        }
      });
    };

    /**
     * Close accordion element
     * @param {number} elIdx = element index
     */
    this.close = (elIdx) => {
      const el = core.elements[elIdx];
      if (el) core.closeElement(el);
    };

    /**
     * Close all active accordion elements
     */
    this.closeAll = () => {
      const {activeClass, onClose} = core.options;

      core.elements.forEach((element) => {
        const isActive = element.classList.contains(activeClass);

        if (isActive) {
          core.closeElement(element, false);
          onClose(element);
        }
      });
    };

    /**
     * Destroy accordion instance
     */
    this.destroy = () => {
      this.detachEvents();
      this.openAll();

      core.elements.forEach((element) => {
        core.removeIDs(element);
        core.removeARIA(element);
        core.setTransition(element, true);
        element.classList.remove(JS_ENABLED_CLASS);
      });

      eventsAttached = true;
    };

    /**
     * Update accordion elements
     */
    this.update = () => {
      core.createDefinitions();

      this.detachEvents();
      this.attachEvents();
    };

    /**
     * Build class name
     * @param {string} className = element class name
     * @return {string} className = element class name with CSS.escape
     */
    const cn = (className) => `.${CSS.escape(className)}`;

    core.init();
  };

  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Accordion;
  } else {
    window.Accordion = Accordion;
  }
})(window);
