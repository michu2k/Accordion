type AccordionOptions = {
  duration: number;
  ariaEnabled: boolean;
  collapse: boolean;
  showMultiple: boolean;
  openOnInit: number[];
  itemClass: string;
  triggerClass: string;
  panelClass: string;
  activeClass: string;
  beforeOpen: (item: HTMLElement) => void;
  onOpen: (item: HTMLElement) => void;
  beforeClose: (item: HTMLElement) => void;
  onClose: (item: HTMLElement) => void;
};

export interface AccordionConstructor {
  new (selector: string, options?: Partial<AccordionOptions>): Accordion;
  new (item: HTMLElement, options?: Partial<AccordionOptions>): Accordion;
  new (items: Array<string | HTMLElement>, options?: Partial<AccordionOptions>): Accordion[];
  readonly JS_ENABLED_CLASS: string;
}

class Accordion {
  static readonly JS_ENABLED_CLASS = "js-enabled";

  static #uniqueId: number = 0;

  #options: AccordionOptions = {
    duration: 500, // animation duration in ms {number}
    ariaEnabled: true, // add ARIA items to the HTML structure {boolean}
    collapse: true, // allow collapse expanded panel {boolean}
    showMultiple: false, // show multiple items at the same time {boolean}
    openOnInit: [], // show accordion items during initialization {array}
    itemClass: "ac", // item class {string}
    triggerClass: "ac-trigger", // trigger class {string}
    panelClass: "ac-panel", // panel class {string}
    activeClass: "is-active", // active item class {string}
    beforeOpen: () => {}, // calls before the item is opened {function}
    onOpen: () => {}, // calls when the item is opened {function}
    beforeClose: () => {}, // calls before the item is closed {function}
    onClose: () => {} // calls when the item is closed {function}
  };

  #container: Element | null = null;

  #eventsAttached: boolean = false;

  #items: Array<HTMLElement> = [];

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
      throw new Error("Container not found");
    }

    this.#createDefinitions();
    this.attachEvents();
  }

  /**
   * Create item definitions
   */
  #createDefinitions() {
    const { itemClass, openOnInit } = this.#options;

    const container = this.#container!;
    const allItems = container.querySelectorAll<HTMLElement>(Accordion.#cn(itemClass));

    // Filter out items that are not direct children of the container (e.g. nested items)
    this.#items = Array.from(allItems).filter((item) => {
      const closestItem = item.parentElement?.closest(Accordion.#cn(itemClass));
      return !(!!closestItem && container.contains(closestItem));
    });

    this.#items
      .filter((item) => !item.classList.contains(Accordion.JS_ENABLED_CLASS))
      .forEach((item) => {
        // When JS is enabled, add the class to the item
        item.classList.add(Accordion.JS_ENABLED_CLASS);

        this.#generateIDs(item);
        this.#setARIA(item);
        this.#setTransition(item);

        const idx = this.#items.indexOf(item);

        Accordion.#uniqueId++;

        if (openOnInit.includes(idx)) {
          this.#showItem(item, false);
        } else {
          this.#closeItem(item, false);
        }
      });
  }

  /**
   * Set transition
   * @param {HTMLElement} item = accordion item
   * @param {boolean} clear = clear transition duration
   */
  #setTransition(item: HTMLElement, clear: boolean = false) {
    const { duration, panelClass } = this.#options;
    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (panel) {
      panel.style.transitionDuration = clear ? "" : `${duration}ms`;
    }
  }

  /**
   * Generate unique IDs for each item
   * @param {HTMLElement} item = accordion item
   */
  #generateIDs(item: HTMLElement) {
    const { triggerClass, panelClass } = this.#options;
    const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    item.setAttribute("id", item.id || `ac-${Accordion.#uniqueId}`);
    trigger?.setAttribute("id", trigger.id || `ac-trigger-${Accordion.#uniqueId}`);
    panel?.setAttribute("id", panel.id || `ac-panel-${Accordion.#uniqueId}`);
  }

  /**
   * Remove IDs
   * @param {HTMLElement} item = accordion item
   */
  #removeIDs(item: HTMLElement) {
    const { triggerClass, panelClass } = this.#options;
    const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (item.id.startsWith("ac-")) item.removeAttribute("id");
    if (trigger?.id.startsWith("ac-")) trigger.removeAttribute("id");
    if (panel?.id.startsWith("ac-")) panel.removeAttribute("id");
  }

  /**
   * Create ARIA
   * @param {HTMLElement} item = accordion item
   */
  #setARIA(item: HTMLElement) {
    const { ariaEnabled, triggerClass, panelClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = item.querySelector(Accordion.#cn(triggerClass));
    const panel = item.querySelector(Accordion.#cn(panelClass));

    trigger?.setAttribute("role", "button");
    trigger?.setAttribute("aria-controls", panel?.id || "");
    trigger?.setAttribute("aria-disabled", "false");
    trigger?.setAttribute("aria-expanded", "false");

    panel?.setAttribute("role", "region");
    panel?.setAttribute("aria-labelledby", trigger?.id || "");
  }

  /**
   * Update ARIA
   * @param {HTMLElement} item = accordion item
   * @param {object} options
   * @param {boolean} options.ariaExpanded = value of the attribute
   * @param {boolean} options.ariaDisabled = value of the attribute
   */
  #updateARIA(item: HTMLElement, { ariaExpanded, ariaDisabled }: { ariaExpanded: boolean; ariaDisabled: boolean }) {
    const { ariaEnabled, triggerClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    trigger?.setAttribute("aria-expanded", ariaExpanded ? "true" : "false");
    trigger?.setAttribute("aria-disabled", ariaDisabled ? "true" : "false");
  }

  /**
   * Remove ARIA
   * @param {HTMLElement} item = accordion item
   */
  #removeARIA(item: HTMLElement) {
    const { ariaEnabled, triggerClass, panelClass } = this.#options;
    if (!ariaEnabled) return;

    const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    trigger?.removeAttribute("role");
    trigger?.removeAttribute("aria-controls");
    trigger?.removeAttribute("aria-disabled");
    trigger?.removeAttribute("aria-expanded");

    panel?.removeAttribute("role");
    panel?.removeAttribute("aria-labelledby");
  }

  /**
   * Focus item
   * @param {Event} e = event
   * @param {HTMLElement} item = accordion item
   */
  #focus(e: Event, item: HTMLElement) {
    e.preventDefault();

    const { triggerClass } = this.#options;
    const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));

    trigger?.focus();
  }

  /**
   * Focus first item
   * @param {Event} e = event
   */
  #focusFirstItem(e: Event) {
    const firstItem = this.#items[0];
    if (!firstItem) return;

    this.#focus(e, firstItem);
    this.#currFocusedIdx = 0;
  }

  /**
   * Focus last item
   * @param {Event} e = event
   */
  #focusLastItem(e: Event) {
    const lastItem = this.#items[this.#items.length - 1];
    if (!lastItem) return;

    this.#focus(e, lastItem);
    this.#currFocusedIdx = this.#items.length - 1;
  }

  /**
   * Focus next item
   * @param {Event} e = event
   */
  #focusNextItem(e: Event) {
    const nextItemIdx = this.#currFocusedIdx + 1;
    if (nextItemIdx > this.#items.length - 1) return this.#focusFirstItem(e);

    const nextItem = this.#items[nextItemIdx];
    if (!nextItem) return;

    this.#focus(e, nextItem);
    this.#currFocusedIdx = nextItemIdx;
  }

  /**
   * Focus previous item
   * @param {Event} e = event
   */
  #focusPrevItem(e: Event) {
    const prevItemIdx = this.#currFocusedIdx - 1;
    if (prevItemIdx < 0) return this.#focusLastItem(e);

    const prevItem = this.#items[prevItemIdx];
    if (!prevItem) return;

    this.#focus(e, prevItem);
    this.#currFocusedIdx = prevItemIdx;
  }

  /**
   * Show item
   * @param {HTMLElement} item = accordion item
   * @param {boolean} calcHeight = calculate the height of the panel
   */
  #showItem(item: HTMLElement, calcHeight: boolean = true) {
    const { panelClass, activeClass, collapse, beforeOpen } = this.#options;
    if (calcHeight) beforeOpen(item);

    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (!panel) return;

    const height = panel.scrollHeight;

    item.classList.add(activeClass);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.height = calcHeight ? `${height}px` : "auto";
      });
    });

    this.#updateARIA(item, {
      ariaExpanded: true,
      ariaDisabled: !collapse
    });
  }

  /**
   * Close item
   * @param {HTMLElement} item = accordion item
   * @param {boolean} calcHeight = calculate the height of the panel
   */
  #closeItem(item: HTMLElement, calcHeight: boolean = true) {
    const { panelClass, activeClass, beforeClose } = this.#options;
    const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

    if (!panel) return;

    const height = panel.scrollHeight;

    item.classList.remove(activeClass);

    if (calcHeight) {
      beforeClose(item);

      // Animation [X]px => 0
      requestAnimationFrame(() => {
        panel.style.height = `${height}px`;

        requestAnimationFrame(() => {
          panel.style.height = "0";
        });
      });
    } else {
      // Hide item without animation 'auto' => 0
      panel.style.height = "0";
    }

    this.#updateARIA(item, {
      ariaExpanded: false,
      ariaDisabled: false
    });
  }

  /**
   * Toggle item
   * @param {HTMLElement} item = accordion item
   */
  #toggleItem(item: HTMLElement) {
    const { activeClass, collapse } = this.#options;
    const isActive = item.classList.contains(activeClass);

    if (isActive && !collapse) return;
    return isActive ? this.#closeItem(item) : this.#showItem(item);
  }

  /**
   * Close all active items without the current item
   */
  #closeItems() {
    const { activeClass, showMultiple } = this.#options;
    if (showMultiple) return;

    this.#items.forEach((item, idx) => {
      const isActive = item.classList.contains(activeClass);

      if (isActive && idx !== this.#currFocusedIdx) {
        this.#closeItem(item);
      }
    });
  }

  /**
   * Handle trigger click
   * @param {PointerEvent} e = event
   */
  #handleClick = (e: PointerEvent) => {
    const { itemClass } = this.#options;
    const { currentTarget, target } = e;

    const item = currentTarget instanceof Element && currentTarget.closest<HTMLElement>(Accordion.#cn(itemClass));
    const isLink = target instanceof Element && !!target.closest<HTMLAnchorElement>("a");

    if (!item || isLink) return;

    const idx = this.#items.indexOf(item);
    this.#currFocusedIdx = idx;

    this.#closeItems();
    this.#focus(e, item);
    this.#toggleItem(item);
  };

  /**
   * Handle trigger keydown
   * @param {KeyboardEvent} e = event
   */
  #handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        return this.#focusPrevItem(e);
      case "ArrowDown":
        return this.#focusNextItem(e);
      case "Home":
        return this.#focusFirstItem(e);
      case "End":
        return this.#focusLastItem(e);
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

    const currItem = this.#items.find((item) => item.contains(currentTarget));

    if (currItem) {
      this.#currFocusedIdx = this.#items.indexOf(currItem);
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
    const item = this.#items.find((item) => item.contains(panel));

    if (!item) return;

    if (height > 0) {
      panel.style.height = "auto";
      onOpen(item);
    } else {
      onClose(item);
    }
  };

  /**
   * Attach events
   */
  public attachEvents() {
    if (this.#eventsAttached) return;
    const { triggerClass, panelClass } = this.#options;

    this.#items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
      const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

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

    this.#items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>(Accordion.#cn(triggerClass));
      const panel = item.querySelector<HTMLElement>(Accordion.#cn(panelClass));

      trigger?.removeEventListener("click", this.#handleClick);
      trigger?.removeEventListener("keydown", this.#handleKeydown);
      trigger?.removeEventListener("focus", this.#handleFocus);
      panel?.removeEventListener("transitionend", this.#handleTransitionEnd);
    });

    this.#eventsAttached = false;
  }

  /**
   * Toggle accordion item
   * @param {number} itemIdx = item index
   */
  public toggle(itemIdx: number) {
    const el = this.#items[itemIdx];
    if (el) this.#toggleItem(el);
  }

  /**
   * Open accordion item
   * @param {number} itemIdx = item index
   */
  public open = (itemIdx: number) => {
    const el = this.#items[itemIdx];
    if (el) this.#showItem(el);
  };

  /**
   * Open all hidden accordion items
   */
  public openAll = () => {
    const { activeClass, onOpen } = this.#options;

    this.#items.forEach((item) => {
      const isActive = item.classList.contains(activeClass);

      if (!isActive) {
        this.#showItem(item, false);
        onOpen(item);
      }
    });
  };

  /**
   * Close accordion item
   * @param {number} itemIdx = item index
   */
  public close = (itemIdx: number) => {
    const el = this.#items[itemIdx];
    if (el) this.#closeItem(el);
  };

  /**
   * Close all active accordion items
   */
  public closeAll = () => {
    const { activeClass, onClose } = this.#options;

    this.#items.forEach((item) => {
      const isActive = item.classList.contains(activeClass);

      if (isActive) {
        this.#closeItem(item, false);
        onClose(item);
      }
    });
  };

  /**
   * Update accordion items
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

    this.#items.forEach((item) => {
      this.#removeIDs(item);
      this.#removeARIA(item);
      this.#setTransition(item, true);
      item.classList.remove(Accordion.JS_ENABLED_CLASS);
    });

    this.#eventsAttached = true;
  };

  /**
   * Build class name
   * @param {string} className = class name
   * @return {string} className = class name with CSS.escape
   */
  static #cn(className: string): string {
    return `.${CSS.escape(className)}`;
  }
}

export type { Accordion, AccordionOptions };

export default Accordion as AccordionConstructor;
