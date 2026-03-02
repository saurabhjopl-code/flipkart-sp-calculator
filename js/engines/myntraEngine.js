/* ===============================
   MYNTRA ENGINE V2
   =============================== */

const GST_RATE = 0.18;
const TDS_RATE = 0.01;
const TCS_RATE = 0.01;

/* ---------------- LEVEL MAP ---------------- */

const levelMap = {
  "Co-Ords": "Level 1",
  "Dresses": "Level 2",
  "Kurtas": "Level 1",
  "Palazzos": "Level 1",
  "Tops": "Level 1",
  "Tunics": "Level 1",
  "Kurta Sets": "Level 2",
  "Sarees": "Level 2",
  "Dress Material": "Level 3"
};

/* ---------------- GTA TABLE ---------------- */

const gtaTable = {
  "Level 1": [
    {min:0, max:100, fee:0},
    {min:100, max:500, fee:59},
    {min:500, max:1000, fee:94},
    {min:1000, max:2000, fee:171},
    {min:2000, max:99999999, fee:207}
  ],
  "Level 2": [
    {min:0, max:100, fee:0},
    {min:100, max:500, fee:83},
    {min:500, max:1000, fee:118},
    {min:1000, max:2000, fee:195},
    {min:2000, max:99999999, fee:230}
  ],
  "Level 3": [
    {min:0, max:100, fee:0},
    {min:100, max:300, fee:100},
    {min:300, max:500, fee:106},
    {min:500, max:1000, fee:148},
    {min:1000, max:2000, fee:230},
    {min:2000, max:99999999, fee:266}
  ]
};

/* ---------------- COMMISSION TABLE ---------------- */
/* Format: Brand → Article → slabs */

const commissionTable = {}; 
/* ⚠️ For production:
   We will inject your full commission data here.
   For now it will resolve dynamically fallback to 0
*/

/* ---------------- FIXED FEE TABLE ---------------- */

const fixedFeeTable = {};
/* Same as above — we will inject full slabs next step */

/* ---------------- SLAB RESOLVERS ---------------- */

function getSlabValue(table, value){
  if(!table) return 0;
  for(let slab of table){
    if(value >= slab.min && value <= slab.max){
      return slab.fee ?? slab.rate ?? 0;
    }
  }
  return 0;
}

function getCommission(brand, category, sellerPrice){
  const brandData = commissionTable[brand];
  if(!brandData) return 0;

  const catData = brandData[category];
  if(!catData) return 0;

  return getSlabValue(catData, sellerPrice);
}

function getFixedFee(brand, category, sellerPrice){
  const brandData = fixedFeeTable[brand];
  if(!brandData) return 0;

  const catData = brandData[category];
  if(!catData) return 0;

  return getSlabValue(catData, sellerPrice);
}

function getGTA(category, SP){
  const level = levelMap[category];
  if(!level) return 0;

  const slabs = gtaTable[level];
  return getSlabValue(slabs, SP);
}

/* ===============================
   MAIN CALCULATION
   =============================== */

export function calculateMyntraSP(category, TP, brand){

  let SP = TP + 300;

  for(let i=0;i<20;i++){

    let gta = getGTA(category, SP);

    let sellerPrice = SP - gta;

    let commissionRate = getCommission(brand, category, sellerPrice);
    let commission = sellerPrice * commissionRate;

    let fixedFee = getFixedFee(brand, category, sellerPrice);

    let gstOnFees = (commission + fixedFee) * GST_RATE;

    let tds = sellerPrice * TDS_RATE;
    let tcs = sellerPrice * TCS_RATE;

    let bankSettlement =
      sellerPrice
      - commission
      - fixedFee
      - gstOnFees
      - tds
      - tcs;

    let inputGSTCredit = gstOnFees + tcs;
    let incomeTaxCredit = tds;

    let effectiveNet =
      bankSettlement
      + inputGSTCredit
      + incomeTaxCredit;

    if(Math.abs(effectiveNet - TP) < 1){
      break;
    }

    let adjustment = TP - effectiveNet;
    SP += adjustment;
  }

  /* FINAL COMPUTE */

  let gta = getGTA(category, SP);
  let sellerPrice = SP - gta;

  let commissionRate = getCommission(brand, category, sellerPrice);
  let commission = sellerPrice * commissionRate;
  let fixedFee = getFixedFee(brand, category, sellerPrice);
  let gstOnFees = (commission + fixedFee) * GST_RATE;

  let tds = sellerPrice * TDS_RATE;
  let tcs = sellerPrice * TCS_RATE;

  let bankSettlement =
    sellerPrice
    - commission
    - fixedFee
    - gstOnFees
    - tds
    - tcs;

  let inputGSTCredit = gstOnFees + tcs;
  let incomeTaxCredit = tds;

  let effectiveNet =
    bankSettlement
    + inputGSTCredit
    + incomeTaxCredit;

  return {
    SP,
    Commission: commission,
    Collection: 0,
    Fixed: fixedFee,
    CommissionGST: commission * GST_RATE,
    CollectionGST: 0,
    FixedGST: fixedFee * GST_RATE,
    TDS: tds,
    TCS: tcs,
    BankSettlement: bankSettlement,
    InputGSTCredit: inputGSTCredit,
    IncomeTaxCredit: incomeTaxCredit,
    EffectiveNet: effectiveNet
  };
}
