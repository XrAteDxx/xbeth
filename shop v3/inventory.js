// Fetch inventory data from the backend and update the UI accordingly
let inventory = [];

let editingIndex = null;

function fetchInventory() {
    fetch('http://localhost:3001/api/inventory')
        .then(response => response.json())
        .then(data => {
            inventory = data;
            renderInventoryTable();
        })
        .catch(() => {
            // fallback to empty array or handle error
            inventory = [];
            renderInventoryTable();
        });
}

function addInventoryItem(item) {
    return fetch('http://localhost:3001/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(response => response.json());
}

function updateInventoryItem(id, item) {
    return fetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(response => response.json());
}

function deleteInventoryItem(id) {
    return fetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'DELETE'
    });
}

function renderInventoryTable() {
    const tbody = document.querySelector("#inventoryTable tbody");
    tbody.innerHTML = "";
    inventory.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Product Name">${item.name}</td>
            <td data-label="Quantity">${(item.quantity !== undefined && item.quantity !== null && item.quantity !== "") ? item.quantity : ""}</td>
            <td data-label="Description">${item.description || ""}</td>
            <td>
                <button class="edit-btn" data-idx="${idx}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-idx="${idx}" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
            const idx = Number(btn.getAttribute("data-idx"));
            openInventoryModal("edit", idx);
        };
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
            const idx = Number(btn.getAttribute("data-idx"));
            if (confirm("Are you sure you want to delete this product?")) {
                const item = inventory[idx];
                deleteInventoryItem(item.id).then(() => {
                    fetchInventory();
                });
            }
        };
    });
}

function openInventoryModal(mode, idx = null) {
    const overlay = document.getElementById("inventoryModalOverlay");
    const form = document.getElementById("inventoryForm");
    const title = document.getElementById("inventoryModalTitle");
    overlay.style.display = "flex";
    if (mode === "edit") {
        editingIndex = idx;
        const item = inventory[idx];
        title.textContent = "Edit Product";
        form.inventoryName.value = item.name || "";
        form.inventoryQuantity.value = (item.quantity !== undefined && item.quantity !== null) ? item.quantity : "";
        form.inventoryDescription.value = item.description || "";
    } else {
        editingIndex = null;
        title.textContent = "Add Product";
        form.reset();
    }
}
function closeInventoryModal() {
    document.getElementById("inventoryModalOverlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchInventory();

    document.getElementById("addInventoryBtn").onclick = () => openInventoryModal("add");
    document.getElementById("closeInventoryModal").onclick = closeInventoryModal;
    document.getElementById("cancelInventoryModal").onclick = closeInventoryModal;

    document.getElementById("inventoryModalOverlay").onclick = function(e) {
        if (e.target === this) closeInventoryModal();
    };

    document.getElementById("inventoryForm").onsubmit = function(e) {
        e.preventDefault();
        const name = this.inventoryName.value.trim();
        const quantityVal = this.inventoryQuantity.value.trim();
        const quantity = quantityVal === "" ? "" : Number(quantityVal);
        const description = this.inventoryDescription.value.trim();
        if (!name) return;
        if (editingIndex !== null) {
            const item = inventory[editingIndex];
            updateInventoryItem(item.id, { name, quantity, description }).then(() => {
                fetchInventory();
                closeInventoryModal();
            });
        } else {
            addInventoryItem({ name, quantity, description }).then(() => {
                fetchInventory();
                closeInventoryModal();
            });
        }
    };
});