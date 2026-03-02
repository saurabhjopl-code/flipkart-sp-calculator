const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-yEqk-MG6suolRPrWfm4ROxjepofRKJM93s9wgGuB_PPgqykpwWiOEOP_tT4ver5a-tCyFGw4q5Qf/pub?gid=923242779&single=true&output=csv";

export async function loadData(){

  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));

  let data = [];

  for(let i = 1; i < rows.length; i++){

    let sku = rows[i][0]?.trim();
    let category = rows[i][1]?.trim().toLowerCase();
    let TP = parseFloat(rows[i][2]);

    if(!sku || !category || !TP) continue;

    data.push({
      sku,
      cat: category,
      originalTP: TP,
      simTP: TP
    });
  }

  console.log("Total rows loaded:", data.length);

  return data;
}
