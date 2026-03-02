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

// ---------------- FILTER ----------------

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

// ---------------- TABLE RENDER ----------------

function renderTable(){
let body = document.getElementById("tableBody");
body.innerHTML = "";

filteredData.slice(0, visibleCount).forEach((row,index)=>{

let result = calculateSP(row.cat, row.simTP);

let tr = document.createElement("tr");
tr.className = result.EffectiveNet >= row.simTP ? "safe" : "unsafe";

tr.innerHTML = `
<td><button class="expand-btn" data-index="${index}">▸</button></td>
<td>${row.sku}</td>
<td>${row.simTP}</td>
<td>${result.SP}</td>
<td>${result.EffectiveNet.toFixed(2)}</td>
`;

body.appendChild(tr);
});

attachExpandListeners();
}

// ---------------- EXPAND ----------------

function attachExpandListeners(){
document.querySelectorAll(".expand-btn").forEach(btn=>{
btn.addEventListener("click", toggleExpand);
});
}

function toggleExpand(e){

let btn = e.target;
let index = btn.getAttribute("data-index");
let rowData = filteredData[index];
let result = calculateSP(rowData.cat, rowData.simTP);

let tr = btn.closest("tr");

if(tr.nextSibling && tr.nextSibling.classList.contains("breakdown-row")){
tr.nextSibling.remove();
btn.innerText = "▸";
return;
}

btn.innerText = "▾";

let breakdownRow = document.createElement("tr");
breakdownRow.className = "breakdown-row";

breakdownRow.innerHTML = `
<td colspan="5">
<div class="breakdown-box">

<b>Order Item Value (SP)</b>: ₹${result.SP}<br>
Customer Logistics Fee (GTA): ₹${result.GTA}<br>
Sale Amount: ₹${result.SaleAmount.toFixed(2)}<br><br>

<b>Marketplace Fees</b><br>
Commission: ₹${result.Commission.toFixed(2)}<br>
Collection: ₹${result.Collection.toFixed(2)}<br>
Fixed Fee: ₹${result.Fixed.toFixed(2)}<br><br>

<b>GST (18% on Fees)</b><br>
Commission GST: ₹${result.CommissionGST.toFixed(2)}<br>
Collection GST: ₹${result.CollectionGST.toFixed(2)}<br>
Fixed GST: ₹${result.FixedGST.toFixed(2)}<br><br>

<b>TDS (1%)</b>: ₹${result.TDS.toFixed(2)}<br>
<b>TCS (1%)</b>: ₹${result.TCS.toFixed(2)}<br><br>

<hr>

<b>Bank Settlement</b>: ₹${result.BankSettlement.toFixed(2)}<br>
Input GST Credit (GST + TCS): ₹${result.InputGSTCredit.toFixed(2)}<br>
Income Tax Credit (TDS): ₹${result.IncomeTaxCredit.toFixed(2)}<br><br>

<b>Effective Net</b>: ₹${result.EffectiveNet.toFixed(2)}

</div>
</td>
`;

tr.parentNode.insertBefore(breakdownRow, tr.nextSibling);
}

// ---------------- EXPORT ----------------

function exportCSV(){
let csv="SKU,TP,SP,EffectiveNet\n";
filteredData.forEach(r=>{
let result = calculateSP(r.cat, r.simTP);
csv+=`${r.sku},${r.simTP},${result.SP},${result.EffectiveNet}\n`;
});
let blob=new Blob([csv],{type:"text/csv"});
let url=URL.createObjectURL(blob);
let a=document.createElement("a");
a.href=url;
a.download="pricing_export.csv";
a.click();
}
