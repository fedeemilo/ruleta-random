import { describe, expect, it } from "vitest";
import { nextSpinRotation, pickRandomCategory, sectorCenterFromTop } from "./wheel";

describe("wheel math", () => {
  it("centra cada sector a 45 + 90n grados desde las 12", () => {
    expect(sectorCenterFromTop(0)).toBe(45);
    expect(sectorCenterFromTop(1)).toBe(135);
    expect(sectorCenterFromTop(2)).toBe(225);
    expect(sectorCenterFromTop(3)).toBe(315);
  });

  it("avanza la ruleta y deja el sector elegido cerca del puntero", () => {
    const next = nextSpinRotation(0, "pareja", () => 0.5);
    expect(next).toBeGreaterThan(360 * 5);
    const landed = ((next % 360) + 360) % 360;
    const target = (360 - 45) % 360;
    const distance = Math.min(
      Math.abs(landed - target),
      360 - Math.abs(landed - target),
    );
    expect(distance).toBeLessThan(30);
  });

  it("elige una categoría válida", () => {
    expect(["pareja", "plata", "amistad", "vida"]).toContain(pickRandomCategory(() => 0.1));
  });
});
