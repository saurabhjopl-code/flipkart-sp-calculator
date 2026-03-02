import { calculateFlipkart } from "./engines/flipkartEngine.js";
import { calculateMyntra } from "./engines/myntraEngine.js";

export function calculateSP(row, tables) {

  if (row.mp === "MYNTRA") {
    return calculateMyntra(row.cat, row.simTP, row.brand, tables);
  }

  return calculateFlipkart(row.cat, row.simTP, tables);
}
