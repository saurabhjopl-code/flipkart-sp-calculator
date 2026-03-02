import { calculateSP } from "./engine.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;

export function initUI(data){
allData = data;
populateCategoryFilter();
applyFilters();

document.getElementById("searchInput").addEventListener("input", handleSearch);
document.getElementById("categoryFilter").addEventListener("change", applyFilters);
document.getElementById("loadMoreBtn").addEventListener("click", loadMore);
document.getElementById("exportBtn").addEventListener("click", exportFullData);
document.getElementById("clearSearch").addEventListener("click", clearSearch);
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

function handleSearch(e){
let clearBtn = document.getElementById("clearSearch");
clearBtn.style.display = e.target.value ? "block" : "none";
applyFilters();
}

function clearSearch(){
document.getElementById("searchInput").value = "";
document.getElementById("clearSearch").style.display = "none";
applyFilters();
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
updateSummary();
}

function loadMore(){
visibleCount += 50;
renderTable();
updateSummary();
}

function renderTable(){
let body = document.getElementById("tableBody");
body.innerHTML = "";

filteredData.slice(0, visibleCount).forEach(row=>{
let result = calculateSP(row.cat, row.simTP);

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
}

function updateSummary(){
let total = filteredData.length;
let showing = Math.min(visibleCount, total);

document.getElementById("summaryBar").innerText =
`Total: ${total} | Showing: ${showing}`;
}

/* ---------------- EXPORT FULL FILTERED DATA ---------------- */

function exportFullData(){

let csv = [];

csv.push([
"SKU",
"Category",
"TP",
"SP",
"Commission",
"Collection",
"Fixed Fee",
"GST on Fees",
"TDS",
"TCS",
"Bank Settlement",
"Input GST Credit (GST + TCS)",
"Income Tax Credit (TDS)",
"Effective Net"
].join(","));

filteredData.forEach(row=>{
let result = calculateSP(row.cat, row.simTP);

let GSTonFees =
result.CommissionGST +
result.CollectionGST +
result.FixedGST;

csv.push([
row.sku,
row.cat,
row.simTP,
result.SP.toFixed(2),
result.Commission.toFixed(2),
result.Collection.toFixed(2),
result.Fixed.toFixed(2),
GSTonFees.toFixed(2),
result.TDS.toFixed(2),
result.TCS.toFixed(2),
result.BankSettlement.toFixed(2),
result.InputGSTCredit.toFixed(2),
result.IncomeTaxCredit.toFixed(2),
result.EffectiveNet.toFixed(2)
].join(","));

});

let blob = new Blob([csv.join("\n")], { type: "text/csv" });
let url = URL.createObjectURL(blob);
let a = document.createElement("a");
a.href = url;
a.download = "flipkart_pricing_full_export.csv";
a.click();
}
