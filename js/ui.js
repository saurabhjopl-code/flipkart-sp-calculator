import { calculateSP } from "./engine.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;

export function initUI(data){
allData = data;
populateCategoryFilter();
applyFilters();

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("categoryFilter").addEventListener("change", applyFilters);

document.getElementById("loadMoreBtn").addEventListener("click", ()=>{
visibleCount += 50;
renderTable();
});

document.getElementById("exportBtn").addEventListener("click", exportCSV);
}

function populateCategoryFilter(){
let select = document.getElementById("categoryFilter");
let categories = [...new Set(allData.map(d => d.cat))];
categories.forEach(cat=>{
let opt = document.createElement("option");
opt.value = cat;
opt.innerText = cat;
select.appendChild(opt);
});
}

function applyFilters(){
let search = document.getElementById("searchInput").value.toLowerCase();
let category = document.getElementById("categoryFilter").value;

filteredData = allData.filter(row=>{
return row.sku.toLowerCase().includes(search) &&
(category==="all" || row.cat===category);
});

visibleCount = 50;
renderTable();
}

function renderTable(){
let body = document.getElementById("tableBody");
body.innerHTML = "";

let safe = 0;
let totalSP = 0;

filteredData.slice(0, visibleCount).forEach(row=>{

let result = calculateSP(row.cat, row.simTP);

if(result.EffectiveNet >= row.simTP) safe++;
totalSP += result.SP;

let GSTonFees =
result.CommissionGST +
result.CollectionGST +
result.FixedGST;

let tr = document.createElement("tr");
tr.className = result.EffectiveNet >= row.simTP ? "safe" : "unsafe";

tr.innerHTML = `
<td>${row.sku}</td>
<td>${row.cat}</td>
<td>${row.simTP}</td>
<td>${result.SP.toFixed(2)}</td>
<td>${result.Commission.toFixed(2)}</td>
<td>${result.Collection.toFixed(2)}</td>
<td>${result.Fixed.toFixed(2)}</td>
<td>${GSTonFees.toFixed(2)}</td>
<td>${result.TDS.toFixed(2)}</td>
<td>${result.TCS.toFixed(2)}</td>
<td>${result.BankSettlement.toFixed(2)}</td>
<td>${result.InputGSTCredit.toFixed(2)}</td>
<td>${result.IncomeTaxCredit.toFixed(2)}</td>
<td><b>${result.EffectiveNet.toFixed(2)}</b></td>
`;

body.appendChild(tr);
});

document.getElementById("summaryBar").innerText =
`Total: ${filteredData.length} | Safe: ${safe} | Avg SP: ${filteredData.length?Math.round(totalSP/filteredData.length):0}`;
}

function exportCSV(){
let csv="SKU,Category,TP,SP,Commission,Collection,Fixed,GST on Fees,TDS,TCS,Bank Settlement,Input GST Credit,Income Tax Credit,Effective Net\n";

filteredData.forEach(r=>{
let result = calculateSP(r.cat, r.simTP);

let GSTonFees =
result.CommissionGST +
result.CollectionGST +
result.FixedGST;

csv+=`${r.sku},${r.cat},${r.simTP},${result.SP},${result.Commission},${result.Collection},${result.Fixed},${GSTonFees},${result.TDS},${result.TCS},${result.BankSettlement},${result.InputGSTCredit},${result.IncomeTaxCredit},${result.EffectiveNet}\n`;
});

let blob=new Blob([csv],{type:"text/csv"});
let url=URL.createObjectURL(blob);
let a=document.createElement("a");
a.href=url;
a.download="pricing_export.csv";
a.click();
}
