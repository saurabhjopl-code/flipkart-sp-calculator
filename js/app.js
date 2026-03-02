import { loadAllData } from "./data.js";
import { initUI } from "./ui.js";

async function startApp() {
  try {

    const data = await loadAllData();

    // pass FULL data object to UI
    initUI(data);

  } catch (error) {
    console.error("App failed to start:", error);
  }
}

startApp();
