interface AccordionOptions {
  /** animation duration in ms */
  duration: number;
  /** add ARIA elements to the HTML structure */
  ariaEnabled: boolean;
  /** allow collapse expanded panel */
  collapse: boolean;
  /** show multiple elements at the same time */
  showMultiple: boolean;
  /** disabling this option will find all items in the container */
  onlyChildNodes: boolean;
  /** show accordion elements during initialization */
  openOnInit: number[];
  /** element class */
  elementClass: string;
  /** trigger class */
  triggerClass: string;
  /** panel class */
  panelClass: string;
  /** active element class */
  activeClass: string;
  /** calls before the item is opened */
  beforeOpen(el: HTMLElement): void;
  /** calls when the item is opened */
  onOpen(el: HTMLElement): void;
  /** calls before the item is closed */
  beforeClose(el: HTMLElement): void;
  /** calls when the item is closed */
  onClose(el: HTMLElement): void;
}

export default class Accordion {
  constructor(selectorOrElement: string | string[] | HTMLElement | HTMLElement[], userOptions?: Partial<AccordionOptions>);
  /** Attach events */
  attachEvents(): void;
  /** Detach events */
  detachEvents(): void;
  /** Open the accordion element with the given idx */
  open(idx: number): void;
  /** Close the accordion element with the given idx */
  close(idx: number): void;
  /** Toggle the accordion element with the given idx */
  toggle(idx: number): void;
  /** Open all accordion elements (without animation) */
  openAll(): void;
  /** Close all accordion elements (without animation) */
  closeAll(): void;
  /** If there are new items added by lazy load, you can run this method to update the Accordion */
  update(): void;
  /** Destroy accordion instance: Open elements, remove events, IDs & ARIA */
  destroy(): void;
}
