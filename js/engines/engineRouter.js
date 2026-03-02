import { calculateFlipkartSP } from "./flipkartEngine.js";
import { calculateMyntraSP } from "./myntraEngine.js";

export function calculateSP(category, TP, mp){

  if(mp === "MYNTRA"){
    return calculateMyntraSP(category, TP);
  }

  // FLIPKART + SHOPSY handled in same engine
  return calculateFlipkartSP(category, TP);
}
