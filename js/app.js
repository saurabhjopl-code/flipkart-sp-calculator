import { loadData } from "./data.js";
import { initUI } from "./ui.js";

async function startApp(){
  try{
    const data = await loadData();
    initUI(data);
  }catch(error){
    console.error("App failed to start:", error);
  }
}

startApp();
