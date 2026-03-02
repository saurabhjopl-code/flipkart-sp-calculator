import { calculateSP } from "./engineRouter.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;

export function initUI(data) {
  allData = data;
  applyFilters();

  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document
    .getElementById("loadMoreBtn")
    .addEventListener("click", loadMore);
}

/* ================= FILTERING ================= */

function applyFilters() {
  const search = document
    .getElementById("searchInput")
    .value.toLowerCase();

  filteredData = allData.filter((row) =>
    row.sku.toLowerCase().includes(search)
  );

  visibleCount = 50;

  renderTable();
  updateSummary();
}

/* ================= TABLE ================= */

function loadMore() {
  visibleCount += 50;
  renderTable();
}

function formatCurrency(num) {
  return "₹" + Number(num || 0).toFixed(2);
}

function renderTable() {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  const rows = filteredData.slice(0, visibleCount);

  rows.forEach((row) => {
    const result = calculateSP(
      row.cat,
      row.simTP,
      row.mp,
      row.brand
    );

    const GSTonFees =
      (result.CommissionGST || 0) +
      (result.CollectionGST || 0) +
      (result.FixedGST || 0);

    const tr = document.createElement("tr");

    tr.innerHTML =
      "<td>" + row.sku + "</td>" +
      "<td>" + row.cat + "</td>" +
      "<td>" + formatCurrency(row.simTP) + "</td>" +
      "<td>" + formatCurrency(result.SP) + "</td>" +
      "<td>" + formatCurrency(result.Commission) + "</td>" +
      "<td>" + formatCurrency(result.Collection) + "</td>" +
      "<td>" + formatCurrency(result.Fixed) + "</td>" +
      "<td>" + formatCurrency(GSTonFees) + "</td>" +
      "<td>" + formatCurrency(result.TDS) + "</td>" +
      "<td>" + formatCurrency(result.TCS) + "</td>" +
      "<td>" + formatCurrency(result.BankSettlement) + "</td>" +
      "<td>" + formatCurrency(result.InputGSTCredit) + "</td>" +
      "<td>" + formatCurrency(result.IncomeTaxCredit) + "</td>" +
      "<td><b>" + formatCurrency(result.EffectiveNet) + "</b></td>";

    body.appendChild(tr);
  });
}

/* ================= SUMMARY ================= */

function updateSummary() {
  document.getElementById("summaryBar").innerText =
    "Total: " +
    filteredData.length +
    " | Showing: " +
    Math.min(visibleCount, filteredData.length);
}
