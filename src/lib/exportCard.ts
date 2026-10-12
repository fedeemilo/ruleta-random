import { toPng } from "html-to-image";

export async function downloadResultCard(node: HTMLElement, filename: string): Promise<void> {
  await document.fonts.ready;

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#140c16",
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
