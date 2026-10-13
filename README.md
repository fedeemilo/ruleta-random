# Ruleta mágica

Una app estática para la previa: alguien opera la ruleta, gira (o elige una categoría) y cae una afirmación polémica para debatir. Toda la interfaz está en español rioplatense.

No hace falta backend. Se puede abrir en el celu, en la compu o en la tele.

## Cómo se usa

1. Abrí la app y tocá **Girar** (o la barra espaciadora).
2. La rueda aterriza en una de estas categorías:
   - Pareja y relaciones
   - Plata y laburo
   - Amistad y familia
   - Vida y sociedad
3. Aparece una afirmación al azar de esa categoría. La barra discute: de acuerdo / en desacuerdo.
4. Si ya saben de qué quieren hablar, pueden **elegir la categoría** directo, sin dejarlo al azar.
5. **Descargar imagen** exporta la tarjeta del resultado en PNG, lista para mandar al grupo.
6. **Girar de nuevo** vuelve a tirar.

En cada sesión no se repite una afirmación hasta agotar el mazo de esa categoría. Cuando se acaba, se reinicia solo ese mazo.

## Cómo editar las afirmaciones

El banco vive en `src/data/statements.ts`. Cada categoría es un array de objetos `{ id, text }`.

Para agregar una:

```ts
{ id: "pareja-29", text: "Tu afirmación nueva, escrita como opinión." }
```

Reglas que convienen respetar:

- Escribila como afirmación para estar de acuerdo o no, no como pregunta.
- Cortita, con voseo rioplatense.
- El `id` tiene que ser único dentro de la categoría.

Los nombres y colores de las categorías están en `src/data/categories.ts`.

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run build
```

El build de Vite sale en `dist/`, con `base` en `/`.

## Deploy en Vercel

Esta app está pensada para Vercel, no para GitHub Pages.

1. Importá el repo `fedeemilo/ruleta-random` en [Vercel](https://vercel.com/new).
2. Framework: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

Si el proyecto de Vercel todavía no existe, ese import es el único paso manual. Después, cada push a `main` vuelve a publicar solo.
