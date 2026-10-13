import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../data/categories";
import { STATEMENTS } from "../data/statements";
import { StatementDeck } from "./deck";

const BANNED = [
  "Hay que contarle todo a tu pareja",
  "Hay infidelidades que se pueden justificar",
  "Está bien revisarle el celular a tu pareja",
  "Es mejor ser amigo de tu ex",
  "Vivir juntos antes de casarse es obligatorio",
  "Si tu pareja no le cae bien a tus amigos",
  "Está bien mentir en una entrevista",
  "Trabajo que odiás con buen sueldo vs uno que amás",
  "Decirle a un amigo cuánta plata ganás",
  "Prestarle plata a un amigo",
  "Amigos de toda la vida no siempre son los mejores",
  "Cortar con un familiar tóxico",
  "Contarle a un amigo que su pareja le es infiel",
  "Los padres tienen favoritos",
  "Redes sociales hacen más mal que bien",
  "Ghosting",
  "Chistes que no se pueden hacer",
  "No hace falta tener hijos",
];

describe("banco de afirmaciones", () => {
  it("tiene al menos 25 afirmaciones originales por categoría", () => {
    for (const id of CATEGORY_IDS) {
      expect(STATEMENTS[id].length).toBeGreaterThanOrEqual(25);
      const ids = STATEMENTS[id].map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("no reutiliza las afirmaciones prohibidas", () => {
    const all = CATEGORY_IDS.flatMap((id) => STATEMENTS[id].map((item) => item.text));
    for (const banned of BANNED) {
      expect(all.some((text) => text.toLowerCase().includes(banned.toLowerCase()))).toBe(false);
    }
  });
});

describe("StatementDeck", () => {
  it("no repite una afirmación hasta agotar el mazo", () => {
    const deck = new StatementDeck();
    const seen = new Set<string>();
    const total = STATEMENTS.pareja.length;

    for (let i = 0; i < total; i += 1) {
      const result = deck.draw("pareja", () => 0);
      expect(seen.has(result.statement.id)).toBe(false);
      seen.add(result.statement.id);
      expect(result.reset).toBe(false);
    }

    expect(seen.size).toBe(total);

    const afterReset = deck.draw("pareja", () => 0);
    expect(afterReset.reset).toBe(true);
    expect(seen.has(afterReset.statement.id)).toBe(true);
  });

  it("reinicia solo la categoría agotada", () => {
    const deck = new StatementDeck();
    deck.draw("plata", () => 0);
    for (let i = 0; i < STATEMENTS.vida.length; i += 1) {
      deck.draw("vida", () => 0);
    }
    const reset = deck.draw("vida", () => 0);
    expect(reset.reset).toBe(true);
    expect(deck.remaining("plata")).toBe(STATEMENTS.plata.length - 1);
  });
});
