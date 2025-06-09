// --- UTILITY HELPERS ---
function formatCurrency(amount) {
    return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function statusClass(status) {
    switch(status) {
        case 'paid': return 'status-paid';
        case 'pending': return 'status-pending';
        case 'unpaid': return 'status-unpaid';
        default: return '';
    }
}

// --- GLOBALS for lookup and loaded invoices ---
let customersList = [];
let suppliersList = [];
let inventoryList = [];
let invoicesList = [];

// --- LOOKUP LOADERS ---
async function fetchAllLookups() {
    customersList = await fetch('http://localhost:3001/api/customers').then(r=>r.json()).catch(()=>[]);
    suppliersList = await fetch('http://localhost:3001/api/suppliers').then(r=>r.json()).catch(()=>[]);
    inventoryList = await fetch('http://localhost:3001/api/inventory').then(r=>r.json()).catch(()=>[]);
}
function getCustomerName(id) {
    const c = customersList.find(c => c.id === id);
    return c ? c.name : '';
}
function getSupplierName(id) {
    const s = suppliersList.find(s => s.id === id);
    return s ? s.name : '';
}
function getProductName(id) {
    const p = inventoryList.find(p => p.id === id);
    return p ? p.name : '';
}

// --- INVOICE LOADER ---
async function fetchInvoices() {
    invoicesList = await fetch('http://localhost:3001/api/invoices').then(r=>r.json()).catch(()=>[]);
}

// --- ADAPTERS for rendering ---
function getInvoiceSellTotal(inv) {
    if(inv.type === 'sell' && inv.invoice_items) {
        return inv.invoice_items.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0) || 0;
    }
    return 0;
}
function getInvoiceCOGS(inv) {
    if(inv.type === 'sell' && inv.invoice_items) {
        // Only possible if your backend includes purchase price in invoice_items
        return inv.invoice_items.reduce((sum, item) => sum + Number(item.purchase_price || 0) * Number(item.quantity || 0), 0) || 0;
    }
    return 0;
}
function getInvoiceTotal(inv) {
    if(inv.type === 'sell')
        return inv.invoice_items?.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0) || 0;
    if(inv.type === 'buy')
        return inv.invoice_items?.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0) || 0;
    if(inv.type === 'expenses')
        return Number(inv.invoice_items?.[0]?.total_price) || 0;
    return 0;
}
function getInvoiceParty(inv) {
    if(inv.type === 'sell') return getCustomerName(inv.customer_id);
    if(inv.type === 'buy') return getSupplierName(inv.supplier_id);
    return '-';
}

// --- RENDER LOG ---
function renderInvoiceLog(filteredInvoices = null) {
    const tbody = document.getElementById('invoiceLogBody');
    tbody.innerHTML = '';
    let invoices = filteredInvoices || invoicesList;
    invoices.forEach((inv, idx) => {
        const total = getInvoiceTotal(inv);
        const paid = Number(inv.paid_amount) || 0;
        const remaining = Math.max(0, total - paid);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(inv.invoice_date || '').slice(0, 10)}</td>
            <td style="text-transform:capitalize;">${inv.type || ''}</td>
            <td>${getInvoiceParty(inv)}</td>
            <td><span class="invoice-status ${statusClass(inv.status)}">${inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : ''}</span></td>
            <td>${formatCurrency(total)}</td>
            <td>${formatCurrency(paid)}</td>
            <td>${formatCurrency(remaining)}</td>
            <td>
                <button class="action-btn details" title="Details" data-id="${inv.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" title="Delete" data-id="${inv.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Details
    document.querySelectorAll('.action-btn.details').forEach(btn => {
        btn.onclick = function() {
            const inv = invoices.find(i => i.id == this.dataset.id);
            showDetailsModal(inv);
        }
    });

    // Delete
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.onclick = async function() {
            if(confirm("Delete this invoice?")) {
                await deleteInvoice(this.dataset.id);
                await fetchInvoices();
                renderInvoiceLog();
            }
        }
    });
}

// --- MODAL: Show Invoice Details ---
function showDetailsModal(inv) {
    const modal = document.getElementById('detailsModal');
    const c = [];
    c.push(`<div><b>Date:</b> ${(inv.invoice_date || '').slice(0, 10)}</div>`);
    c.push(`<div><b>Type:</b> ${inv.type || ''}</div>`);
    c.push(`<div><b>Status:</b> <span class="invoice-status ${statusClass(inv.status)}">${inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : ''}</span></div>`);
    c.push(`<div><b>Amount Paid:</b> ${formatCurrency(inv.paid_amount)}</div>`);
    c.push(`<div><b>Total:</b> ${formatCurrency(getInvoiceTotal(inv))}</div>`);
    if (inv.type === "sell" && inv.customer_id) c.push(`<div><b>Customer:</b> ${getCustomerName(inv.customer_id)}</div>`);
    if (inv.type === "buy" && inv.supplier_id) c.push(`<div><b>Supplier:</b> ${getSupplierName(inv.supplier_id)}</div>`);
    if (inv.type === "expenses") {
        c.push(`<div><b>Expenses:</b> ${formatCurrency(inv.invoice_items?.[0]?.total_price)}</div>`);
        c.push(`<div><b>Description:</b> ${inv.expenses_description || inv.invoice_items?.[0]?.description || ''}</div>`);
    }
    // --- PROFIT BLOCK FOR SELL INVOICES ---
    if (inv.type === "sell" && inv.invoice_items && inv.invoice_items.length) {
        const totalSell = getInvoiceSellTotal(inv);
        // If you store purchase price in invoice_items, you can show profit as well
        // const totalPurchase = getInvoiceCOGS(inv);
        // const profit = totalSell - totalPurchase;
        c.push(`<div style="margin-top:1em;"><b>Total Sell Price:</b> ${formatCurrency(totalSell)}</div>`);
        // c.push(`<div><b>Total Purchase Price:</b> ${formatCurrency(totalPurchase)}</div>`);
        // c.push(`<div><b>Profit (Sell - Purchase):</b> ${formatCurrency(profit)}</div>`);
    }
    if (inv.invoice_items && inv.invoice_items.length) {
        c.push('<div style="margin-top:1em;"><b>Items:</b><ul style="margin:0 0 0 1.2em;">');
        for(const item of inv.invoice_items) {
            c.push(`<li>
                ${getProductName(item.product_id) || item.description || ''} - qty: ${item.quantity || ''} 
                , unit price: ${formatCurrency(item.unit_price)}
                , total: ${formatCurrency(item.total_price)}
            </li>`);
        }
        c.push('</ul></div>');
    }
    document.getElementById('detailsModalContent').innerHTML = c.join('');
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.getElementById('closeDetailsModal').onclick = function() {
        modal.classList.remove('show');
        modal.style.display = 'none';
    };
    modal.onclick = function(e) {
        if(e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    };
}

// --- DELETE INVOICE BY API ---
async function deleteInvoice(id) {
    await fetch(`http://localhost:3001/api/invoices/${id}`, { method: "DELETE" });
}

// --- FILTERS ---
function applyFilters() {
    const type = document.getElementById('filterType').value;
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('filterSearch').value.trim().toLowerCase();
    let filtered = invoicesList.filter(inv => {
        let ok = true;
        if(type && inv.type !== type) ok = false;
        if(status && inv.status !== status) ok = false;
        if(search) {
            let party = getInvoiceParty(inv).toLowerCase();
            if(!party.includes(search)) ok = false;
        }
        return ok;
    });
    renderInvoiceLog(filtered);
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAllLookups();
    await fetchInvoices();
    renderInvoiceLog();

    document.getElementById('filterType').onchange = applyFilters;
    document.getElementById('filterStatus').onchange = applyFilters;
    document.getElementById('filterSearch').oninput = applyFilters;
    document.getElementById('clearFiltersBtn').onclick = function() {
        document.getElementById('filterType').value = "";
        document.getElementById('filterStatus').value = "";
        document.getElementById('filterSearch').value = "";
        renderInvoiceLog();
    };
});