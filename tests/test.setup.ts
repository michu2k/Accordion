import { beforeAll } from "vitest";

beforeAll(() => {
  global.CSS = {
    escape: (str: string) => str
  } as typeof CSS;
});
