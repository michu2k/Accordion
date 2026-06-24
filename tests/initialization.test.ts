import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionContainer } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion initialization", () => {
  test("initializes with a string selector", () => {
    const { selector } = createAccordionContainer();
    const accordion = new Accordion(selector);

    expect(accordion).toBeInstanceOf(Accordion);
  });

  test("initializes with an HTMLElement", () => {
    const { container } = createAccordionContainer();
    const accordion = new Accordion(container);

    expect(accordion).toBeInstanceOf(Accordion);
  });

  test("initializes with an array of elements", () => {
    const { container } = createAccordionContainer();
    const { selector } = createAccordionContainer("second-accordion");
    const accordion = new Accordion([container, selector]);

    expect(accordion.length).toBe(2);

    for (const instance of accordion) {
      expect(instance).toBeInstanceOf(Accordion);
    }
  });

  test("throws an error when initialized with a non-existent selector", () => {
    expect(() => new Accordion(".non-existent-selector")).toThrow("Container not found");
  });
});
