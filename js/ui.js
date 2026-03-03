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

/* ================= POLISHED CALCULATOR ================= */

function setupCalculator() {

  const calcTab = document.getElementById("calculatorTab");
  const calcSection = document.getElementById("calculatorSection");
  const tableContainer = document.querySelector(".table-container");

  const fkBtn = document.getElementById("calcFKBtn");
  const myBtn = document.getElementById("calcMYBtn");

  const categorySelect = document.getElementById("calcCategory");
  const brandSelect = document.getElementById("calcBrand");
  const tpInput = document.getElementById("calcTP");
  const resultDiv = document.getElementById("calcResult");
  const resultCard = document.getElementById("calcResultCard");

  let calcMP = "FLIPKART";

  /* TAB CLICK */
  calcTab.onclick = () => {
    calcSection.style.display = "block";
    tableContainer.style.display = "none";
    calcTab.classList.add("active");
    document.getElementById("flipkartTab").classList.remove("active");
    document.getElementById("myntraTab").classList.remove("active");
  };

  /* TOGGLE MP */
  fkBtn.onclick = () => {
    calcMP = "FLIPKART";
    fkBtn.classList.add("active");
    myBtn.classList.remove("active");
    brandSelect.style.display = "none";
    populateCategories();
  };

  myBtn.onclick = () => {
    calcMP = "MYNTRA";
    myBtn.classList.add("active");
    fkBtn.classList.remove("active");
    brandSelect.style.display = "block";
    populateCategories();
  };

  function populateCategories() {

    const categories = [
      ...new Set(
        allSKU
          .filter(d => d.mp === calcMP)
          .map(d => d.cat)
      )
    ];

    categorySelect.innerHTML = "";

    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });

    populateBrands();
  }

  function populateBrands() {

    if (calcMP !== "MYNTRA") return;

    const brands = [
      ...new Set(
        allSKU
          .filter(d => d.mp === "MYNTRA" && d.cat === categorySelect.value)
          .map(d => d.brand)
      )
    ];

    brandSelect.innerHTML = "";

    brands.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      brandSelect.appendChild(opt);
    });
  }

  categorySelect.onchange = populateBrands;

  document.getElementById("calcBtn").onclick = () => {

    const TP = parseFloat(tpInput.value);
    if (!TP) return;

    const tempRow = {
      cat: categorySelect.value,
      simTP: TP,
      mp: calcMP,
      brand: brandSelect.value
    };

    const result = calculateSP(tempRow, masterData);

    resultCard.style.display = "block";

    resultDiv.innerHTML = `
      <div><b>SP:</b> ₹${result.SP.toFixed(2)}</div>
      <div><b>GTA:</b> ₹${result.GTA.toFixed(2)}</div>
      ${calcMP === "MYNTRA" ? `<div><b>Level:</b> ${result.Level || "-"}</div>` : ""}
      <div><b>Commission:</b> ₹${result.Commission.toFixed(2)}</div>
      <div><b>Fixed Fee:</b> ₹${result.Fixed.toFixed(2)}</div>
      <div><b>Collection Fee:</b> ₹${result.Collection.toFixed(2)}</div>
      <div><b>Input GST:</b> ₹${result.InputGSTCredit.toFixed(2)}</div>
      <div><b>TDS:</b> ₹${result.TDS.toFixed(2)}</div>
      <div><b>TCS:</b> ₹${result.TCS.toFixed(2)}</div>
      <div class="result-highlight"><b>Effective Net:</b> ₹${result.EffectiveNet.toFixed(2)}</div>
    `;
  };

  populateCategories();
}


