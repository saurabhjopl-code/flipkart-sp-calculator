import { calculateSP as calculateFlipkartSP } from "./engines/flipkartEngine.js";
import { calculateMyntraSP } from "./engines/myntraEngine.js";

export function calculateSP(category, TP, mp, brand){

  if(mp === "MYNTRA"){
    return calculateMyntraSP(category, TP, brand);
  }

  return calculateFlipkartSP(category, TP);
}
