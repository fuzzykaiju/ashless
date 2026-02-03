let entries = JSON.parse(localStorage.getItem("entries")) || [];
let editIndex = null;
let actionIndex = null;

// Format date to dd-mm-yy
function formatDate(isoDate) {
  let [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y.slice(2)}`;
}

// --- Menu ---
function toggleMenu() {
  let menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// --- Entry Modal ---
function openEntryModal() {
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  document.getElementById("cravings").value = "";
  document.getElementById("smoked").value = "";
  document.getElementById("note").value = "";
  document.getElementById("saveBtn").innerText = "Save Entry";
  editIndex = null;
  document.getElementById("entryModal").style.display = "block";
}
function closeEntryModal() {
  document.getElementById("entryModal").style.display = "none";
}

// --- Chart Modal ---
function openChartModal() {
  document.getElementById("chartModal").style.display = "block";
  drawChart();
}
function closeChartModal() {
  document.getElementById("chartModal").style.display = "none";
}

// --- Note Modal ---
function showNote(index) {
  let note = entries[index].note || "No note added.";
  document.getElementById("noteText").innerText = note;
  document.getElementById("noteModal").style.display = "block";
}
function closeNoteModal() {
  document.getElementById("noteModal").style.display = "none";
}

// --- Action Modal ---
function showActions(index) {
  actionIndex = index;
  document.getElementById("actionDate").innerText = "Entry: " + formatDate(entries[index].date);
  document.getElementById("actionModal").style.display = "block";
}
function closeActionModal() {
  document.getElementById("actionModal").style.display = "none";
  actionIndex = null;
}
function triggerEdit() {
  if (actionIndex !== null) {
    let e = entries[actionIndex];
    document.getElementById("date").value = e.date;
    document.getElementById("cravings").value = e.cravings;
    document.getElementById("smoked").value = e.smoked;
    document.getElementById("note").value = e.note || "";
    document.getElementById("entryModal").style.display = "block";
    document.getElementById("saveBtn").innerText = "Update Entry";
    editIndex = actionIndex;
    closeActionModal();
  }
}
function triggerDelete() {
  if (actionIndex !== null) {
    entries.splice(actionIndex, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    renderEntries();
    closeActionModal();
  }
}

// --- Add Entry ---
function addEntry() {
  let date = document.getElementById("date").value || new Date().toISOString().split("T")[0];
  let cravings = parseInt(document.getElementById("cravings").value) || 0;
  let smoked = parseInt(document.getElementById("smoked").value) || 0;
  let note = document.getElementById("note").value || "";
  let expense = smoked * 20;

  if (editIndex !== null) {
    entries[editIndex] = {date, cravings, smoked, expense, note};
    editIndex = null;
    document.getElementById("saveBtn").innerText = "Save Entry";
  } else {
    entries.push({date, cravings, smoked, expense, note});
  }

  // Sort by date ascending
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  localStorage.setItem("entries", JSON.stringify(entries));
  renderEntries();
  closeEntryModal();
}

// --- Render Entries ---
function renderEntries() {
  let container = document.getElementById("entries");
  container.innerHTML = "";
  entries.forEach((e, i) => {
    let cravingsClass = e.cravings === 0 ? "zero" : "cravings";
    let smokedClass   = e.smoked === 0 ? "zero" : "smoked";
    let expenseClass  = e.expense === 0 ? "zero" : "expense";

    let card = document.createElement("div");
    card.className = "entry";
    card.innerHTML = `
      <div class="entry-row">
        <span class="date">${formatDate(e.date)}</span>
        <span class="${cravingsClass}">${e.cravings}</span>
        <span class="${smokedClass}">${e.smoked}</span>
        <span class="${expenseClass}">₹${e.expense}</span>
        <span class="icon-btn" onclick="showNote(${i})">🔎</span>
        <button class="icon-btn" onclick="showActions(${i})">⋮</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Chart ---
function drawChart() {
  let ctx = document.getElementById("chart").getContext("2d");
  let range = document.getElementById("range").value;

  let cutoff = null;
  if (range !== "all") {
    cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(range));
  }

  let filtered = entries.filter(e => {
    if (!cutoff) return true;
    return new Date(e.date) >= cutoff;
  });

  let labels = filtered.map(e => formatDate(e.date));
  let smoked = filtered.map(e => e.smoked);
  let cravings = filtered.map(e => e.cravings);

  // Colors for smoked points
  let smokedColors = smoked.map(v => v === 0 ? "#4caf50" : "#f44336");
  // Colors for cravings points
  let cravingsColors = cravings.map(v => v === 0 ? "#4caf50" : "#ff9800");

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Smoked',
          data: smoked,
          borderColor: '#ff9900',
          pointBackgroundColor: smokedColors,
          pointRadius: 5,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Cravings',
          data: cravings,
          borderColor: '#00bcd4',          // cyan line
          borderDash: [6, 4],              // dashed style
          pointBackgroundColor: cravingsColors,
          pointRadius: 5,
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#e0e0e0', font: { family: "Consolas" } }
        },
        tooltip: {
          backgroundColor: '#2a2a2a',
          titleColor: '#ff9900',
          bodyColor: '#e0e0e0'
        }
      },
      scales: {
        x: {
          ticks: { color: '#e0e0e0', font: { family: "Consolas" } },
          grid: { color: '#333' }
        },
        y: {
          ticks: { color: '#e0e0e0', font: { family: "Consolas" } },
          grid: { color: '#333' }
        }
      }
    }
  });
}

// --- Export CSV ---
function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Date,Cravings,Smoked,Expense,Note\n";
  entries.forEach(e => {
    csvContent += `${formatDate(e.date)},${e.cravings},${e.smoked},${e.expense},${e.note || ""}\n`;
  });
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "ashless_log.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initial render
renderEntries();