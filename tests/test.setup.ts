import { beforeAll } from "vitest";

import "@testing-library/jest-dom/vitest";

beforeAll(() => {
  global.CSS = {
    escape: (str: string) => str
  } as typeof CSS;
});
