const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-yEqk-MG6suolRPrWfm4ROxjepofRKJM93s9wgGuB_PPgqykpwWiOEOP_tT4ver5a-tCyFGw4q5Qf/pub?gid=923242779&single=true&output=csv";

let allData = [];
let filteredData = [];
let visibleCount = 50;

// ---------- CATEGORY NORMALIZER ----------
function normalizeCategory(cat){
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

// ---------- MASTER TABLES ----------
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

function calculateSP(category, TP){
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

return {SP,settlement};
}

// ---------- LOAD ----------
async function loadData(){
const res = await fetch(SHEET_URL);
const text = await res.text();
parseCSV(text);
}

function parseCSV(text){
allData=[];
let rows=text.split("\n").map(r=>r.split(","));
let categories=new Set();

for(let i=1;i<rows.length;i++){
let sku=rows[i][0]?.trim();
let cat=normalizeCategory(rows[i][1]);
let TP=parseFloat(rows[i][2]);
if(!sku||!cat||isNaN(TP)) continue;

let result=calculateSP(cat,TP);

allData.push({
sku,cat,
originalTP:TP,
simTP:TP,
originalSP:result.SP,
SP:result.SP,
settlement:result.settlement
});

categories.add(cat);
}

populateCategoryFilter(categories);
applyFilters();
}

function populateCategoryFilter(categories){
let select=document.getElementById("categoryFilter");
select.innerHTML='<option value="all">All Categories</option>';
categories.forEach(cat=>{
let opt=document.createElement("option");
opt.value=cat;
opt.innerText=cat;
select.appendChild(opt);
});
}

function applyFilters(){
let search=document.getElementById("searchInput").value.toLowerCase();
let category=document.getElementById("categoryFilter").value;

filteredData=allData.filter(row=>{
return row.sku.toLowerCase().includes(search) &&
(category==="all"||row.cat===category);
});

visibleCount=50;
renderTable();
}

function renderTable(){
let body=document.getElementById("tableBody");
body.innerHTML="";
let safeCount=0;
let totalSP=0;

filteredData.slice(0,visibleCount).forEach((row,index)=>{

if(row.settlement>=row.simTP) safeCount++;
totalSP+=row.SP;

let tr=document.createElement("tr");
tr.className=row.settlement>=row.simTP?"safe":"unsafe";

tr.innerHTML=`
<td>${row.sku}</td>
<td>${row.cat}</td>
<td>${row.originalTP}</td>
<td><input type="number" value="${row.simTP}" data-index="${index}" class="sim-input" style="width:80px"></td>
<td>${row.SP}</td>
<td>${row.settlement.toFixed(2)}</td>
<td>${row.SP-row.originalSP}</td>
`;

body.appendChild(tr);
});

document.getElementById("summaryBar").innerText=
`Total: ${filteredData.length} | Safe: ${safeCount} | Avg SP: ${filteredData.length?Math.round(totalSP/filteredData.length):0}`;
}

// SIMULATION WITHOUT RE-FILTER
document.addEventListener("input",function(e){
if(e.target.classList.contains("sim-input")){
let index=parseInt(e.target.getAttribute("data-index"));
let value=parseFloat(e.target.value);
if(isNaN(value)) return;

let row=filteredData[index];
row.simTP=value;
let result=calculateSP(row.cat,value);
row.SP=result.SP;
row.settlement=result.settlement;

renderTable();
}
});

document.getElementById("searchInput").addEventListener("input",applyFilters);
document.getElementById("categoryFilter").addEventListener("change",applyFilters);
document.getElementById("loadMoreBtn").addEventListener("click",()=>{
visibleCount+=50;
renderTable();
});

document.getElementById("exportBtn").addEventListener("click",()=>{
let csv="SKU,Category,Original TP,Sim TP,SP,Settlement\n";
filteredData.forEach(r=>{
csv+=`${r.sku},${r.cat},${r.originalTP},${r.simTP},${r.SP},${r.settlement}\n`;
});
let blob=new Blob([csv],{type:"text/csv"});
let url=URL.createObjectURL(blob);
let a=document.createElement("a");
a.href=url;
a.download="simulation_export.csv";
a.click();
});

loadData();
