import { loadAllData } from "./data.js";

import { initUI } from "./ui.js";

import { initFlipkartTables } from "./engines/flipkartEngine.js";
import { initMyntraTables } from "./engines/myntraEngine.js";

async function startApp(){

  try{

    // 1️⃣ Load all sheets (SKU + FK slabs + Myntra slabs)
    const data = await loadAllData();

    // 2️⃣ Initialize Engines
    initFlipkartTables(data);
    initMyntraTables(data);

    // 3️⃣ Start UI with only SKU data
    initUI(data.skuData);

  }catch(error){

    console.error("App failed to start:", error);

  }

}

startApp();
