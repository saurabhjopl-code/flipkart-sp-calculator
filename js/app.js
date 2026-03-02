import { loadSheetData } from "./data.js";
import { initUI } from "./ui.js";

async function startApp(){
const data = await loadSheetData();
initUI(data);
}

startApp();
