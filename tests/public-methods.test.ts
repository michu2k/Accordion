import { beforeAll, describe, expect, test, vi } from "vitest";
import { createAccordionContainer, createAccordionItem } from "./test.utils.ts";
import Accordion, { type Accordion as AccordionType } from "../src/accordion.ts";

let container: ReturnType<typeof createAccordionContainer>;
let accordion: AccordionType;

beforeAll(() => {
  container = createAccordionContainer();
  accordion = new Accordion(container.selector);
});

describe("Accordion public methods", () => {
  test("open(index) expands the specified accordion item", () => {
    const { item } = container.items[0];

    accordion.open(0);
    expect(item.classList).toContain("is-active");
  });

  test("openAll() expands all items", () => {
    accordion.openAll();

    for (const { item } of container.items) {
      expect(item.classList).toContain("is-active");
    }
  });

  test("close(index) collapses the specified accordion item", () => {
    const { item } = container.items[0];

    accordion.close(0);
    expect(item.classList).not.toContain("is-active");
  });

  test("closeAll() collapses all accordion items", () => {
    accordion.closeAll();

    for (const { item } of container.items) {
      expect(item.classList).not.toContain("is-active");
    }
  });

  test("toggle(index) toggles the specified accordion item", () => {
    const { item } = container.items[0];

    accordion.toggle(0);
    expect(item.classList).toContain("is-active");

    accordion.toggle(0);
    expect(item.classList).not.toContain("is-active");
  });

  test("update() updates the layout when new items are added", () => {
    const { item, trigger, panel } = createAccordionItem(3);
    container.container.appendChild(item);

    accordion.update();
    trigger.click();

    expect(item.id).toContain("ac-");
    expect(trigger.id).toContain("ac-");
    expect(panel.id).toContain("ac-");
    expect(item.classList).toContain("is-active");
  });

  test("destroy() opens items, removes events, IDs & ARIA attributes", () => {
    const { selector, items } = createAccordionContainer();
    const onOpen = vi.fn();
    const beforeOpen = vi.fn();

    const instance = new Accordion(selector, { beforeOpen, onOpen });
    instance.destroy();

    expect(onOpen).not.toHaveBeenCalled();
    expect(beforeOpen).not.toHaveBeenCalled();

    // Note: ARIA attributes are already being checked in accessibility tests
    for (const { item, trigger, panel } of items) {
      expect(panel.style.height).toBe("auto");
      expect(item.classList).toContain("is-active");
      trigger.click();
      expect(item.classList).toContain("is-active");

      expect(item.id).toBe("");
      expect(trigger.id).toBe("");
      expect(panel.id).toBe("");
    }
  });

  test("destroy() keeps custom IDs", () => {
    const { selector, items } = createAccordionContainer();
    const { item, trigger, panel } = items[0];

    item.id = "faq";
    trigger.id = "ac-faq-trigger";
    panel.id = "ac-faq-panel";

    const instance = new Accordion(selector);
    instance.destroy();

    expect(item.id).toBe("faq");
    expect(trigger.id).toBe("ac-faq-trigger");
    expect(panel.id).toBe("ac-faq-panel");
  });
});
