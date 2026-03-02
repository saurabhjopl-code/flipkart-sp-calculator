/* ===============================
   MULTI-SHEET DATA LOADER V2.1
=============================== */

const BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-yEqk-MG6suolRPrWfm4ROxjepofRKJM93s9wgGuB_PPgqykpwWiOEOP_tT4ver5a-tCyFGw4q5Qf/pub?gid=";

const GIDS = {
  sku: "923242779",
  commission: "277340694",
  fixed: "63507208",
  level: "1561068618",
  gta: "1190451618"
};

async function fetchSheet(gid){
  const res = await fetch(`${BASE_URL}${gid}&single=true&output=csv`);
  const text = await res.text();
  return text.split("\n").map(r => r.split(","));
}

export async function loadAllData(){

  const [
    skuRows,
    commissionRows,
    fixedRows,
    levelRows,
    gtaRows
  ] = await Promise.all([
    fetchSheet(GIDS.sku),
    fetchSheet(GIDS.commission),
    fetchSheet(GIDS.fixed),
    fetchSheet(GIDS.level),
    fetchSheet(GIDS.gta)
  ]);

  return {
    skuData: parseSKU(skuRows),
    commissionData: parseCommission(commissionRows),
    fixedData: parseFixed(fixedRows),
    levelMap: parseLevel(levelRows),
    gtaData: parseGTA(gtaRows)
  };
}

/* ================= SKU ================= */

function parseSKU(rows){
  const data = [];

  for(let i=1;i<rows.length;i++){
    const [sku, article, tp, mp, fsn, brand] = rows[i];

    if(!sku || !article || !tp || !mp) continue;

    data.push({
      sku: sku.trim(),
      cat: article.trim(),
      simTP: parseFloat(tp),
      mp: mp.trim().toUpperCase(),
      fsn: fsn?.trim(),
      brand: brand?.trim()
    });
  }

  return data;
}

/* ================= COMMISSION ================= */

function parseCommission(rows){
  const table = {};

  for(let i=1;i<rows.length;i++){
    const [brand, article, lower, upper, rate] = rows[i];
    if(!brand) continue;

    if(!table[brand]) table[brand] = {};
    if(!table[brand][article]) table[brand][article] = [];

    table[brand][article].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      rate: parseFloat(rate)
    });
  }

  return table;
}

/* ================= FIXED ================= */

function parseFixed(rows){
  const table = {};

  for(let i=1;i<rows.length;i++){
    const [brand, article, lower, upper, fee] = rows[i];
    if(!brand) continue;

    if(!table[brand]) table[brand] = {};
    if(!table[brand][article]) table[brand][article] = [];

    table[brand][article].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      fee: parseFloat(fee)
    });
  }

  return table;
}

/* ================= LEVEL MAP ================= */

function parseLevel(rows){
  const map = {};

  for(let i=1;i<rows.length;i++){
    const [article, level] = rows[i];
    if(article) map[article.trim()] = level.trim();
  }

  return map;
}

/* ================= GTA ================= */

function parseGTA(rows){
  const table = {};

  for(let i=1;i<rows.length;i++){
    const [level, lower, upper, fee] = rows[i];
    if(!level) continue;

    if(!table[level]) table[level] = [];

    table[level].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      fee: parseFloat(fee)
    });
  }

  return table;
}
