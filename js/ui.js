import { calculateSP } from "./engineRouter.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;

export function initUI(data){
  allData = data;
  applyFilters();

  document.getElementById("searchInput")
    .addEventListener("input", handleSearch);

  document.getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

  document.getElementById("loadMoreBtn")
    .addEventListener("click", loadMore);
}

/* ================= FILTERING ================= */

function handleSearch(e){
  applyFilters();
}

function applyFilters(){

  const search =
    document.getElementById("searchInput")
      .value.toLowerCase();

  filteredData = allData.filter(row =>
    row.sku.toLowerCase().includes(search)
  );

  visibleCount = 50;
  renderTable();
  updateSummary();
}

/* ================= TABLE ================= */

function loadMore(){
  visibleCount += 50;
  renderTable();
}

function format₹(num){
  return "₹" + Number(num).toFixed(2);
}

function renderTable(){

  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  filteredData.slice(0, visibleCount).forEach(row => {

    const result =
      calculateSP(
        row.cat,
        row.simTP,
        row.mp,
        row.brand
      );

    const GSTonFees =
      result.CommissionGST +
      result.CollectionGST +
      result.FixedGST;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.sku}</td>
      <td>${row.cat}</td>
      <td>${format₹(row.simTP)}</td>
      <td>${format₹(result.SP)}</td>
      <td>${format₹(result.Commission)}</td>
      <td>${format₹(result.Collection)}</td>
      <td>${format₹(result.Fixed)}</td>
      <td>${format₹(GSTonFees)}</td>
      <td>${format₹(result.TDS)}</td>
      <td>${format₹(result.TCS)}</td>
      <td>${format₹(result.BankSettlement)}</td>
      <td>${format₹(result.InputGSTCredit)}</td>
      <td>${format₹(result.IncomeTaxCredit)}</td>
      <td><b>${format₹(result.EffectiveNet)}</b></td>
    `;

    body.appendChild(tr);
  });
}

/* ================= SUMMARY ================= */

function updateSummary(){
  document.getElementById("summaryBar").innerText =
    `Total: ${filteredData.length} | Showing: ${Math.min(visibleCount, filteredData.length)}`;
}
