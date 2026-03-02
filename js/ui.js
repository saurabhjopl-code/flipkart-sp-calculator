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

filteredData.slice(0, visibleCount).forEach((row,index)=>{

if(row.settlement >= row.simTP) safe++;
totalSP += row.SP;

let tr = document.createElement("tr");
tr.className = row.settlement >= row.simTP ? "safe" : "unsafe";

tr.innerHTML = `
<td>${row.sku}</td>
<td>${row.cat}</td>
<td>${row.originalTP}</td>
<td><input type="number" value="${row.simTP}" data-index="${index}" class="sim-input" style="width:80px"></td>
<td class="sp-cell">${row.SP}</td>
<td class="settlement-cell">${row.settlement.toFixed(2)}</td>
<td class="delta-cell">${row.SP-row.originalSP}</td>
`;

body.appendChild(tr);
});

updateSummary();
attachSimulationListeners();
}

function attachSimulationListeners(){
document.querySelectorAll(".sim-input").forEach(input=>{
input.addEventListener("input", handleSimulation);
});
}

function handleSimulation(e){

let input = e.target;
let index = parseInt(input.getAttribute("data-index"));
let value = parseFloat(input.value);

if(isNaN(value)) return;

let row = filteredData[index];
row.simTP = value;

let result = calculateSP(row.cat, value);
row.SP = result.SP;
row.settlement = result.settlement;

// Update only this row visually
let tr = input.closest("tr");

tr.className = row.settlement >= row.simTP ? "safe" : "unsafe";
tr.querySelector(".sp-cell").innerText = row.SP;
tr.querySelector(".settlement-cell").innerText = row.settlement.toFixed(2);
tr.querySelector(".delta-cell").innerText = row.SP - row.originalSP;

updateSummary();
}

function updateSummary(){
let safe = filteredData.filter(r=>r.settlement>=r.simTP).length;
let totalSP = filteredData.reduce((sum,r)=>sum+r.SP,0);

document.getElementById("summaryBar").innerText =
`Total: ${filteredData.length} | Safe: ${safe} | Avg SP: ${filteredData.length?Math.round(totalSP/filteredData.length):0}`;
}

function exportCSV(){
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
}
