# Accordion

Lightweight and accessible accordion module with an extensible API. The library powers disclosure patterns such as FAQ lists, nested accordions, or filter panels while keeping the markup ARIA-compliant and keyboard friendly.

Current version: **3.4.1**

---

## Distribution Targets

- `dist/accordion.min.js` – standalone UMD bundle for direct `<script>` usage.
- `esm/` – tree-shakeable ES modules for modern bundlers.
- `cjs/` – CommonJS modules for Node and legacy tooling.
- `dist-types/` – TypeScript declaration files.

The package also ships `accordion.min.css` with baseline styling.

---

## Installation

### npm / yarn

```bash
npm install accordion-js
```

```ts
import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

const accordion = new Accordion('.accordion-container');
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/accordion-js@3.4.1/dist/accordion.min.css" />
<script src="https://unpkg.com/accordion-js@3.4.1/dist/accordion.min.js"></script>
<script>
  const accordion = new Accordion('.accordion-container');
</script>
```

### Direct Download

Clone or download this repository and include files from the `dist/` folder. Only production-ready assets live there.

---

## Usage

### Markup

Create a container with repeated accordion items. Classes are configurable through options; the defaults are shown below.

```html
<div class="accordion-container">
  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Item 1</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">Accordion panel content.</p>
    </div>
  </div>

  <div class="ac">
    <h2 class="ac-header">
      <button type="button" class="ac-trigger">Item 2</button>
    </h2>
    <div class="ac-panel">
      <p class="ac-text">More content.</p>
    </div>
  </div>
</div>
```

### Initialise

```ts
import Accordion from 'accordion-js';

// Default options
new Accordion('.accordion-container');

// With custom options
new Accordion('.accordion-container', {
  duration: 400,
  showMultiple: true,
  onOpen(currentElement) {
    console.log('opened', currentElement);
  }
});
```

### Advanced Module Usage

The TypeScript build exposes additional helpers for fine-grained control:

```ts
import createAccordion, { Accordion as AccordionController } from 'accordion-js';

const containers = document.querySelectorAll<HTMLElement>('.js-accordion');

// Returns an array of instances, filtering out elements that were not found.
const instances = createAccordion(containers, { collapse: false }) || [];

// Instantiate a single accordion imperatively.
const maybeAccordion = AccordionController.instantiate('#faq');
if (maybeAccordion) {
  maybeAccordion.open(0);
}
```

`Accordion.instantiate` and the default `createAccordion` export now return `false` when a target cannot be resolved. This makes it easy to mount accordions conditionally without guarding every call.

---

## API Reference

### Constructor

`new Accordion(container, options?)`

- **container** – `string | HTMLElement | Array<string | HTMLElement>` (required). Single selector, element, or an array of selectors/elements.
- **options** – `Partial<AccordionOptions>` (optional). See table below.

### Options

| Option         | Type     | Default | Description                                                                                                                               |
| -------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| duration       | number   | 500     | Animation duration in ms                                                                                                                  |
| ariaEnabled    | boolean  | true    | Inject ARIA attributes (`aria-expanded`, `aria-controls`, `role="region"`)                                                                |
| collapse       | boolean  | true    | Allow an expanded item to collapse                                                                                                       |
| showMultiple   | boolean  | false   | Keep multiple items expanded at once                                                                                                     |
| onlyChildNodes | boolean  | true    | When `false`, query nested items as well (disables nested accordion support)                                                             |
| openOnInit     | number[] | []      | Array of indices to expand on initialisation                                                                                             |
| elementClass   | string   | `"ac"`  | Container class for each item                                                                                                            |
| triggerClass   | string   | `"ac-trigger"` | Button class                                                                                                                        |
| panelClass     | string   | `"ac-panel"`   | Panel class                                                                                                                         |
| activeClass    | string   | `"is-active"` | Applied to active items                                                                                                               |
| beforeOpen     | function | –       | Hook invoked before a panel opens: `(element) => void`                                                                                   |
| onOpen         | function | –       | Hook invoked after a panel opens: `(element) => void`                                                                                    |
| beforeClose    | function | –       | Hook invoked before a panel closes: `(element) => void`                                                                                  |
| onClose        | function | –       | Hook invoked after a panel closes: `(element) => void`                                                                                   |

### Methods

| Method         | Description                                                                                | Arguments             |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `attachEvents()` | Re-attach internal listeners after manual `detachEvents()`                                 | –                     |
| `detachEvents()` | Remove all internal listeners                                                             | –                     |
| `open(idx)`      | Expand the item at position `idx`                                                         | `idx: number`         |
| `close(idx)`     | Collapse the item at position `idx`                                                       | `idx: number`         |
| `toggle(idx)`    | Toggle the item at position `idx`                                                         | `idx: number`         |
| `openAll()`      | Expand all items without animation                                                        | –                     |
| `closeAll()`     | Collapse all items without animation                                                      | –                     |
| `update()`       | Re-scan DOM structure (useful after lazy-loading items)                                   | –                     |
| `destroy()`      | Detach events, remove generated IDs/ARIA attributes, and reset all panels                 | –                     |

---

## Building from Source

1. Install dependencies (npm or yarn all work):

    ```bash
    npm install
    ```

2. Build the distributables:

   ```bash
   npm run build
   ```

   - `build:esm` compiles TypeScript sources in `src-ts/` to `esm/` and emits declaration files to `dist-types/`.
   - `build:cjs` produces CommonJS output under `cjs/` for Node/CommonJS consumers.

3. Produce the optional UMD bundle when you want to refresh it:

   ```bash
   npm run build:bundle
   ```

4. (Optional) regenerate the legacy bundle used by the original project:

   ```bash
   npm run build:legacy
   ```

5. Optional: run the legacy demo environment:

   ```bash
   npm run start:dev
   ```

---

## Contributing

- Keep changes TypeScript-first (edit files in `src/`).
- Run `pnpm run build` before submitting pull requests to ensure UMD and declaration artifacts stay in sync.
- Use `pnpm run lint:check` / `pnpm run format:check` to match coding standards.

Issues and pull requests are welcome!

---

## License

Released under the [MIT License](LICENSE).
