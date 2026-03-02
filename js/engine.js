// ---------------- MASTER TABLES ----------------

const commissionTable = {
"ethnic_set":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}],
"kurta":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.09}],
"dress":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.18}],
"top":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.17}],
"salwar_kurta_dupatta":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}],
"fabric":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.09}],
"sari":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}],
"apparel_set":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.21}],
"gown":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.09}],
"shopsy_ethnic_set":[{min:0,max:999999,fee:0}],
"shopsy_fabric":[{min:0,max:999999,fee:0}],
"shopsy_kurta":[{min:0,max:999999,fee:0}],
"shopsy_salwar_kurta_dupatta":[{min:0,max:999999,fee:0}]
};

const fixedFeeTable = {
"ethnic_set":5,"kurta":5,"dress":5,"top":5,
"salwar_kurta_dupatta":5,"fabric":5,"sari":5,
"apparel_set":5,"gown":5,
"shopsy_ethnic_set":0,"shopsy_fabric":0,
"shopsy_kurta":0,"shopsy_salwar_kurta_dupatta":0
};

const collectionTable = {
"default":[
{min:0,max:1199,fee:0},
{min:1200,max:2000,fee:0.005},
{min:2001,max:4000,fee:0.004},
{min:4001,max:8000,fee:0.003}
],
"shopsy":[{min:0,max:8000,fee:0}]
};

const gtaTable = {
"fabric":[{min:0,max:300,fee:75},{min:300,max:500,fee:78},{min:500,max:1000,fee:157},{min:1000,max:999999,fee:232}],
"kurta":[{min:0,max:300,fee:70},{min:300,max:500,fee:77},{min:500,max:1000,fee:136},{min:1000,max:999999,fee:219}],
"ethnic_set":[{min:0,max:300,fee:74},{min:300,max:500,fee:79},{min:500,max:1000,fee:123},{min:1000,max:999999,fee:146}],
"sari":[{min:0,max:300,fee:68},{min:300,max:500,fee:80},{min:500,max:1000,fee:157},{min:1000,max:999999,fee:254}],
"top":[{min:0,max:300,fee:73},{min:300,max:500,fee:88},{min:500,max:1000,fee:130},{min:1000,max:999999,fee:186}],
"gown":[{min:0,max:300,fee:73},{min:300,max:500,fee:86},{min:500,max:1000,fee:171},{min:1000,max:999999,fee:343}],
"salwar_kurta_dupatta":[{min:0,max:300,fee:75},{min:300,max:500,fee:77},{min:500,max:1000,fee:119},{min:1000,max:999999,fee:139}],
"dress":[{min:0,max:300,fee:84},{min:300,max:500,fee:86},{min:500,max:1000,fee:122},{min:1000,max:999999,fee:168}],
"apparel_set":[{min:0,max:300,fee:46},{min:300,max:500,fee:48},{min:500,max:1000,fee:85},{min:1000,max:999999,fee:114}],
"shopsy_ethnic_set":[{min:0,max:300,fee:64},{min:300,max:500,fee:90},{min:500,max:1000,fee:96},{min:1000,max:999999,fee:96}],
"shopsy_fabric":[{min:0,max:300,fee:74},{min:300,max:500,fee:93},{min:500,max:1000,fee:98},{min:1000,max:999999,fee:98}],
"shopsy_kurta":[{min:0,max:300,fee:91},{min:300,max:500,fee:90},{min:500,max:1000,fee:97},{min:1000,max:999999,fee:97}],
"shopsy_salwar_kurta_dupatta":[{min:0,max:300,fee:62},{min:300,max:500,fee:91},{min:500,max:1000,fee:96},{min:1000,max:999999,fee:96}]
};

// Helper
function getSlab(table,value){
for(let slab of table){
if(value>=slab.min && value<=slab.max) return slab.fee;
}
return 0;
}

function getProductGST(tp){
return tp <= 2500 ? 0.05 : 0.18;
}

// ---------------- CORE ENGINE ----------------

export function calculateSP(category, TP){

if(!commissionTable[category]) {
console.warn("Unknown category:", category);
return null;
}

let SellerPrice = TP + 200;

for(let i=0;i<20;i++){
let commissionRate = getSlab(commissionTable[category], SellerPrice);
let collectionRate =
category.startsWith("shopsy")
? getSlab(collectionTable.shopsy,SellerPrice)
: getSlab(collectionTable.default,SellerPrice);

let denominator = (1 - commissionRate - collectionRate);
if(denominator<=0) break;

let newSellerPrice = (TP + fixedFeeTable[category]) / denominator;

if(Math.abs(newSellerPrice - SellerPrice)<0.5) break;
SellerPrice=newSellerPrice;
}

let commissionRate = getSlab(commissionTable[category], SellerPrice);
let collectionRate =
category.startsWith("shopsy")
? getSlab(collectionTable.shopsy,SellerPrice)
: getSlab(collectionTable.default,SellerPrice);

let Commission = SellerPrice * commissionRate;
let Collection = SellerPrice * collectionRate;
let Fixed = fixedFeeTable[category];

let CommissionGST = Commission*0.18;
let CollectionGST = Collection*0.18;
let FixedGST = Fixed*0.18;

let TDS = SellerPrice*0.01;
let TCS = SellerPrice*0.01;

let GTA = getSlab(gtaTable[category], SellerPrice);
let BasePrice = SellerPrice + GTA;

let productGSTRate = getProductGST(TP);
let SP = BasePrice*(1+productGSTRate);
let ProductGST = SP - BasePrice;

let BankSettlement =
SellerPrice
- Commission
- Collection
- Fixed
- CommissionGST
- CollectionGST
- FixedGST
- TDS
- TCS;

let InputGSTCredit =
CommissionGST+CollectionGST+FixedGST+TCS;

let IncomeTaxCredit=TDS;

let EffectiveNet =
BankSettlement+InputGSTCredit+IncomeTaxCredit;

return {
SP,
Commission,
Collection,
Fixed,
CommissionGST,
CollectionGST,
FixedGST,
TDS,
TCS,
BankSettlement,
InputGSTCredit,
IncomeTaxCredit,
EffectiveNet
};
}
