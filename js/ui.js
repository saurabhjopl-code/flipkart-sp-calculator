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

  setupCalculator();   // ✅ ADD THIS LINE

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
  const calcBtn = document.getElementById("calculatorTab");

  const calcSection = document.getElementById("calculatorSection");
  const tableContainer = document.querySelector(".table-container");

  fkBtn.onclick = () => {

    activeMP = "FLIPKART";

    fkBtn.classList.add("active");
    myBtn.classList.remove("active");
    calcBtn.classList.remove("active");

    calcSection.style.display = "none";
    tableContainer.style.display = "block";   // ✅ restore table

    populateCategoryFilter();
    applyFilters();
  };

  myBtn.onclick = () => {

    activeMP = "MYNTRA";

    myBtn.classList.add("active");
    fkBtn.classList.remove("active");
    calcBtn.classList.remove("active");

    calcSection.style.display = "none";
    tableContainer.style.display = "block";   // ✅ restore table

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

/* ================= ADVANCED CALCULATOR V4.1 ================= */

function setupCalculator() {

  const calcTab = document.getElementById("calculatorTab");
  const calcSection = document.getElementById("calculatorSection");
  const tableContainer = document.querySelector(".table-container");

  const fkBtn = document.getElementById("calcFKBtn");
  const myBtn = document.getElementById("calcMYBtn");

  const categorySelect = document.getElementById("calcCategory");
  const brandSelect = document.getElementById("calcBrand");
  const tpInput = document.getElementById("calcTP");
  const discountInput = document.getElementById("calcDiscount");
  const resultCard = document.getElementById("calcResultCard");

  let calcMP = "FLIPKART";

  /* OPEN CALCULATOR */
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
      ...new Set(allSKU.filter(d => d.mp === calcMP).map(d => d.cat))
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
    const discount = parseFloat(discountInput.value) || 0;

    if (!TP) return;

    const baseRow = {
      cat: categorySelect.value,
      simTP: TP,
      mp: calcMP,
      brand: brandSelect.value
    };

    const base = calculateSP(baseRow, masterData);

    let discountResult = null;

    if (discount > 0) {
      const discountedTP = TP * (1 - discount / 100);

      const discountRow = {
        cat: categorySelect.value,
        simTP: discountedTP,
        mp: calcMP,
        brand: brandSelect.value
      };

      discountResult = calculateSP(discountRow, masterData);
    }

    renderComparison(base, discountResult);
  };

 function renderComparison(base, discountResult) {

  resultCard.style.display = "block";

  function format(v){
    return "₹" + Number(v || 0).toFixed(2);
  }

  function diff(b, d){
    return (Number(d || 0) - Number(b || 0)).toFixed(2);
  }

  function row(label, b, d){
    if(!discountResult){
      return `
        <tr>
          <td>${label}</td>
          <td class="val">${format(b)}</td>
        </tr>`;
    }

    return `
      <tr>
        <td>${label}</td>
        <td class="val">${format(b)}</td>
        <td class="val">${format(d)}</td>
        <td class="val">${diff(b,d)}</td>
      </tr>`;
  }

  const sellerBase = base.SP - base.GTA;
  const sellerDisc = discountResult ? discountResult.SP - discountResult.GTA : null;

  const gstBase =
    0.18 * ((base.Commission||0)+(base.Collection||0)+(base.Fixed||0));

  const gstDisc = discountResult
    ? 0.18 * ((discountResult.Commission||0)+(discountResult.Collection||0)+(discountResult.Fixed||0))
    : null;

  let html = `<table class="calc-table compact">`;

  if(discountResult){
    html += `
      <tr class="calc-header">
        <td>Pricing Details</td>
        <td>Base</td>
        <td>Discount</td>
        <td>Diff</td>
      </tr>`;
  }else{
    html += `
      <tr class="calc-header">
        <td>Pricing Details</td>
        <td>Value</td>
      </tr>`;
  }

  /* ===== TOP ===== */

  html += row("Seller Price", sellerBase, sellerDisc);
  html += row("Customer Logistics Fees (GTA)", base.GTA, discountResult?.GTA);

  /* ===== MP FEES ===== */

  html += `<tr class="section"><td colspan="4">MP Fees</td></tr>`;

  html += row("Commission", base.Commission, discountResult?.Commission);
  html += row("Fixed Fee", base.Fixed, discountResult?.Fixed);
  html += row("Collection Fee", base.Collection, discountResult?.Collection);

  /* ===== TAXES ===== */

  html += `<tr class="section"><td colspan="4">Taxes</td></tr>`;

  html += row("TCS", base.TCS, discountResult?.TCS);
  html += row("TDS", base.TDS, discountResult?.TDS);
  html += row("GST on MP Fees @18%", gstBase, gstDisc);

  /* ===== BANK SETTLEMENT ===== */

  html += `<tr class="section"><td colspan="4">Bank Settlement</td></tr>`;
  html += row("Bank Settlement", base.BankSettlement, discountResult?.BankSettlement);

  /* ===== INPUT GST CREDITS ===== */

  html += `<tr class="section"><td colspan="4">Input Tax Credits</td></tr>`;

  html += row("Input TCS Credit", base.TCS, discountResult?.TCS);
  html += row("Input TDS Credit", base.TDS, discountResult?.TDS);
  html += row("Input GST Credit", gstBase, gstDisc);

  /* ===== SUMMARY ===== */

  html += `<tr class="section"><td colspan="4">Summary</td></tr>`;

  html += row("Listing Price", base.SP, discountResult?.SP);
  html += row("Effective Net", base.EffectiveNet, discountResult?.EffectiveNet);

  html += `</table>`;

  resultCard.innerHTML = html;
}

  populateCategories();
}

