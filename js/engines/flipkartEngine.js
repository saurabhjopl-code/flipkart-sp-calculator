/* ==========================================
   FLIPKART / SHOPSY ENGINE – DYNAMIC
========================================== */

let commissionTable;
let fixedTable;
let collectionTable;
let gtaTable;

const GST_RATE = 0.18;
const TDS_RATE = 0.01;
const TCS_RATE = 0.01;

export function initFlipkartTables(data){
  commissionTable = data.fkCommission;
  fixedTable = data.fkFixed;
  collectionTable = data.fkCollection;
  gtaTable = data.fkGTA;
}

function getSlab(slabs, value){
  if(!slabs) return 0;
  for(let s of slabs){
    if(value >= s.min && value <= s.max){
      return s.fee ?? s.rate ?? 0;
    }
  }
  return 0;
}

export function calculateSP(category, TP){

  let SP = TP + 300;

  for(let i=0;i<20;i++){

    const gta = getSlab(gtaTable[category], SP);

    const sellerPrice = SP - gta;

    const commissionRate =
      getSlab(commissionTable[category], sellerPrice);

    const collectionRate =
      getSlab(collectionTable[category], sellerPrice);

    const commission = sellerPrice * commissionRate;
    const collection = sellerPrice * collectionRate;
    const fixed =
      getSlab(fixedTable[category], sellerPrice);

    const gstFees =
      (commission + collection + fixed) * GST_RATE;

    const tds = sellerPrice * TDS_RATE;
    const tcs = sellerPrice * TCS_RATE;

    const bankSettlement =
      sellerPrice
      - commission
      - collection
      - fixed
      - gstFees
      - tds
      - tcs;

    const effectiveNet =
      bankSettlement
      + gstFees
      + tcs
      + tds;

    if(Math.abs(effectiveNet - TP) < 1) break;

    SP += (TP - effectiveNet);
  }

  /* Final compute */

  const gta = getSlab(gtaTable[category], SP);
  const sellerPrice = SP - gta;

  const commissionRate =
    getSlab(commissionTable[category], sellerPrice);

  const collectionRate =
    getSlab(collectionTable[category], sellerPrice);

  const commission = sellerPrice * commissionRate;
  const collection = sellerPrice * collectionRate;
  const fixed =
    getSlab(fixedTable[category], sellerPrice);

  const gstFees =
    (commission + collection + fixed) * GST_RATE;

  const tds = sellerPrice * TDS_RATE;
  const tcs = sellerPrice * TCS_RATE;

  const bankSettlement =
    sellerPrice
    - commission
    - collection
    - fixed
    - gstFees
    - tds
    - tcs;

  const effectiveNet =
    bankSettlement
    + gstFees
    + tcs
    + tds;

  return {
    SP,
    Commission: commission,
    Collection: collection,
    Fixed: fixed,
    CommissionGST: commission * GST_RATE,
    CollectionGST: collection * GST_RATE,
    FixedGST: fixed * GST_RATE,
    TDS: tds,
    TCS: tcs,
    BankSettlement: bankSettlement,
    InputGSTCredit: gstFees + tcs,
    IncomeTaxCredit: tds,
    EffectiveNet: effectiveNet
  };
}
