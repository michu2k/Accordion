type AccordionOptions = {
  duration: number;
  ariaEnabled: boolean;
  collapse: boolean;
  showMultiple: boolean;
  openOnInit: number[];
  elementClass: string;
  triggerClass: string;
  panelClass: string;
  activeClass: string;
  beforeOpen: (element: HTMLElement) => void;
  onOpen: (element: HTMLElement) => void;
  beforeClose: (element: HTMLElement) => void;
  onClose: (element: HTMLElement) => void;
};

export interface AccordionConstructor {
  new (selector: string, options?: Partial<AccordionOptions>): Accordion;
  new (element: HTMLElement, options?: Partial<AccordionOptions>): Accordion;
  new (elements: Array<string | HTMLElement>, options?: Partial<AccordionOptions>): Accordion[];
  readonly JS_ENABLED_CLASS: string;
}

class Accordion {
  static readonly JS_ENABLED_CLASS = "js-enabled";

  static #uniqueId: number = 0;

  #options: AccordionOptions = {
    duration: 500, // animation duration in ms {number}
    ariaEnabled: true, // add ARIA elements to the HTML structure {boolean}
    collapse: true, // allow collapse expanded panel {boolean}
    showMultiple: false, // show multiple elements at the same time {boolean}
    openOnInit: [], // show accordion elements during initialization {array}
    elementClass: "ac", // element class {string}
    triggerClass: "ac-trigger", // trigger class {string}
    panelClass: "ac-panel", // panel class {string}
    activeClass: "is-active", // active element class {string}
    beforeOpen: () => {}, // calls before the element is opened {function}
    onOpen: () => {}, // calls when the element is opened {function}
    beforeClose: () => {}, // calls before the element is closed {function}
    onClose: () => {} // calls when the element is closed {function}
  };

  #container: Element | null = null;

  #eventsAttached: boolean = false;

  #elements: Array<HTMLElement> = [];

  #currFocusedIdx: number = 0;

  /**
   * Init accordion
   */
  constructor(
    selectorOrElement: string | HTMLElement | Array<string | HTMLElement>,
    options: Partial<AccordionOptions> = {}
  ) {
    if (Array.isArray(selectorOrElement)) {
      return selectorOrElement.map((single) => new Accordion(single, options)) as unknown as Accordion;
    }

    // Extend default options
    this.#options = { ...this.#options, ...options };

    const isString = typeof selectorOrElement === "string";
    this.#container = isString ? document.querySelector<HTMLElement>(selectorOrElement) : selectorOrElement;

    if (!this.#container) {
      throw new Error("Container element not found");
    }

    this.#createDefinitions();
    this.attachEvents();
  }

  /**
   * Create element definitions
   */
  #createDefinitions() {
    const { elementClass, openOnInit } = this.#options;

    const container = this.#container!;
    const allElements = container.querySelectorAll<HTMLElement>(Accordion.#cn(elementClass));

    // Filter out elements that are not direct children of the container (e.g. nested elements)
    this.#elements = Array.from(allElements).filter((element) => {
      const closestElement = element.parentElement?.closest(Accordion.#cn(elementClass));
      return !(!!closestElement && container.contains(closestElement));
    });

    this.#elements
      .filter((element) => !element.classList.contains(Accordion.JS_ENABLED_CLASS))
      .forEach((element) => {
        // When JS is enabled, add the class to the element
        element.classList.add(Accordion.JS_ENABLED_CLASS);

        this.#generateIDs(element);
        this.#setARIA(element);
        this.#setTransition(element);

        const index = this.#elements.indexOf(element);

        Accordion.#uniqueId++;

        if (openOnInit.includes(index)) {
          this.#showElement(element, false);
        } else {
          this.#closeElement(element, false);
        }
      });
  }

  /**
   * Set transition
   * @param {HTMLElement} element = accordion element
   * @param {boolean} clear = clear transition duration
   */
  #setTransition(element: HTMLElement, clear: boolean = false) {
    const { duration, panelClass } = this.#options;
    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (panel) {
      panel.style.transitionDuration = clear ? "" : `${duration}ms`;
    }
  }

  /**
   * Generate unique IDs for each element
   * @param {HTMLElement} element = accordion element
   */
  #generateIDs(element: HTMLElement) {
    const { triggerClass, panelClass } = this.#options;
    const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    element.setAttribute("id", element.id || `ac-${Accordion.#uniqueId}`);
    trigger?.setAttribute("id", trigger.id || `ac-trigger-${Accordion.#uniqueId}`);
    panel?.setAttribute("id", panel.id || `ac-panel-${Accordion.#uniqueId}`);
  }

  /**
   * Remove IDs
   * @param {HTMLElement} element = accordion element
   */
  #removeIDs(element: HTMLElement) {
    const { triggerClass, panelClass } = this.#options;
    const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (element.id.startsWith("ac-")) element.removeAttribute("id");
    if (trigger?.id.startsWith("ac-")) trigger.removeAttribute("id");
    if (panel?.id.startsWith("ac-")) panel.removeAttribute("id");
  }

  /**
   * Create ARIA
   * @param {HTMLElement} element = accordion element
   */
  #setARIA(element: HTMLElement) {
    const { ariaEnabled, triggerClass, panelClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = element.querySelector(Accordion.#cn(triggerClass));
    const panel = element.querySelector(Accordion.#cn(panelClass));

    trigger?.setAttribute("role", "button");
    trigger?.setAttribute("aria-controls", panel?.id || "");
    trigger?.setAttribute("aria-disabled", "false");
    trigger?.setAttribute("aria-expanded", "false");

    panel?.setAttribute("role", "region");
    panel?.setAttribute("aria-labelledby", trigger?.id || "");
  }

  /**
   * Update ARIA
   * @param {HTMLElement} element = accordion element
   * @param {object} options
   * @param {boolean} options.ariaExpanded = value of the attribute
   * @param {boolean} options.ariaDisabled = value of the attribute
   */
  #updateARIA(element: HTMLElement, { ariaExpanded, ariaDisabled }: { ariaExpanded: boolean; ariaDisabled: boolean }) {
    const { ariaEnabled, triggerClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    trigger?.setAttribute("aria-expanded", ariaExpanded ? "true" : "false");
    trigger?.setAttribute("aria-disabled", ariaDisabled ? "true" : "false");
  }

  /**
   * Remove ARIA
   * @param {HTMLElement} element = accordion element
   */
  #removeARIA(element: HTMLElement) {
    const { ariaEnabled, triggerClass, panelClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    trigger?.removeAttribute("role");
    trigger?.removeAttribute("aria-controls");
    trigger?.removeAttribute("aria-disabled");
    trigger?.removeAttribute("aria-expanded");

    panel?.removeAttribute("role");
    panel?.removeAttribute("aria-labelledby");
  }

  /**
   * Focus element
   * @param {Event} e = event
   * @param {HTMLElement} element = accordion element
   */
  #focus(e: Event, element: HTMLElement) {
    e.preventDefault();

    const { triggerClass } = this.#options;
    const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));

    trigger?.focus();
  }

  /**
   * Focus first element
   * @param {Event} e = event
   */
  #focusFirstElement(e: Event) {
    const firstElement = this.#elements[0];
    if (!firstElement) return;

    this.#focus(e, firstElement);
    this.#currFocusedIdx = 0;
  }

  /**
   * Focus last element
   * @param {Event} e = event
   */
  #focusLastElement(e: Event) {
    const lastElement = this.#elements[this.#elements.length - 1];
    if (!lastElement) return;

    this.#focus(e, lastElement);
    this.#currFocusedIdx = this.#elements.length - 1;
  }

  /**
   * Focus next element
   * @param {Event} e = event
   */
  #focusNextElement(e: Event) {
    const nextElIdx = this.#currFocusedIdx + 1;
    if (nextElIdx > this.#elements.length - 1) return this.#focusFirstElement(e);

    const nextElement = this.#elements[nextElIdx];
    if (!nextElement) return;

    this.#focus(e, nextElement);
    this.#currFocusedIdx = nextElIdx;
  }

  /**
   * Focus previous element
   * @param {Event} e = event
   */
  #focusPrevElement(e: Event) {
    const prevElIdx = this.#currFocusedIdx - 1;
    if (prevElIdx < 0) return this.#focusLastElement(e);

    const prevElement = this.#elements[prevElIdx];
    if (!prevElement) return;

    this.#focus(e, prevElement);
    this.#currFocusedIdx = prevElIdx;
  }

  /**
   * Show element
   * @param {HTMLElement} element = accordion element
   * @param {boolean} calcHeight = calculate the height of the panel
   */
  #showElement(element: HTMLElement, calcHeight: boolean = true) {
    const { panelClass, activeClass, collapse, beforeOpen } = this.#options;
    if (calcHeight) beforeOpen(element);

    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (!panel) return;

    const height = panel.scrollHeight;

    element.classList.add(activeClass);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.height = calcHeight ? `${height}px` : "auto";
      });
    });

    this.#updateARIA(element, {
      ariaExpanded: true,
      ariaDisabled: !collapse
    });
  }

  /**
   * Close element
   * @param {HTMLElement} element = accordion element
   * @param {boolean} calcHeight = calculate the height of the panel
   */
  #closeElement(element: HTMLElement, calcHeight: boolean = true) {
    const { panelClass, activeClass, beforeClose } = this.#options;
    const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (!panel) return;

    const height = panel.scrollHeight;

    element.classList.remove(activeClass);

    if (calcHeight) {
      beforeClose(element);

      // Animation [X]px => 0
      requestAnimationFrame(() => {
        panel.style.height = `${height}px`;

        requestAnimationFrame(() => {
          panel.style.height = "0";
        });
      });
    } else {
      // Hide element without animation 'auto' => 0
      panel.style.height = "0";
    }

    this.#updateARIA(element, {
      ariaExpanded: false,
      ariaDisabled: false
    });
  }

  /**
   * Toggle element
   * @param {HTMLElement} element = accordion element
   */
  #toggleElement(element: HTMLElement) {
    const { activeClass, collapse } = this.#options;
    const isActive = element.classList.contains(activeClass);

    if (isActive && !collapse) return;
    return isActive ? this.#closeElement(element) : this.#showElement(element);
  }

  /**
   * Close all active elements without the current element
   */
  #closeElements() {
    const { activeClass, showMultiple } = this.#options;
    if (showMultiple) return;

    this.#elements.forEach((element, idx) => {
      const isActive = element.classList.contains(activeClass);

      if (isActive && idx !== this.#currFocusedIdx) {
        this.#closeElement(element);
      }
    });
  }

  /**
   * Handle trigger click
   * @param {PointerEvent} e = event
   */
  #handleClick = (e: PointerEvent) => {
    const { elementClass } = this.#options;
    const { currentTarget, target } = e;

    const element = currentTarget instanceof Element && currentTarget.closest<HTMLElement>(Accordion.#cn(elementClass));
    const isLink = target instanceof Element && !!target.closest<HTMLAnchorElement>("a");

    if (!element || isLink) return;

    const index = this.#elements.indexOf(element);
    this.#currFocusedIdx = index;

    this.#closeElements();
    this.#focus(e, element);
    this.#toggleElement(element);
  };

  /**
   * Handle trigger keydown
   * @param {KeyboardEvent} e = event
   */
  #handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        return this.#focusPrevElement(e);
      case "ArrowDown":
        return this.#focusNextElement(e);
      case "Home":
        return this.#focusFirstElement(e);
      case "End":
        return this.#focusLastElement(e);
      default:
        return null;
    }
  };

  /**
   * Handle trigger focus
   * @param {FocusEvent} e = event
   */
  #handleFocus = (e: FocusEvent) => {
    const currentTarget = e.currentTarget;

    if (!(currentTarget instanceof HTMLElement)) return;

    const currElement = this.#elements.find((element) => element.contains(currentTarget));

    if (currElement) {
      this.#currFocusedIdx = this.#elements.indexOf(currElement);
    }
  };

  /**
   * Handle panel transitionend
   * @param {TransitionEvent} e = event
   */
  #handleTransitionEnd = (e: TransitionEvent) => {
    e.stopPropagation();

    if (e.propertyName !== "height") return;

    const { onOpen, onClose } = this.#options;
    const panel = e.currentTarget;
    if (!(panel instanceof HTMLElement)) return;

    const height = parseInt(panel.style.height);
    const element = this.#elements.find((element) => element.contains(panel));

    if (!element) return;

    if (height > 0) {
      panel.style.height = "auto";
      onOpen(element);
    } else {
      onClose(element);
    }
  };

  /**
   * Attach events
   */
  public attachEvents() {
    if (this.#eventsAttached) return;
    const { triggerClass, panelClass } = this.#options;

    this.#elements.forEach((element) => {
      const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
      const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

      trigger?.addEventListener("click", this.#handleClick);
      trigger?.addEventListener("keydown", this.#handleKeydown);
      trigger?.addEventListener("focus", this.#handleFocus);
      panel?.addEventListener("transitionend", this.#handleTransitionEnd);
    });

    this.#eventsAttached = true;
  }

  /**
   * Detach events
   */
  public detachEvents() {
    if (!this.#eventsAttached) return;
    const { triggerClass, panelClass } = this.#options;

    this.#elements.forEach((element) => {
      const trigger = element.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
      const panel = element.querySelector<HTMLElement>(Accordion.#cn(panelClass));

      trigger?.removeEventListener("click", this.#handleClick);
      trigger?.removeEventListener("keydown", this.#handleKeydown);
      trigger?.removeEventListener("focus", this.#handleFocus);
      panel?.removeEventListener("transitionend", this.#handleTransitionEnd);
    });

    this.#eventsAttached = false;
  }

  /**
   * Toggle accordion element
   * @param {number} elementIdx = element index
   */
  public toggle(elementIdx: number) {
    const el = this.#elements[elementIdx];
    if (el) this.#toggleElement(el);
  }

  /**
   * Open accordion element
   * @param {number} elementIdx = element index
   */
  public open = (elementIdx: number) => {
    const el = this.#elements[elementIdx];
    if (el) this.#showElement(el);
  };

  /**
   * Open all hidden accordion elements
   */
  public openAll = () => {
    const { activeClass, onOpen } = this.#options;

    this.#elements.forEach((element) => {
      const isActive = element.classList.contains(activeClass);

      if (!isActive) {
        this.#showElement(element, false);
        onOpen(element);
      }
    });
  };

  /**
   * Close accordion element
   * @param {number} elementIdx = element index
   */
  public close = (elementIdx: number) => {
    const el = this.#elements[elementIdx];
    if (el) this.#closeElement(el);
  };

  /**
   * Close all active accordion elements
   */
  public closeAll = () => {
    const { activeClass, onClose } = this.#options;

    this.#elements.forEach((element) => {
      const isActive = element.classList.contains(activeClass);

      if (isActive) {
        this.#closeElement(element, false);
        onClose(element);
      }
    });
  };

  /**
   * Update accordion elements
   */
  public update = () => {
    this.#createDefinitions();

    this.detachEvents();
    this.attachEvents();
  };

  /**
   * Destroy accordion instance
   */
  public destroy = () => {
    this.detachEvents();
    this.openAll();

    this.#elements.forEach((element) => {
      this.#removeIDs(element);
      this.#removeARIA(element);
      this.#setTransition(element, true);
      element.classList.remove(Accordion.JS_ENABLED_CLASS);
    });

    this.#eventsAttached = true;
  };

  /**
   * Build class name
   * @param {string} className = element class name
   * @return {string} className = element class name with CSS.escape
   */
  static #cn(className: string): string {
    return `.${CSS.escape(className)}`;
  }
}

export type { Accordion, AccordionOptions };

export default Accordion as AccordionConstructor;
