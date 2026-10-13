import "@fontsource/fredoka/latin-600.css";
import "@fontsource/fredoka/latin-700.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import { CATEGORIES, getCategory, type CategoryId } from "./data/categories";
import { StatementDeck } from "./lib/deck";
import { downloadResultCard } from "./lib/exportCard";
import { slugify } from "./lib/text";
import { nextSpinRotation, pickRandomCategory } from "./lib/wheel";
import "./style.css";

const deck = new StatementDeck();
let rotation = 0;
let spinning = false;
let toastTimer = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("No se encontró #app");
}

app.innerHTML = `
  <main class="app">
    <header class="hero">
      <div>
        <p class="kicker">Para la previa</p>
        <h1>Ruleta mágica</h1>
        <p class="lede">Girá la rueda, aterrizá en una afirmación y debatí con la barra: ¿estás de acuerdo o no?</p>
      </div>
      <p class="status" data-status>Elegí girar o pinchá una categoría.</p>
    </header>

    <section class="stage">
      <div class="wheel-panel">
        <div class="wheel-wrap">
          <div class="pointer" aria-hidden="true"></div>
          <div class="wheel-scene">
            <div class="wheel" data-wheel>${renderWheel()}</div>
            <div class="hub">
              <button class="spin-btn" type="button" data-spin>Girar</button>
            </div>
          </div>
        </div>
        <p class="hint">También podés apretar la barra espaciadora.</p>
      </div>

      <aside class="pick-panel">
        <h2 class="pick-title">O elegí categoría</h2>
        <div class="picks">
          ${CATEGORIES.map(
            (category) => `
              <button
                class="pick"
                type="button"
                data-pick="${category.id}"
                style="background:${category.color};color:${category.ink}"
              >
                <strong>${category.shortName}</strong>
                <span>${category.name}</span>
              </button>
            `,
          ).join("")}
        </div>
      </aside>
    </section>
  </main>

  <div class="result-layer" data-result-layer hidden>
    <div
      class="result-shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-statement"
      data-result-dialog
    >
      <button type="button" class="result-close" data-close aria-label="Cerrar">
        <span aria-hidden="true">×</span>
      </button>
      <article class="result-card" data-result-card>
        <div class="card-brand">
          <span>Ruleta mágica</span>
          <span class="badge" data-result-category></span>
        </div>
        <p class="statement" id="result-statement" data-result-text></p>
        <p class="prompt">¿Estás de acuerdo?</p>
      </article>
      <div class="actions">
        <button class="primary" type="button" data-download>Descargar imagen</button>
        <button class="ghost" type="button" data-again>Girar de nuevo</button>
      </div>
    </div>
  </div>

  <div class="toast" data-toast hidden role="status" aria-live="polite"></div>
`;

const wheelEl = qs<HTMLElement>("[data-wheel]");
const spinBtn = qs<HTMLButtonElement>("[data-spin]");
const statusEl = qs<HTMLElement>("[data-status]");
const resultLayer = qs<HTMLElement>("[data-result-layer]");
const resultCard = qs<HTMLElement>("[data-result-card]");
const resultCategory = qs<HTMLElement>("[data-result-category]");
const resultText = qs<HTMLElement>("[data-result-text]");
const toastEl = qs<HTMLElement>("[data-toast]");
const downloadBtn = qs<HTMLButtonElement>("[data-download]");
const againBtn = qs<HTMLButtonElement>("[data-again]");
const closeBtn = qs<HTMLButtonElement>("[data-close]");
const resultDialog = qs<HTMLElement>("[data-result-dialog]");
const pickButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-pick]"));

function renderWheel(): string {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 188;
  const sectors = CATEGORIES.map((category, index) => {
    const start = ((index * 90 - 90) * Math.PI) / 180;
    const end = (((index + 1) * 90 - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const mid = ((index * 90 + 45 - 90) * Math.PI) / 180;
    const lx = cx + radius * 0.58 * Math.cos(mid);
    const ly = cy + radius * 0.58 * Math.sin(mid);
    const rotate = index * 90 + 45;
    return `
      <path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z" fill="${category.color}"></path>
      <text
        x="${lx}"
        y="${ly}"
        fill="${category.ink}"
        font-size="28"
        font-family="Fredoka, sans-serif"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${rotate} ${lx} ${ly})"
      >${category.shortName}</text>
    `;
  }).join("");

  return `
    <svg class="wheel-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Ruleta de cuatro categorías">
      ${sectors}
      <circle cx="${cx}" cy="${cy}" r="186" fill="none" stroke="rgba(20,12,22,0.18)" stroke-width="4"></circle>
    </svg>
  `;
}

function qs<T extends Element>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) {
    throw new Error(`No se encontró ${selector}`);
  }
  return node;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setBusy(isBusy: boolean): void {
  spinning = isBusy;
  spinBtn.disabled = isBusy;
  pickButtons.forEach((button) => {
    button.disabled = isBusy;
  });
}

function showToast(message: string): void {
  toastEl.textContent = message;
  toastEl.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.hidden = true;
  }, 3200);
}

function revealResult(categoryId: CategoryId): void {
  const category = getCategory(categoryId);
  const draw = deck.draw(categoryId);

  resultCard.style.setProperty("--card-color", category.color);
  resultCard.style.setProperty("--card-ink", category.ink);
  resultCard.style.background = category.color;
  resultCard.style.color = category.ink;
  resultCategory.textContent = category.name;
  resultText.textContent = draw.statement.text;
  resultLayer.hidden = false;
  closeBtn.focus();
  statusEl.textContent = `Quedan ${draw.remainingAfter} de ${draw.total} en ${category.shortName}.`;

  if (draw.reset) {
    showToast(`Se reinició el mazo de ${category.name}.`);
  }
}

function isResultOpen(): boolean {
  return !resultLayer.hidden;
}

function closeResult(): void {
  if (!isResultOpen()) return;
  resultLayer.hidden = true;
  spinBtn.focus();
}

async function spinTo(categoryId: CategoryId): Promise<void> {
  if (spinning) return;
  setBusy(true);
  closeResult();

  rotation = nextSpinRotation(rotation, categoryId);
  wheelEl.style.transform = `rotate(${rotation}deg)`;

  if (prefersReducedMotion()) {
    wheelEl.classList.remove("is-spinning");
    revealResult(categoryId);
    setBusy(false);
    return;
  }

  wheelEl.classList.add("is-spinning");
  await waitForTransition(wheelEl);
  revealResult(categoryId);
  setBusy(false);
}

function waitForTransition(node: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      node.removeEventListener("transitionend", onEnd);
      resolve();
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target === node && event.propertyName === "transform") {
        done();
      }
    };
    node.addEventListener("transitionend", onEnd);
    window.setTimeout(done, 4600);
  });
}

spinBtn.addEventListener("click", () => {
  void spinTo(pickRandomCategory());
});

pickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.pick as CategoryId | undefined;
    if (id) void spinTo(id);
  });
});

againBtn.addEventListener("click", () => {
  closeResult();
  void spinTo(pickRandomCategory());
});

closeBtn.addEventListener("click", () => {
  closeResult();
});

resultLayer.addEventListener("click", (event) => {
  if (event.target === resultLayer) {
    closeResult();
  }
});

resultDialog.addEventListener("click", (event) => {
  event.stopPropagation();
});

downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  try {
    const category = resultCategory.textContent ?? "resultado";
    const background = resultCard.style.background || "#140c16";
    await downloadResultCard(resultCard, `ruleta-${slugify(category)}.png`, background);
  } catch {
    showToast("No se pudo armar la imagen. Probá de nuevo.");
  } finally {
    downloadBtn.disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (isResultOpen()) {
      event.preventDefault();
      closeResult();
    }
    return;
  }

  if (isResultOpen()) {
    return;
  }

  if (event.code === "Space" && event.target === document.body) {
    event.preventDefault();
    void spinTo(pickRandomCategory());
  }
});
