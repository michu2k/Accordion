import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AccordionConstructor } from "../src/accordion.ts";
import { createAccordionContainer, createTransitionEndEvent } from "./test.utils.ts";

let Accordion: AccordionConstructor;

beforeEach(async () => {
  vi.resetModules();
  Accordion = (await import("../src/accordion.ts")).default;
});

describe("Accordion lifecycle callbacks", () => {
  test("calls beforeOpen() when the panel is expanded", () => {
    const beforeOpen = vi.fn();

    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, { beforeOpen });
    const { item } = items[0]!;

    accordion.open(0);

    expect(beforeOpen).toHaveBeenCalledTimes(1);
    expect(beforeOpen).toHaveBeenCalledWith(item);
  });

  test("calls onOpen() when the panel is expanded", () => {
    const onOpen = vi.fn();

    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, { onOpen });
    const { item, panel } = items[0]!;

    accordion.open(0);
    panel.style.height = "24px";
    panel.dispatchEvent(createTransitionEndEvent("height"));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(item);
  });

  test("calls beforeClose() when the panel is collapsed", () => {
    const beforeClose = vi.fn();

    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, { openOnInit: [0], beforeClose });
    const { item } = items[0]!;

    accordion.close(0);

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(beforeClose).toHaveBeenCalledWith(item);
  });

  test("calls onClose() when the panel is collapsed", () => {
    const onClose = vi.fn();

    const { selector, items } = createAccordionContainer();
    const accordion = new Accordion(selector, { openOnInit: [0], onClose });
    const { item, panel } = items[0]!;

    accordion.close(0);
    panel.style.height = "0px";
    panel.dispatchEvent(createTransitionEndEvent("height"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(item);
  });
});
