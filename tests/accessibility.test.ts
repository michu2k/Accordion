import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionContainer } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion accessibility - ARIA attributes", () => {
  test("panel and trigger have correct ARIA attributes", () => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector);

    for (const { trigger, panel } of items) {
      expect(trigger.role).toBe("button");
      expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
      expect(trigger.ariaDisabled).toBe("false");
      expect(trigger.ariaExpanded).toBe("false");

      expect(panel.role).toBe("region");
      expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
    }
  });

  test.each([
    ["when 'ariaEnabled' is false", { ariaEnabled: false }, false],
    ["after accordion is destroyed", { ariaEnabled: true }, true]
  ])("ARIA attributes are not applied %s", (_, options, destroy) => {
    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, options);

    if (destroy) {
      accordion.destroy();
    }

    for (const { trigger, panel } of items) {
      expect(trigger.role).toBeNull();
      expect(trigger.getAttribute("aria-controls")).toBeNull();
      expect(trigger.ariaDisabled).toBeNull();
      expect(trigger.ariaExpanded).toBeNull();

      expect(panel.role).toBeNull();
      expect(panel.getAttribute("aria-labelledby")).toBeNull();
    }
  });

  test("expanded trigger should have correct ARIA attributes", () => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector, { openOnInit: [0] });

    const trigger = items[0]!.trigger;

    expect(trigger.ariaExpanded).toBe("true");
    expect(trigger.ariaDisabled).toBe("false");
  });

  test("expanded trigger should have aria-disabled when 'collapse' is false", () => {
    const { selector, items } = createAccordionContainer();
    new Accordion(selector, { openOnInit: [0], collapse: false });

    const trigger = items[0]!.trigger;

    expect(trigger.ariaExpanded).toBe("true");
    expect(trigger.ariaDisabled).toBe("true");
  });
});

describe("Accordion accessibility - keyboard navigation", () => {
  const user = userEvent.setup();

  beforeAll(() => {
    const { selector } = createAccordionContainer();
    new Accordion(selector);
  });

  test.each([
    ["{ArrowDown}", "moves focus to the next item", 0, 1],
    ["{ArrowDown}", "on the last item moves focus to the first item", 2, 0],
    ["{ArrowUp}", "moves focus to the previous item", 2, 1],
    ["{ArrowUp}", "on the first item moves focus to the last item", 0, 2],
    ["{Home}", "moves focus to the first item", 2, 0],
    ["{End}", "moves focus to the last item", 0, 2]
  ])("pressing %s key %s", async (key, _, beforeIndex, afterIndex) => {
    const triggers = screen.getAllByRole("button", { name: /Trigger/i });
    triggers[beforeIndex]!.focus();

    expect(triggers[beforeIndex]).toHaveFocus();

    await user.keyboard(key);

    expect(triggers[afterIndex]).toHaveFocus();
  });
});
