import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionContainer } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion options", () => {
  test.each([
    ["default duration is applied correctly", {}, "500ms"],
    ["custom duration is applied correctly", { duration: 700 }, "700ms"]
  ])("%s", (_, options, expected) => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector, options);

    const { panel } = items[0]!;

    expect(panel.style.transitionDuration).toBe(expected);
  });

  test.each([
    ["'true' allows an expanded item to be collapsed", {}, false],
    ["'false' prevents an expanded item from being collapsed", { collapse: false }, true]
  ])("setting collapse to %s", (_, options, expected) => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector, options);

    const { item, trigger } = items[0]!;

    trigger.click();
    expect(item.classList).toContain("is-active");

    trigger.click();
    expect(item.classList.contains("is-active")).toBe(expected);
  });

  test("prevents collapsing an active item when toggle() is called and 'collapse' is false", () => {
    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, { collapse: false, openOnInit: [0] });

    const { item } = items[0]!;
    expect(item.classList).toContain("is-active");

    accordion.toggle(0);
    expect(item.classList).toContain("is-active");
  });

  test.each([
    ["'false' should allow only one item to be expanded at a time", {}, false],
    ["'true' should allow multiple items to be expanded simultaneously", { showMultiple: true }, true]
  ])("setting showMultiple to %s", (_, options, expected) => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector, options);

    items[0]!.trigger.click();
    expect(items[0]!.item.classList).toContain("is-active");
    expect(items[1]!.item.classList).not.toContain("is-active");

    items[1]!.trigger.click();
    expect(items[0]!.item.classList.contains("is-active")).toBe(expected);
    expect(items[1]!.item.classList).toContain("is-active");
  });
});
