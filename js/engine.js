export function normalizeCategory(cat){
if(!cat) return null;
cat = cat.toLowerCase().trim();
if(cat==="dress") return "Dress";
if(cat==="ethnic_set") return "Ethnic Sets";
if(cat==="salwar_kurta_dupatta") return "Salwar Kurta Dupatta";
if(cat==="kurta") return "Kurta";
if(cat==="tops" || cat==="top") return "Tops";
if(cat==="fabric") return "Fabric";
if(cat==="sari") return "Sari";
return null;
}

const commissionTable = {
"Ethnic Sets":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}],
"Kurta":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.09}],
"Dress":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.18}],
"Tops":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.17}],
"Salwar Kurta Dupatta":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}],
"Fabric":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.09}],
"Sari":[{min:0,max:1000,fee:0},{min:1001,max:999999,fee:0.14}]
};

const collectionTable = [
{min:0,max:1199,fee:0},
{min:1200,max:2000,fee:0.005},
{min:2001,max:4000,fee:0.004},
{min:4001,max:8000,fee:0.003}
];

const gtaTable = {
"Dress":[{min:0,max:300,fee:84},{min:300,max:500,fee:86},{min:500,max:1000,fee:122},{min:1000,max:999999,fee:168}],
"Ethnic Sets":[{min:0,max:300,fee:74},{min:300,max:500,fee:79},{min:500,max:1000,fee:123},{min:1000,max:999999,fee:146}],
"Salwar Kurta Dupatta":[{min:0,max:300,fee:75},{min:300,max:500,fee:77},{min:500,max:1000,fee:119},{min:1000,max:999999,fee:139}],
"Kurta":[{min:0,max:300,fee:70},{min:300,max:500,fee:77},{min:500,max:1000,fee:136},{min:1000,max:999999,fee:219}],
"Tops":[{min:0,max:300,fee:73},{min:300,max:500,fee:88},{min:500,max:1000,fee:130},{min:1000,max:999999,fee:186}],
"Fabric":[{min:0,max:300,fee:75},{min:300,max:500,fee:78},{min:500,max:1000,fee:157},{min:1000,max:999999,fee:232}],
"Sari":[{min:0,max:300,fee:68},{min:300,max:500,fee:80},{min:500,max:1000,fee:157},{min:1000,max:999999,fee:254}]
};

function getSlabValue(table, category, value){
if(!table[category]) return 0;
for(let slab of table[category]){
if(value>=slab.min && value<=slab.max) return slab.fee;
}
return 0;
}

function getCollection(value){
for(let slab of collectionTable){
if(value>=slab.min && value<=slab.max) return slab.fee;
}
return 0;
}

export function calculateSP(category, TP){
if(!category || !TP || TP<=0) return {SP:0, settlement:0};

let SP = TP + 300;

for(let i=0;i<20;i++){
let gta = getSlabValue(gtaTable, category, SP);
let sellerPrice = SP - gta;
let commission = getSlabValue(commissionTable, category, sellerPrice);
let collection = getCollection(sellerPrice);
let denominator = (1 - commission - collection);
if(denominator<=0) break;
let newSellerPrice = (TP + 5) / denominator;
let newSP = Math.ceil(newSellerPrice + gta);
if(Math.abs(newSP - SP) < 1) break;
SP = newSP;
}

let gta = getSlabValue(gtaTable, category, SP);
let sellerPrice = SP - gta;
let commission = getSlabValue(commissionTable, category, sellerPrice);
let collection = getCollection(sellerPrice);
let settlement = sellerPrice*(1-commission-collection)-5;

return {SP, settlement};
}
