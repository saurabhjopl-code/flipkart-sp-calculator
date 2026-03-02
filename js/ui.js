import { calculateSP } from "./engineRouter.js";

let allData = [];
let filteredData = [];
let visibleCount = 50;
let activeMP = "FLIPKART";

/* ================= INIT ================= */

export function initUI(data) {
  allData = data;

  setupTabs();
  populateCategoryFilter();
  applyFilters();

  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document
    .getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

  document
    .getElementById("loadMoreBtn")
    .addEventListener("click", loadMore);
}

/* ================= TAB SWITCH ================= */

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

/* ================= CATEGORY ================= */

function populateCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [
    ...new Set(
      allData
        .filter((d) => d.mp === activeMP)
        .map((d) => d.cat)
    ),
  ];

  categories.sort();

  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/* ================= FILTERING ================= */

function applyFilters() {
  const search = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const category =
    document.getElementById("categoryFilter").value;

  filteredData = allData.filter((row) => {
    return (
      row.mp === activeMP &&
      row.sku.toLowerCase().includes(search) &&
      (category === "all" || row.cat === category)
    );
  });

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

  filteredData
    .slice(0, visibleCount)
    .forEach((row) => {
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
    activeMP +
    " | Total: " +
    filteredData.length +
    " | Showing: " +
    Math.min(visibleCount, filteredData.length);
}

/* ================= SEARCH ================= */
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", () => {
  clearBtn.style.display = searchInput.value ? "block" : "none";
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";
  applyFilters();
});
