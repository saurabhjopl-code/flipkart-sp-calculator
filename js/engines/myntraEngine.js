let commissionTable;
let fixedTable;
let gtaTable;
let levelMap;

const GST_RATE = 0.18;
const TDS_RATE = 0.01;
const TCS_RATE = 0.01;

export function initMyntraTables(data){
  commissionTable = data.commissionData;
  fixedTable = data.fixedData;
  gtaTable = data.gtaData;
  levelMap = data.levelMap;
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

export function calculateMyntraSP(category, TP, brand){

  let SP = TP + 300;

  for(let i=0;i<20;i++){

    const level = levelMap[category];
    const gta = getSlab(gtaTable[level], SP);

    const sellerPrice = SP - gta;

    const commissionRate =
      getSlab(commissionTable[brand]?.[category], sellerPrice);

    const commission = sellerPrice * commissionRate;

    const fixed =
      getSlab(fixedTable[brand]?.[category], sellerPrice);

    const gstFees = (commission + fixed) * GST_RATE;

    const tds = sellerPrice * TDS_RATE;
    const tcs = sellerPrice * TCS_RATE;

    const bankSettlement =
      sellerPrice
      - commission
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

  /* Final recompute */

  const level = levelMap[category];
  const gta = getSlab(gtaTable[level], SP);
  const sellerPrice = SP - gta;

  const commissionRate =
    getSlab(commissionTable[brand]?.[category], sellerPrice);

  const commission = sellerPrice * commissionRate;

  const fixed =
    getSlab(fixedTable[brand]?.[category], sellerPrice);

  const gstFees = (commission + fixed) * GST_RATE;

  const tds = sellerPrice * TDS_RATE;
  const tcs = sellerPrice * TCS_RATE;

  const bankSettlement =
    sellerPrice
    - commission
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
    Collection: 0,
    Fixed: fixed,
    CommissionGST: commission * GST_RATE,
    CollectionGST: 0,
    FixedGST: fixed * GST_RATE,
    TDS: tds,
    TCS: tcs,
    BankSettlement: bankSettlement,
    InputGSTCredit: gstFees + tcs,
    IncomeTaxCredit: tds,
    EffectiveNet: effectiveNet
  };
}
