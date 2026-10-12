import { describe, expect, it } from "vitest";
import { slugify } from "./text";

describe("slugify", () => {
  it("arma un nombre de archivo limpio", () => {
    expect(slugify("Pareja y relaciones")).toBe("pareja-y-relaciones");
  });
});
