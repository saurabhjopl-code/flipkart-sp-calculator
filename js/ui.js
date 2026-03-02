import { calculateSP } from "./engines/engineRouter.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;
let activeMarketplace = "FLIPKART";

function formatCurrency(value){
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function initUI(data){
  allData = data;

  document.getElementById("tabFlipkart").addEventListener("click", ()=>{
    activeMarketplace = "FLIPKART";
    setActiveTab();
    applyFilters();
  });

  document.getElementById("tabMyntra").addEventListener("click", ()=>{
    activeMarketplace = "MYNTRA";
    setActiveTab();
    applyFilters();
  });

  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("loadMoreBtn").addEventListener("click", loadMore);
  document.getElementById("exportBtn").addEventListener("click", exportFullData);

  setActiveTab();
  applyFilters();
}

function setActiveTab(){
  document.getElementById("tabFlipkart").classList.toggle("active", activeMarketplace==="FLIPKART");
  document.getElementById("tabMyntra").classList.toggle("active", activeMarketplace==="MYNTRA");
}

function applyFilters(){

  let search = document.getElementById("searchInput").value.toLowerCase();
  let category = document.getElementById("categoryFilter").value;

  filteredData = allData.filter(row=>{
    return row.mp === activeMarketplace &&
      row.sku.toLowerCase().includes(search) &&
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

    let result = calculateSP(row.cat, row.simTP, row.mp);

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.sku}</td>
      <td>${row.cat}</td>
      <td>${formatCurrency(row.simTP)}</td>
      <td>${formatCurrency(result.SP)}</td>
      <td>${formatCurrency(result.EffectiveNet)}</td>
    `;

    body.appendChild(tr);
  });
}

function updateSummary(){
  let total = filteredData.length;
  let showing = Math.min(visibleCount, total);

  document.getElementById("summaryBar").innerText =
    `${activeMarketplace} | Total: ${total} | Showing: ${showing}`;
}

function exportFullData(){

  let csv = [];
  csv.push(["SKU","Category","TP","SP","Effective Net"].join(","));

  filteredData.forEach(row=>{
    let result = calculateSP(row.cat, row.simTP, row.mp);

    csv.push([
      row.sku,
      row.cat,
      row.simTP,
      result.SP.toFixed(2),
      result.EffectiveNet.toFixed(2)
    ].join(","));
  });

  let blob = new Blob([csv.join("\n")], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = `${activeMarketplace.toLowerCase()}_pricing_export.csv`;
  a.click();
}
