/* eslint-disable @typescript-eslint/no-explicit-any */

const JS_ENABLED_CLASS = 'js-enabled';

let elementIdCounter = 0;

export interface AccordionCallbacks {
  beforeOpen(element: HTMLElement): void;
  onOpen(element: HTMLElement): void;
  beforeClose(element: HTMLElement): void;
  onClose(element: HTMLElement): void;
}

export interface AccordionOptions extends AccordionCallbacks {
  duration: number;
  ariaEnabled: boolean;
  collapse: boolean;
  showMultiple: boolean;
  onlyChildNodes: boolean;
  openOnInit: number[];
  elementClass: string;
  triggerClass: string;
  panelClass: string;
  activeClass: string;
}

type AccordionTarget = string | Element;

type AccordionCollection = AccordionTarget[] | ArrayLike<Element>;

interface AriaState {
  ariaExpanded: boolean;
  ariaDisabled: boolean;
}

const defaultOptions: AccordionOptions = {
  duration: 500,
  ariaEnabled: true,
  collapse: true,
  showMultiple: false,
  onlyChildNodes: true,
  openOnInit: [],
  elementClass: 'ac',
  triggerClass: 'ac-trigger',
  panelClass: 'ac-panel',
  activeClass: 'is-active',
  beforeOpen: () => undefined,
  onOpen: () => undefined,
  beforeClose: () => undefined,
  onClose: () => undefined
};

const isDevEnvironment = () =>
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  process.env.NODE_ENV !== 'production';

const requestAnimationFrameSafe =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (callback: FrameRequestCallback): number => setTimeout(callback, 16);

const getClassSelector = (className: string): string => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return `.${CSS.escape(className)}`;
  }

  return `.${className.replace(/[^_a-zA-Z0-9-]/g, '\\$&')}`;
};

const isArrayLike = (value: unknown): value is ArrayLike<Element> =>
  !!value && typeof value === 'object' && 'length' in value && typeof (value as any).length === 'number';

const isHTMLElement = (value: unknown): value is HTMLElement => {
  if (typeof HTMLElement === 'undefined') {
    return false;
  }

  return value instanceof HTMLElement;
};

const normalizeCollection = (collection: AccordionCollection): AccordionTarget[] => {
  if (isArrayLike(collection)) {
    return Array.from(collection);
  }

  return Array.isArray(collection) ? collection : [collection];
};

const mergeCallbacks = (
  target: AccordionCallbacks,
  overrides: Partial<AccordionCallbacks> | undefined
): AccordionCallbacks => ({
  beforeOpen: overrides?.beforeOpen ?? target.beforeOpen,
  onOpen: overrides?.onOpen ?? target.onOpen,
  beforeClose: overrides?.beforeClose ?? target.beforeClose,
  onClose: overrides?.onClose ?? target.onClose
});

const mergeOptions = (options?: Partial<AccordionOptions>): AccordionOptions => {
  const callbacks = mergeCallbacks(defaultOptions, options);

  return {
    ...defaultOptions,
    ...options,
    openOnInit: Array.isArray(options?.openOnInit)
      ? options.openOnInit.slice()
      : defaultOptions.openOnInit.slice(),
    beforeOpen: callbacks.beforeOpen,
    onOpen: callbacks.onOpen,
    beforeClose: callbacks.beforeClose,
    onClose: callbacks.onClose
  };
};

export class Accordion {
  private readonly options: AccordionOptions;

  private readonly container!: HTMLElement;

  private elements: HTMLElement[] = [];

  private firstElement: HTMLElement | null = null;

  private lastElement: HTMLElement | null = null;

  private currFocusedIdx = 0;

  private eventsAttached = false;

  private isDestroyed = false;

  private boundClickHandler!: (event: MouseEvent) => void;

  private boundKeydownHandler!: (event: KeyboardEvent) => void;

  private boundFocusHandler!: (event: FocusEvent) => void;

  private boundTransitionEndHandler!: (event: TransitionEvent) => void;

  constructor(target: AccordionTarget, options?: Partial<AccordionOptions>) {
    this.options = mergeOptions(options);

    const container = this.resolveContainer(target);
    if (!container) {
      this.isDestroyed = true;
      if (isDevEnvironment()) {
        throw new Error('Accordion: container not found.');
      }
      return;
    }

    this.container = container;

    this.boundClickHandler = (event) => this.handleClick(event);
    this.boundKeydownHandler = (event) => this.handleKeydown(event);
    this.boundFocusHandler = (event) => this.handleFocus(event);
    this.boundTransitionEndHandler = (event) => this.handleTransitionEnd(event);

    this.createDefinitions();
    this.attachEvents();
  }

  public static create(
    target: AccordionCollection,
    options?: Partial<AccordionOptions>
  ): Accordion | Accordion[] | false {
    const items = normalizeCollection(target);

    if (!items.length) {
      return false;
    }

    if (items.length === 1) {
      const [single] = items;
      return Accordion.instantiate(single, options);
    }

    return items
      .map((element) => Accordion.instantiate(element, options))
      .filter((instance): instance is Accordion => instance !== false);
  }

  static instantiate(
    target: AccordionTarget,
    options?: Partial<AccordionOptions>
  ): Accordion | false {
    const instance = new Accordion(target, options);
    return instance.isDestroyed ? false : instance;
  }

  public toggle(index: number): void {
    const element = this.elements[index];
    if (element) {
      this.toggleElement(element);
    }
  }

  public open(index: number): void {
    const element = this.elements[index];
    if (element) {
      this.showElement(element);
    }
  }

  public close(index: number): void {
    const element = this.elements[index];
    if (element) {
      this.closeElement(element);
    }
  }

  public openAll(): void {
    const { onOpen } = this.options;

    this.elements.forEach((element) => {
      this.showElement(element, false);
      onOpen(element);
    });
  }

  public closeAll(): void {
    const { onClose } = this.options;

    this.elements.forEach((element) => {
      this.closeElement(element, false);
      onClose(element);
    });
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.detachEvents();
    this.openAll();

    this.elements.forEach((element) => {
      this.removeIDs(element);
      this.removeARIA(element);
      this.setTransition(element, true);
      element.classList.remove(JS_ENABLED_CLASS);
    });

    this.isDestroyed = true;
  }

  public update(): void {
    if (this.isDestroyed) {
      return;
    }

    this.createDefinitions();
    this.detachEvents();
    this.attachEvents();
  }

  private resolveContainer(target: AccordionTarget): HTMLElement | null {
    if (typeof target === 'string') {
      return document.querySelector<HTMLElement>(target);
    }

    return isHTMLElement(target) ? (target as HTMLElement) : null;
  }

  private createDefinitions(): void {
    const { elementClass, openOnInit, onlyChildNodes } = this.options;

    const collection = onlyChildNodes
      ? Array.from(this.container.childNodes)
      : Array.from(this.container.querySelectorAll<HTMLElement>(getClassSelector(elementClass)));

    this.elements = collection.filter(
      (node): node is HTMLElement => node instanceof HTMLElement && node.classList.contains(elementClass)
    );

    this.firstElement = this.elements[0] ?? null;
    this.lastElement = this.elements[this.elements.length - 1] ?? null;

    this.elements
      .filter((element) => !element.classList.contains(JS_ENABLED_CLASS))
      .forEach((element) => {
        element.classList.add(JS_ENABLED_CLASS);
        this.generateIDs(element);
        this.setARIA(element);
        this.setTransition(element);

        const index = this.elements.indexOf(element);

        elementIdCounter += 1;

        if (openOnInit.includes(index)) {
          this.showElement(element, false);
        } else {
          this.closeElement(element, false);
        }
      });
  }

  private setTransition(element: HTMLElement, reset = false): void {
    const { panelClass, duration } = this.options;
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (!panel) {
      return;
    }

    panel.style.transitionDuration = reset ? '' : `${duration}ms`;
  }

  private generateIDs(element: HTMLElement): void {
    const { triggerClass, panelClass } = this.options;
    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (!trigger || !panel) {
      return;
    }

    if (!element.id) {
      element.id = `ac-${elementIdCounter}`;
    }

    if (!trigger.id) {
      trigger.id = `ac-trigger-${elementIdCounter}`;
    }

    if (!panel.id) {
      panel.id = `ac-panel-${elementIdCounter}`;
    }
  }

  private removeIDs(element: HTMLElement): void {
    const { triggerClass, panelClass } = this.options;
    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (element.id.startsWith('ac-')) {
      element.removeAttribute('id');
    }

    if (trigger?.id.startsWith('ac-')) {
      trigger.removeAttribute('id');
    }

    if (panel?.id.startsWith('ac-')) {
      panel.removeAttribute('id');
    }
  }

  private setARIA(element: HTMLElement): void {
    const { ariaEnabled, triggerClass, panelClass } = this.options;

    if (!ariaEnabled) {
      return;
    }

    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (!trigger || !panel) {
      return;
    }

    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-disabled', 'false');
    trigger.setAttribute('aria-expanded', 'false');

    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', trigger.id);
  }

  private updateARIA(element: HTMLElement, state: AriaState): void {
    const { ariaEnabled, triggerClass } = this.options;

    if (!ariaEnabled) {
      return;
    }

    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    if (!trigger) {
      return;
    }

    trigger.setAttribute('aria-expanded', String(state.ariaExpanded));
    trigger.setAttribute('aria-disabled', String(state.ariaDisabled));
  }

  private removeARIA(element: HTMLElement): void {
    const { ariaEnabled, triggerClass, panelClass } = this.options;

    if (!ariaEnabled) {
      return;
    }

    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    trigger?.removeAttribute('role');
    trigger?.removeAttribute('aria-controls');
    trigger?.removeAttribute('aria-disabled');
    trigger?.removeAttribute('aria-expanded');

    panel?.removeAttribute('role');
    panel?.removeAttribute('aria-labelledby');
  }

  private focus(event: Event, element: HTMLElement): void {
    event.preventDefault();

    const { triggerClass } = this.options;
    const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
    trigger?.focus();
  }

  private focusFirstElement(event: Event): void {
    if (!this.firstElement) {
      return;
    }

    this.focus(event, this.firstElement);
    this.currFocusedIdx = 0;
  }

  private focusLastElement(event: Event): void {
    if (!this.lastElement) {
      return;
    }

    this.focus(event, this.lastElement);
    this.currFocusedIdx = Math.max(this.elements.length - 1, 0);
  }

  private focusNextElement(event: Event): void {
    const nextIndex = this.currFocusedIdx + 1;

    if (nextIndex > this.elements.length - 1) {
      this.focusFirstElement(event);
      return;
    }

    const element = this.elements[nextIndex];
    if (element) {
      this.focus(event, element);
      this.currFocusedIdx = nextIndex;
    }
  }

  private focusPrevElement(event: Event): void {
    const previousIndex = this.currFocusedIdx - 1;

    if (previousIndex < 0) {
      this.focusLastElement(event);
      return;
    }

    const element = this.elements[previousIndex];
    if (element) {
      this.focus(event, element);
      this.currFocusedIdx = previousIndex;
    }
  }

  private showElement(element: HTMLElement, animate = true): void {
    const { panelClass, activeClass, collapse, beforeOpen } = this.options;
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (!panel) {
      return;
    }

    if (animate) {
      beforeOpen(element);
    }

    element.classList.add(activeClass);

    if (animate) {
      const height = panel.scrollHeight;

      requestAnimationFrameSafe(() => {
        requestAnimationFrameSafe(() => {
          panel.style.height = `${height}px`;
        });
      });
    } else {
      panel.style.height = 'auto';
    }

    this.updateARIA(element, { ariaExpanded: true, ariaDisabled: !collapse });
  }

  private closeElement(element: HTMLElement, animate = true): void {
    const { panelClass, activeClass, beforeClose } = this.options;
    const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

    if (!panel) {
      return;
    }

    element.classList.remove(activeClass);

    if (animate) {
      beforeClose(element);

      const height = panel.scrollHeight;

      requestAnimationFrameSafe(() => {
        panel.style.height = `${height}px`;

        requestAnimationFrameSafe(() => {
          panel.style.height = '0px';
        });
      });
    } else {
      panel.style.height = '0px';
    }

    this.updateARIA(element, { ariaExpanded: false, ariaDisabled: false });
  }

  private toggleElement(element: HTMLElement): void {
    const { activeClass, collapse } = this.options;
    const isActive = element.classList.contains(activeClass);

    if (!isActive || collapse) {
      if (isActive) {
        this.closeElement(element);
      } else {
        this.showElement(element);
      }
    }
  }

  private closeElements(): void {
    const { activeClass, showMultiple } = this.options;

    if (showMultiple) {
      return;
    }

    this.elements.forEach((element, index) => {
      if (index !== this.currFocusedIdx && element.classList.contains(activeClass)) {
        this.closeElement(element);
      }
    });
  }

  private handleClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    this.elements.forEach((element, index) => {
      if (!element.contains(target)) {
        return;
      }

      const actualTarget = event.target as HTMLElement | null;
      if (actualTarget?.nodeName === 'A') {
        return;
      }

      this.currFocusedIdx = index;
      this.closeElements();
      this.focus(event, element);
      this.toggleElement(element);
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.focusPrevElement(event);
        break;
      case 'ArrowDown':
        this.focusNextElement(event);
        break;
      case 'Home':
        this.focusFirstElement(event);
        break;
      case 'End':
        this.focusLastElement(event);
        break;
      default:
        return;
    }
  }

  private handleFocus(event: FocusEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const host = this.elements.find((element) => element.contains(target));
    if (!host) {
      return;
    }

    this.currFocusedIdx = this.elements.indexOf(host);
  }

  private handleTransitionEnd(event: TransitionEvent): void {
    event.stopPropagation();

    if (event.propertyName !== 'height') {
      return;
    }

    const { onOpen, onClose } = this.options;
    const panel = event.currentTarget as HTMLElement | null;

    if (!panel) {
      return;
    }

    const host = this.elements.find((element) => element.contains(panel));
    if (!host) {
      return;
    }

    const height = parseInt(panel.style.height, 10);

    if (height > 0) {
      panel.style.height = 'auto';
      onOpen(host);
    } else {
      onClose(host);
    }
  }

  private attachEvents(): void {
    if (this.eventsAttached || this.isDestroyed) {
      return;
    }

    const { triggerClass, panelClass } = this.options;

    this.elements.forEach((element) => {
      const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
      const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

      trigger?.addEventListener('click', this.boundClickHandler);
      trigger?.addEventListener('keydown', this.boundKeydownHandler);
      trigger?.addEventListener('focus', this.boundFocusHandler);
      panel?.addEventListener('transitionend', this.boundTransitionEndHandler);
    });

    this.eventsAttached = true;
  }

  private detachEvents(): void {
    if (!this.eventsAttached) {
      return;
    }

    const { triggerClass, panelClass } = this.options;

    this.elements.forEach((element) => {
      const trigger = element.querySelector<HTMLElement>(getClassSelector(triggerClass));
      const panel = element.querySelector<HTMLElement>(getClassSelector(panelClass));

      trigger?.removeEventListener('click', this.boundClickHandler);
      trigger?.removeEventListener('keydown', this.boundKeydownHandler);
      trigger?.removeEventListener('focus', this.boundFocusHandler);
      panel?.removeEventListener('transitionend', this.boundTransitionEndHandler);
    });

    this.eventsAttached = false;
  }
}

export default function createAccordion(
  target: AccordionTarget | AccordionCollection,
  options?: Partial<AccordionOptions>
): Accordion | Accordion[] | false {
  if (Array.isArray(target) || isArrayLike(target)) {
    const elements = normalizeCollection(target);
    if (!elements.length) {
      return false;
    }

    const instances = elements
      .map((element) => Accordion.instantiate(element, options))
      .filter((instance): instance is Accordion => instance !== false);

    return instances.length ? instances : false;
  }

  return Accordion.instantiate(target, options);
}
