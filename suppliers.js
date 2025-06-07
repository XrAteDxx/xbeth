const API_URL = 'http://localhost:3001/api/suppliers';

let suppliers = [];

function fetchSuppliers() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            suppliers = data;
            renderSuppliersTable();
        });
}

function renderSuppliersTable() {
    const tbody = document.querySelector('#suppliers-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    suppliers.forEach((supplier, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${supplier.name}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>${supplier.total_purchase || 0}</td>
            <td>${supplier.total_debt || 0}</td>
            <td>
                <button class="edit-btn" onclick="openEditSupplierModal(${supplier.id})">Edit</button>
                <button class="delete-btn" onclick="deleteSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Make all these global for inline HTML use
window.openSupplierModal = function() {
    document.getElementById('supplierModalOverlay').style.display = 'flex';
}
window.closeSupplierModal = function() {
    document.getElementById('supplierModalOverlay').style.display = 'none';
}
window.openEditSupplierModal = function(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    document.getElementById('edit-supplier-id').value = supplier.id;
    document.getElementById('edit-supplier-name').value = supplier.name;
    document.getElementById('edit-supplier-phone').value = supplier.phone;
    document.getElementById('edit-supplier-address').value = supplier.address;
    document.getElementById('edit-supplier-purchase').value = supplier.total_purchase || 0;
    document.getElementById('edit-supplier-debt').value = supplier.total_debt || 0;
    document.getElementById('editSupplierModalOverlay').style.display = 'flex';
}
window.closeEditSupplierModal = function() {
    document.getElementById('editSupplierModalOverlay').style.display = 'none';
}
// FIXED DELETE FUNCTION:
window.deleteSupplier = function(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                alert("Delete failed. Please check your backend.");
                return;
            }
            fetchSuppliers();
        })
        .catch(err => {
            alert("Error deleting supplier: " + err);
        });
};

function addSupplier(event) {
    event.preventDefault();
    const form = event.target;
    const supplier = {
        name: form.name.value,
        phone: form.phone.value,
        address: form.address.value,
        total_purchase: parseFloat(form.purchase.value) || 0,
        total_debt: parseFloat(form.debt.value) || 0
    };
    fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(supplier)
    })
    .then(() => {
        form.reset();
        closeSupplierModal();
        fetchSuppliers();
    });
}

function saveEditedSupplier(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.id.value;
    const supplier = {
        name: form.name.value,
        phone: form.phone.value,
        address: form.address.value,
        total_purchase: parseFloat(form.purchase.value) || 0,
        total_debt: parseFloat(form.debt.value) || 0
    };
    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(supplier)
    })
    .then(() => {
        closeEditSupplierModal();
        fetchSuppliers();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchSuppliers();
    const addForm = document.getElementById('add-supplier-form');
    if (addForm) addForm.onsubmit = addSupplier;
    const editForm = document.getElementById('edit-supplier-form');
    if (editForm) editForm.onsubmit = saveEditedSupplier;

    document.getElementById('supplierModalOverlay').onclick = (e) => { if (e.target === e.currentTarget) closeSupplierModal(); }
    document.getElementById('editSupplierModalOverlay').onclick = (e) => { if (e.target === e.currentTarget) closeEditSupplierModal(); }
});