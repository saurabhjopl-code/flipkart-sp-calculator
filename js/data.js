/* =====================================
   MASTER DATA LOADER – FK + MYNTRA
===================================== */

const BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-yEqk-MG6suolRPrWfm4ROxjepofRKJM93s9wgGuB_PPgqykpwWiOEOP_tT4ver5a-tCyFGw4q5Qf/pub?gid=";

const GIDS = {
  sku: "923242779",

  // Myntra
  myntra_commission: "277340694",
  myntra_fixed: "63507208",
  myntra_level: "1561068618",
  myntra_gta: "1190451618",

  // Flipkart
  fk_commission: "381793539",
  fk_fixed: "1293944430",
  fk_collection: "1297095727",
  fk_gta: "275431599"
};

async function fetchSheet(gid){
  const res = await fetch(`${BASE_URL}${gid}&single=true&output=csv`);
  const text = await res.text();
  return text.split("\n").map(r => r.split(","));
}

export async function loadAllData(){

  const [
    skuRows,

    myntraCommissionRows,
    myntraFixedRows,
    myntraLevelRows,
    myntraGTARows,

    fkCommissionRows,
    fkFixedRows,
    fkCollectionRows,
    fkGTARows

  ] = await Promise.all([
    fetchSheet(GIDS.sku),

    fetchSheet(GIDS.myntra_commission),
    fetchSheet(GIDS.myntra_fixed),
    fetchSheet(GIDS.myntra_level),
    fetchSheet(GIDS.myntra_gta),

    fetchSheet(GIDS.fk_commission),
    fetchSheet(GIDS.fk_fixed),
    fetchSheet(GIDS.fk_collection),
    fetchSheet(GIDS.fk_gta)
  ]);

  return {
    skuData: parseSKU(skuRows),

    commissionData: parseMyntraCommission(myntraCommissionRows),
    fixedData: parseMyntraFixed(myntraFixedRows),
    levelMap: parseMyntraLevel(myntraLevelRows),
    gtaData: parseMyntraGTA(myntraGTARows),

    fkCommission: parseFKCommission(fkCommissionRows),
    fkFixed: parseFKFixed(fkFixedRows),
    fkCollection: parseFKCollection(fkCollectionRows),
    fkGTA: parseFKGTA(fkGTARows)
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

/* ================= MYNTRA PARSERS ================= */

function parseMyntraCommission(rows){
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

function parseMyntraFixed(rows){
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

function parseMyntraLevel(rows){
  const map = {};
  for(let i=1;i<rows.length;i++){
    const [article, level] = rows[i];
    if(article) map[article.trim()] = level.trim();
  }
  return map;
}

function parseMyntraGTA(rows){
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

/* ================= FLIPKART PARSERS ================= */

function parseFKCommission(rows){
  const table = {};
  for(let i=1;i<rows.length;i++){
    const [category, lower, upper, rate] = rows[i];
    if(!category) continue;

    if(!table[category]) table[category] = [];

    table[category].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      rate: parseFloat(rate)
    });
  }
  return table;
}

function parseFKFixed(rows){
  const table = {};
  for(let i=1;i<rows.length;i++){
    const [category, lower, upper, fee] = rows[i];
    if(!category) continue;

    if(!table[category]) table[category] = [];

    table[category].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      fee: parseFloat(fee)
    });
  }
  return table;
}

function parseFKCollection(rows){
  const table = {};
  for(let i=1;i<rows.length;i++){
    const [category, lower, upper, rate] = rows[i];
    if(!category) continue;

    if(!table[category]) table[category] = [];

    table[category].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      rate: parseFloat(rate)
    });
  }
  return table;
}

function parseFKGTA(rows){
  const table = {};
  for(let i=1;i<rows.length;i++){
    const [category, lower, upper, fee] = rows[i];
    if(!category) continue;

    if(!table[category]) table[category] = [];

    table[category].push({
      min: parseFloat(lower),
      max: parseFloat(upper),
      fee: parseFloat(fee)
    });
  }
  return table;
}
