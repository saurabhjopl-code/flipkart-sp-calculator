/* ==========================================
   MYNTRA ENGINE V2 – PRODUCTION VERSION
   Brand + Article + Level Driven
========================================== */

const GST_RATE = 0.18;
const TDS_RATE = 0.01;
const TCS_RATE = 0.01;

/* ================= LEVEL MAP ================= */

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

/* ================= GTA TABLE ================= */

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

/* ================= COMMISSION TABLE ================= */
/* Only unique rate transitions stored to reduce size */

const commissionTable = {

  "Monira": {
    "Sarees": [
      {min:0, max:800, rate:0.04},
      {min:800, max:1000, rate:0.07},
      {min:1000, max:99999999, rate:0.15}
    ]
  },

  "Rajnandini": {

    "Tunics": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.2275},
      {min:1000, max:2000, rate:0.2075},
      {min:2000, max:99999999, rate:0.1975}
    ],

    "Palazzos": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.2475},
      {min:1000, max:2000, rate:0.2275},
      {min:2000, max:99999999, rate:0.2075}
    ],

    "Co-Ords": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.15},
      {min:1000, max:2000, rate:0.21},
      {min:2000, max:99999999, rate:0.20}
    ],

    "Dresses": [
      {min:0, max:600, rate:0.02},
      {min:600, max:800, rate:0.04},
      {min:800, max:1000, rate:0.22},
      {min:1000, max:99999999, rate:0.19}
    ],

    "Kurtas": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.26},
      {min:1000, max:2000, rate:0.23},
      {min:2000, max:99999999, rate:0.22}
    ],

    "Sarees": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.27},
      {min:1000, max:99999999, rate:0.23}
    ]
  },

  "Roly Poly": {

    "Tunics": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.2275},
      {min:1000, max:2000, rate:0.2075},
      {min:2000, max:99999999, rate:0.1975}
    ],

    "Dresses": [
      {min:0, max:600, rate:0.02},
      {min:600, max:800, rate:0.04},
      {min:800, max:1000, rate:0.2375},
      {min:1000, max:99999999, rate:0.2075}
    ],

    "Kurta Sets": [
      {min:0, max:900, rate:0.02},
      {min:900, max:1000, rate:0.25},
      {min:1000, max:2000, rate:0.22},
      {min:2000, max:99999999, rate:0.20}
    ]
  },

  "KALINI": {

    "Dresses": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.08},
      {min:1000, max:2000, rate:0.16},
      {min:2000, max:99999999, rate:0.18}
    ],

    "Kurtas": [
      {min:0, max:800, rate:0.02},
      {min:800, max:1000, rate:0.08},
      {min:1000, max:2000, rate:0.12},
      {min:2000, max:99999999, rate:0.18}
    ],

    "Sarees": [
      {min:0, max:800, rate:0.02},
      {min:800, max:2000, rate:0.08},
      {min:2000, max:99999999, rate:0.18}
    ]
  }

};

/* ================= FIXED FEE TABLE ================= */
/* Only unique transitions stored */

const fixedFeeTable = {
  "Rajnandini": {
    "Kurtas": [
      {min:0, max:300, fee:15},
      {min:300, max:500, fee:17},
      {min:500, max:1000, fee:27},
      {min:1000, max:2000, fee:45},
      {min:2000, max:99999999, fee:61}
    ]
  },

  "Roly Poly": {
    "Kurtas": [
      {min:0, max:300, fee:15},
      {min:300, max:500, fee:17},
      {min:500, max:1000, fee:27},
      {min:1000, max:2000, fee:45},
      {min:2000, max:99999999, fee:61}
    ]
  },

  "KALINI": {
    "Kurtas": [
      {min:0, max:300, fee:0},
      {min:300, max:500, fee:8},
      {min:500, max:800, fee:20},
      {min:800, max:1000, fee:27},
      {min:1000, max:2000, fee:45},
      {min:2000, max:99999999, fee:61}
    ]
  }
};

/* ================= HELPER ================= */

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
  return getSlabValue(
    commissionTable[brand]?.[category],
    sellerPrice
  );
}

function getFixed(brand, category, sellerPrice){
  return getSlabValue(
    fixedFeeTable[brand]?.[category],
    sellerPrice
  );
}

function getGTA(category, SP){
  const level = levelMap[category];
  return getSlabValue(gtaTable[level], SP);
}

/* ================= MAIN ================= */

export function calculateMyntraSP(category, TP, brand){

  let SP = TP + 300;

  for(let i=0;i<20;i++){

    let gta = getGTA(category, SP);
    let sellerPrice = SP - gta;

    let commissionRate = getCommission(brand, category, sellerPrice);
    let commission = sellerPrice * commissionRate;
    let fixed = getFixed(brand, category, sellerPrice);

    let gstFees = (commission + fixed) * GST_RATE;

    let tds = sellerPrice * TDS_RATE;
    let tcs = sellerPrice * TCS_RATE;

    let bankSettlement =
      sellerPrice
      - commission
      - fixed
      - gstFees
      - tds
      - tcs;

    let effectiveNet =
      bankSettlement
      + gstFees
      + tcs
      + tds;

    if(Math.abs(effectiveNet - TP) < 1){
      break;
    }

    SP += (TP - effectiveNet);
  }

  /* FINAL COMPUTE */

  let gta = getGTA(category, SP);
  let sellerPrice = SP - gta;

  let commissionRate = getCommission(brand, category, sellerPrice);
  let commission = sellerPrice * commissionRate;
  let fixed = getFixed(brand, category, sellerPrice);

  let gstFees = (commission + fixed) * GST_RATE;
  let tds = sellerPrice * TDS_RATE;
  let tcs = sellerPrice * TCS_RATE;

  let bankSettlement =
    sellerPrice
    - commission
    - fixed
    - gstFees
    - tds
    - tcs;

  let effectiveNet =
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
