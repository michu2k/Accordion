type AccordionItem = ReturnType<typeof createAccordionItem>;

/** Creates a single accordion item. */
export function createAccordionItem(index: number = 0) {
  const template = `
    <div class="ac">
      <h2 class="ac-header">
        <button type="button" class="ac-trigger">Trigger ${index}</button>
      </h2>
      <div class="ac-panel">
        <p class="ac-text">Panel Text ${index}</p>
      </div>
    </div>
  `.replace(/\s+/g, " ");

  const fragment = document.createRange().createContextualFragment(template);

  const item = fragment.firstElementChild as HTMLElement;
  const trigger = item.querySelector<HTMLElement>(".ac-trigger")!;
  const panel = item.querySelector<HTMLElement>(".ac-panel")!;

  return { item, panel, trigger };
}

/** Creates an accordion container. */
export function createAccordionContainer(className = "accordion", { clearBody = true } = {}) {
  // Clear the document body before appending the new container
  if (clearBody) document.body.innerHTML = "";

  const container = document.createElement("div");
  container.classList.add(className);

  const items: [AccordionItem, AccordionItem, AccordionItem] = [
    createAccordionItem(0),
    createAccordionItem(1),
    createAccordionItem(2)
  ];

  container.append(...items.map(({ item }) => item));

  document.body.appendChild(container);

  return { container, selector: `.${className}`, items };
}

/** Creates a transitionend event for the specified property. */
export function createTransitionEndEvent(propertyName: string) {
  const event = new Event("transitionend", { bubbles: true });

  Object.defineProperty(event, "propertyName", {
    value: propertyName
  });

  return event;
}
