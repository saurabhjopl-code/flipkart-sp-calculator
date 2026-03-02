import { calculateFlipkart } from "./engines/flipkartEngine.js";
import { calculateMyntra } from "./engines/myntraEngine.js";

export function calculateSP(row, data) {

  if (row.mp === "MYNTRA") {
    return calculateMyntra(row, data);
  }

  return calculateFlipkart(row, data);
}
