import { normalizeCategory, calculateSP } from "./engine.js";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-yEqk-MG6suolRPrWfm4ROxjepofRKJM93s9wgGuB_PPgqykpwWiOEOP_tT4ver5a-tCyFGw4q5Qf/pub?gid=923242779&single=true&output=csv";

export async function loadSheetData(){

const res = await fetch(SHEET_URL);
const text = await res.text();

let rows = text.split("\n").map(r=>r.split(","));
let data=[];

for(let i=1;i<rows.length;i++){
let sku=rows[i][0]?.trim();
let cat=normalizeCategory(rows[i][1]);
let TP=parseFloat(rows[i][2]);
if(!sku||!cat||isNaN(TP)) continue;

let result=calculateSP(cat,TP);

data.push({
sku,
cat,
originalTP:TP,
simTP:TP,
originalSP:result.SP,
SP:result.SP,
settlement:result.settlement
});
}

return data;
}
