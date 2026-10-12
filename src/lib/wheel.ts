import { CATEGORIES, type CategoryId, getCategoryIndex } from "../data/categories";

const SECTOR_SIZE = 360 / CATEGORIES.length;

export function sectorCenterFromTop(categoryIndex: number): number {
  return SECTOR_SIZE / 2 + categoryIndex * SECTOR_SIZE;
}

/**
 * CSS rotate() turns the wheel clockwise. The pointer stays at 12 o'clock.
 * A mark at local angle A (clockwise from top) lands under the pointer when
 * rotation ≡ -A (mod 360).
 */
export function nextSpinRotation(
  currentRotation: number,
  categoryId: CategoryId,
  random = Math.random,
): number {
  const index = getCategoryIndex(categoryId);
  const targetMod = (360 - sectorCenterFromTop(index)) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const extraTurns = 5 + Math.floor(random() * 3);
  let delta = (targetMod - currentMod + 360) % 360;
  delta += extraTurns * 360;

  const jitterRange = SECTOR_SIZE * 0.55;
  const jitter = (random() - 0.5) * jitterRange;
  return currentRotation + delta + jitter;
}

export function pickRandomCategory(random = Math.random): CategoryId {
  const index = Math.floor(random() * CATEGORIES.length);
  return CATEGORIES[index]?.id ?? "pareja";
}
