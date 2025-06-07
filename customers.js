let customers = [];
let editingId = null;

function renderCustomersTable() {
    const tbody = document.querySelector("#customersTable tbody");
    tbody.innerHTML = "";
    customers.forEach((customer, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Name">${customer.name}</td>
            <td data-label="Phone">${customer.phone || ""}</td>
            <td data-label="Address">${customer.address || ""}</td>
            <td data-label="Total Spend">${customer.total_spend !== undefined && customer.total_spend !== null ? "$" + Number(customer.total_spend).toLocaleString() : ""}</td>
            <td>
                <button class="edit-btn" data-id="${customer.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${customer.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
            const id = Number(btn.getAttribute("data-id"));
            openCustomerModal("edit", id);
        };
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
            const id = Number(btn.getAttribute("data-id"));
            if (confirm("Are you sure you want to delete this customer?")) {
                deleteCustomer(id);
            }
        };
    });
}

function fetchCustomers() {
    fetch("http://localhost:3001/api/customers")
        .then(res => res.json())
        .then(data => {
            customers = data;
            renderCustomersTable();
        })
        .catch(() => {
            customers = [];
            renderCustomersTable();
        });
}

function addCustomer(customer) {
    fetch("http://localhost:3001/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
    })
    .then(res => res.json())
    .then(() => {
        fetchCustomers();
        closeCustomerModal();
    });
}

function updateCustomer(id, customer) {
    fetch(`http://localhost:3001/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
    })
    .then(res => res.json())
    .then(() => {
        fetchCustomers();
        closeCustomerModal();
    });
}

function deleteCustomer(id) {
    fetch(`http://localhost:3001/api/customers/${id}`, {
        method: "DELETE"
    })
    .then(() => fetchCustomers());
}

function openCustomerModal(mode, id = null) {
    const overlay = document.getElementById("customerModalOverlay");
    const form = document.getElementById("customerForm");
    const title = document.getElementById("customerModalTitle");
    overlay.style.display = "flex";
    if (mode === "edit") {
        editingId = id;
        const c = customers.find(c => c.id === id);
        title.textContent = "Edit Customer";
        form.customerName.value = c.name || "";
        form.customerPhone.value = c.phone || "";
        form.customerAddress.value = c.address || "";
        form.customerSpend.value = c.total_spend !== undefined && c.total_spend !== null ? c.total_spend : "";
    } else {
        editingId = null;
        title.textContent = "Add Customer";
        form.reset();
    }
}
function closeCustomerModal() {
    document.getElementById("customerModalOverlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCustomers();

    document.getElementById("addCustomerBtn").onclick = () => openCustomerModal("add");
    document.getElementById("closeCustomerModal").onclick = closeCustomerModal;
    document.getElementById("cancelCustomerModal").onclick = closeCustomerModal;

    document.getElementById("customerModalOverlay").onclick = function(e) {
        if (e.target === this) closeCustomerModal();
    };

    document.getElementById("customerForm").onsubmit = function(e) {
        e.preventDefault();
        const name = this.customerName.value.trim();
        const phone = this.customerPhone.value.trim();
        const address = this.customerAddress.value.trim();
        const spendVal = this.customerSpend.value.trim();
        const total_spend = spendVal === "" ? null : Number(spendVal);
        if (!name) return;

        const customerData = { name, phone, address, total_spend };

        if (editingId !== null) {
            updateCustomer(editingId, customerData);
        } else {
            addCustomer(customerData);
        }
    };
});