import { calculateFlipkart } from "./engines/flipkartEngine.js";
import { calculateMyntra } from "./engines/myntraEngine.js";

export function calculateSP(category, TP, mp, brand) {

  if (mp === "MYNTRA") {
    return calculateMyntra(category, TP, brand);
  }

  return calculateFlipkart(category, TP);
}
