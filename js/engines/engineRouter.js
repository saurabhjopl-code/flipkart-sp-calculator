import { calculateFlipkartSP } from "./flipkartEngine.js";
import { calculateMyntraSP } from "./myntraEngine.js";

export function calculateSP(category, TP, mp, brand){

  if(mp === "MYNTRA"){
    return calculateMyntraSP(category, TP, brand);
  }

  return calculateFlipkartSP(category, TP);
}
