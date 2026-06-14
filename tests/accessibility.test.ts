import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionLayout } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion accessibility", () => {
  test("panel and trigger have correct ARIA attributes", () => {
    const { selector, elements } = createAccordionLayout();
    new Accordion(selector);

    for (const element of elements) {
      const trigger = element.querySelector(".ac-trigger")!;
      const panel = element.querySelector(".ac-panel")!;

      expect(trigger.role).toBe("button");
      expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
      expect(trigger.ariaDisabled).toBe("false");
      expect(trigger.ariaExpanded).toBe("false");

      expect(panel.role).toBe("region");
      expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
    }
  });

  const testCases = [
    { description: "when 'ariaEnabled' is false", options: { ariaEnabled: false }, destroy: false },
    { description: "after accordion is destroyed", options: { ariaEnabled: true }, destroy: true }
  ];

  for (const { description, options, destroy } of testCases) {
    test(`ARIA attributes are not applied ${description}`, () => {
      const { selector, elements } = createAccordionLayout();
      const accordion = new Accordion(selector, options);

      if (destroy) {
        accordion.destroy();
      }

      for (const element of elements) {
        const trigger = element.querySelector(".ac-trigger")!;
        const panel = element.querySelector(".ac-panel")!;

        expect(trigger.role).toBeNull();
        expect(trigger.getAttribute("aria-controls")).toBeNull();
        expect(trigger.ariaDisabled).toBeNull();
        expect(trigger.ariaExpanded).toBeNull();

        expect(panel.role).toBeNull();
        expect(panel.getAttribute("aria-labelledby")).toBeNull();
      }
    });
  }

  test("expanded trigger should have correct ARIA attributes", () => {
    const { selector, elements } = createAccordionLayout();
    new Accordion(selector, { openOnInit: [0] });

    const trigger = elements[0]!.querySelector(".ac-trigger")!;

    expect(trigger.ariaExpanded).toBe("true");
    expect(trigger.ariaDisabled).toBe("false");
  });

  test("expanded trigger should have aria-disabled when 'collapse' is false", () => {
    const { selector, elements } = createAccordionLayout();
    new Accordion(selector, { openOnInit: [0], collapse: false });

    const trigger = elements[0]!.querySelector(".ac-trigger")!;

    expect(trigger.ariaExpanded).toBe("true");
    expect(trigger.ariaDisabled).toBe("true");
  });
});
