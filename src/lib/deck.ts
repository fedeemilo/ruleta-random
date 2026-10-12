import type { CategoryId } from "../data/categories";
import { STATEMENTS, type Statement } from "../data/statements";

export type DrawResult = {
  statement: Statement;
  reset: boolean;
  remainingAfter: number;
  total: number;
};

export class StatementDeck {
  private used = new Map<CategoryId, Set<string>>();

  constructor(private readonly bank: Record<CategoryId, Statement[]> = STATEMENTS) {}

  draw(categoryId: CategoryId, random = Math.random): DrawResult {
    const pool = this.bank[categoryId];
    if (!pool?.length) {
      throw new Error(`No hay afirmaciones para ${categoryId}`);
    }

    const used = this.used.get(categoryId) ?? new Set<string>();
    let remaining = pool.filter((item) => !used.has(item.id));
    let reset = false;

    if (remaining.length === 0) {
      used.clear();
      remaining = [...pool];
      reset = true;
    }

    const pick = remaining[Math.floor(random() * remaining.length)];
    if (!pick) {
      throw new Error(`No se pudo elegir una afirmación de ${categoryId}`);
    }

    used.add(pick.id);
    this.used.set(categoryId, used);

    return {
      statement: pick,
      reset,
      remainingAfter: pool.length - used.size,
      total: pool.length,
    };
  }

  remaining(categoryId: CategoryId): number {
    const pool = this.bank[categoryId] ?? [];
    const used = this.used.get(categoryId)?.size ?? 0;
    return Math.max(0, pool.length - used);
  }

  resetAll(): void {
    this.used.clear();
  }
}
