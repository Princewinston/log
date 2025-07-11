document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addForm");
  const tableBody = document.querySelector("table tbody");
  const searchInput = document.querySelector(".search input");
  let inputRow = null; 

  function showNotification(message, type = "success") {
    const notif = document.createElement("div");
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  function updateStatus(row) {
    const stock = parseInt(row.children[2].textContent);
    const reorder = parseInt(row.children[3].textContent);
    const statusCell = row.children[4];

    if (stock === 0) {
      statusCell.textContent = "Out of Stock";
      statusCell.className = "status-out";
    } else if (stock < reorder) {
      statusCell.textContent = "Low Stock";
      statusCell.className = "status-low";
    } else {
      statusCell.textContent = "Sufficient";
      statusCell.className = "status-sufficient";
    }
  }

  function updateTimestamp(row) {
    const now = new Date();
    row.children[5].textContent = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function updateStock(cell, amount) {
    const row = cell.parentElement;
    const current = parseInt(cell.textContent);
    const newVal = current + amount;

    if (newVal < 0) {
      showNotification("Stock can't go below 0", "error");
      return;
    }

    cell.classList.add("stock-updated");
    cell.textContent = newVal;
    setTimeout(() => cell.classList.remove("stock-updated"), 300);

    updateStatus(row);
    updateTimestamp(row);

    showNotification(amount > 0 ? "Stock added successfully" : "Stock removed", amount > 0 ? "success" : "warning");

    const removeBtn = row.querySelector(".remove-btn");
    const actions = row.querySelector(".actions");

    if (newVal === 0 && removeBtn) {
      removeBtn.remove();
    } else if (newVal > 0 && !removeBtn) {
      const newBtn = document.createElement("button");
      newBtn.textContent = "➖ Remove";
      newBtn.className = "remove-btn";
      newBtn.addEventListener("click", () => createInputRow(row, false));
      actions.appendChild(newBtn);
    }
  }

 
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const pname = document.getElementById("pname").value.trim();
    const pid = document.getElementById("pid").value.trim().toUpperCase();
    const pstock = parseInt(document.getElementById("pstock").value);
    const preorder = parseInt(document.getElementById("preorder").value);

    if (!pname || !pid || isNaN(pstock) || isNaN(preorder)) {
      alert("Please fill all fields correctly.");
      return;
    }

    const status =
      pstock === 0
        ? "Out of Stock"
        : pstock < preorder
        ? "Low Stock"
        : "Sufficient";

    const statusClass =
      status === "Out of Stock"
        ? "status-out"
        : status === "Low Stock"
        ? "status-low"
        : "status-sufficient";

    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${pname}</td>
      <td>${pid}</td>
      <td>${pstock}</td>
      <td>${preorder}</td>
      <td class="${statusClass}">${status}</td>
      <td>${formattedTime}</td>
      <td class="actions">
  <div class="action-left">
    <button class="add-btn">➕ Add</button>
    ${pstock > 0 ? '<button class="remove-btn">➖ Remove</button>' : ""}
  </div>
  <button class="delete-btn">🗑️</button>
</td>

    `;

    tableBody.appendChild(newRow);

    newRow.querySelector(".add-btn").addEventListener("click", () => createInputRow(newRow, true));
    const removeBtn = newRow.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => createInputRow(newRow, false));
    }

    form.reset();
  });

  tableBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-btn")) {
      const row = e.target.closest("tr");
      createInputRow(row, true);
    }
    if (e.target.classList.contains("remove-btn")) {
      const row = e.target.closest("tr");
      createInputRow(row, false);
    }
  });

  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    tableBody.querySelectorAll("tr").forEach((row) => {
      const pname = row.children[0].textContent.toLowerCase();
      const pid = row.children[1].textContent.toLowerCase();
      row.style.display = pname.includes(keyword) || pid.includes(keyword) ? "" : "none";
    });
  });

  document.getElementById("pid").addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });
});

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}
