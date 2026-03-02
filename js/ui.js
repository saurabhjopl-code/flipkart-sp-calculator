import { calculateSP } from "./engineRouter.js";

let masterData = {};
let allSKU = [];
let filteredData = [];
let visibleCount = 50;
let activeMP = "FLIPKART";

/* ================= INIT ================= */

export function initUI(data) {

  masterData = data;
  allSKU = data.skuData;

  setupTabs();
  setupSearchClear();
  populateCategoryFilter();
  applyFilters();

  document.getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document.getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

  document.getElementById("loadMoreBtn")
    .addEventListener("click", loadMore);

  document.getElementById("exportBtn")
    .addEventListener("click", exportFullData);
}

/* ================= URL BUILDER ================= */

function buildProductURL(row) {

  if (!row.fsn) return null;

  if (row.mp === "FLIPKART") {
    return "https://www.flipkart.com/product/p/itme?pid=" + row.fsn;
  }

  if (row.mp === "MYNTRA") {
    return "https://www.myntra.com/" + row.fsn;
  }

  return null;
}

/* ================= TABS ================= */

function setupTabs() {

  const fkBtn = document.getElementById("flipkartTab");
  const myBtn = document.getElementById("myntraTab");

  fkBtn.onclick = () => {
    activeMP = "FLIPKART";
    fkBtn.classList.add("active");
    myBtn.classList.remove("active");
    populateCategoryFilter();
    applyFilters();
  };

  myBtn.onclick = () => {
    activeMP = "MYNTRA";
    myBtn.classList.add("active");
    fkBtn.classList.remove("active");
    populateCategoryFilter();
    applyFilters();
  };
}

/* ================= SEARCH CLEAR ================= */

function setupSearchClear() {

  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");

  input.addEventListener("input", () => {
    clearBtn.style.display = input.value ? "block" : "none";
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    applyFilters();
  });
}

/* ================= CATEGORY ================= */

function populateCategoryFilter() {

  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [
    ...new Set(
      allSKU
        .filter(d => d.mp === activeMP)
        .map(d => d.cat)
    )
  ];

  categories.sort();

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/* ================= FILTER ================= */

function applyFilters() {

  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  filteredData = allSKU.filter(row =>
    row.mp === activeMP &&
    row.sku.toLowerCase().includes(search) &&
    (category === "all" || row.cat === category)
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

  filteredData.slice(0, visibleCount).forEach(row => {

    const result = calculateSP(row, masterData);

    const GSTonFees =
      0.18 * ((result.Commission || 0) +
              (result.Collection || 0) +
              (result.Fixed || 0));

    const productURL = buildProductURL(row);

    const linkIcon = productURL
      ? `<a href="${productURL}" target="_blank" title="Open on ${row.mp}" style="text-decoration:none;">🔗</a>`
      : "";

    const tr = document.createElement("tr");

    tr.innerHTML =
      "<td>" + row.sku + " " + linkIcon + "</td>" +
      "<td>" + row.cat + "</td>" +
      "<td>" + (row.brand || "-") + "</td>" +
      "<td>" + formatCurrency(row.simTP) + "</td>" +
      "<td>" + formatCurrency(result.SP) + "</td>" +
      "<td>" + formatCurrency(result.GTA) + "</td>" +
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
    activeMP +
    " | Total: " +
    filteredData.length +
    " | Showing: " +
    Math.min(visibleCount, filteredData.length);
}

/* ================= EXPORT ================= */

function exportFullData() {

  if (!filteredData.length) return;

  let csv = [];

  csv.push([
    "SKU",
    "Category",
    "Brand",
    "TP",
    "SP",
    "GTA",
    "Commission",
    "Collection",
    "Fixed Fee",
    "GST on Fees",
    "TDS",
    "TCS",
    "Bank Settlement",
    "Input GST Credit",
    "Income Tax Credit",
    "Effective Net",
    "Product URL"
  ].join(","));

  filteredData.forEach(row => {

    const result = calculateSP(row, masterData);

    const GSTonFees =
      0.18 * ((result.Commission || 0) +
              (result.Collection || 0) +
              (result.Fixed || 0));

    const productURL = buildProductURL(row) || "";

    csv.push([
      row.sku,
      row.cat,
      row.brand || "",
      row.simTP,
      result.SP,
      result.GTA,
      result.Commission,
      result.Collection,
      result.Fixed,
      GSTonFees,
      result.TDS,
      result.TCS,
      result.BankSettlement,
      result.InputGSTCredit,
      result.IncomeTaxCredit,
      result.EffectiveNet,
      productURL
    ].join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = activeMP + "_pricing_export.csv";
  a.click();
}
