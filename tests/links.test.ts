import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionContainer } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion links", () => {
  test("clicking a link inside the trigger does not toggle the item", () => {
    const { selector, items } = createAccordionContainer();
    const { item, trigger } = items[0];

    trigger.innerHTML = 'Trigger <a href="#more">Lorem Ipsum</a>';
    new Accordion(selector);

    trigger.querySelector("a")!.click();
    expect(item.classList).not.toContain("is-active");
  });

  test("clicking an element nested inside a link does not toggle the item", () => {
    const { selector, items } = createAccordionContainer();
    const { item, trigger } = items[0];

    trigger.innerHTML = 'Trigger <a href="#more">Lorem <span>Ipsum</span></a>';
    new Accordion(selector);

    trigger.querySelector("span")!.click();
    expect(item.classList).not.toContain("is-active");
  });

  test("clicking a link without href inside the trigger toggles the item", () => {
    const { selector, items } = createAccordionContainer();
    const { item, trigger } = items[0];

    trigger.innerHTML = "Trigger <a>Lorem Ipsum</a>";
    new Accordion(selector);

    trigger.querySelector("a")!.click();
    expect(item.classList).toContain("is-active");
  });

  test("a trigger that is itself a link toggles the item", () => {
    const { selector, items } = createAccordionContainer();
    const { item, trigger } = items[0];

    const linkTrigger = document.createElement("a");
    linkTrigger.href = "#item";
    linkTrigger.className = "ac-trigger";
    linkTrigger.textContent = "Trigger";
    trigger.replaceWith(linkTrigger);

    new Accordion(selector);

    linkTrigger.click();
    expect(item.classList).toContain("is-active");
  });
});
