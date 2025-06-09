// Helper functions for row creation and updating
function createSellItemRow(item = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="item-name"></td>
        <td><input type="number" class="item-qty" min="1" step="1"></td>
        <td><input type="number" class="item-purchase-price" min="0" step="0.01"></td>
        <td><input type="number" class="item-sell-price" min="0" step="0.01"></td>
        <td><input type="text" class="item-total-purchase" readonly></td>
        <td><input type="text" class="item-total-sell" readonly></td>
        <td><button type="button" class="remove-item-btn"><i class="fas fa-trash-alt"></i></button></td>
    `;
    if (item.name) tr.querySelector('.item-name').value = item.name;
    if (item.qty) tr.querySelector('.item-qty').value = item.qty;
    if (item.purchasePrice) tr.querySelector('.item-purchase-price').value = item.purchasePrice;
    if (item.sellPrice) tr.querySelector('.item-sell-price').value = item.sellPrice;
    return tr;
}

function createBuyItemRow(item = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="buy-item-name"></td>
        <td><input type="number" class="buy-item-qty" min="1" step="1"></td>
        <td><input type="number" class="buy-item-purchase-price" min="0" step="0.01"></td>
        <td><input type="text" class="buy-item-total-purchase" readonly></td>
        <td><button type="button" class="remove-buy-item-btn"><i class="fas fa-trash-alt"></i></button></td>
    `;
    if (item.name) tr.querySelector('.buy-item-name').value = item.name;
    if (item.qty) tr.querySelector('.buy-item-qty').value = item.qty;
    if (item.purchasePrice) tr.querySelector('.buy-item-purchase-price').value = item.purchasePrice;
    return tr;
}

function updateSellRowTotals(tr) {
    const qty = Number(tr.querySelector('.item-qty').value);
    const purchase = Number(tr.querySelector('.item-purchase-price').value);
    const sell = Number(tr.querySelector('.item-sell-price').value);
    tr.querySelector('.item-total-purchase').value = (qty && purchase) ? (qty * purchase).toLocaleString() : '';
    tr.querySelector('.item-total-sell').value = (qty && sell) ? (qty * sell).toLocaleString() : '';
}

function updateBuyRowTotals(tr) {
    const qty = Number(tr.querySelector('.buy-item-qty').value);
    const purchase = Number(tr.querySelector('.buy-item-purchase-price').value);
    tr.querySelector('.buy-item-total-purchase').value = (qty && purchase) ? (qty * purchase).toLocaleString() : '';
}

function updateSellInvoiceTotals() {
    let totalPurchase = 0;
    let totalSell = 0;
    document.querySelectorAll('#sellItemsTable tbody tr').forEach(tr => {
        const qty = Number(tr.querySelector('.item-qty').value);
        const purchase = Number(tr.querySelector('.item-purchase-price').value);
        const sell = Number(tr.querySelector('.item-sell-price').value);
        totalPurchase += (qty && purchase) ? qty * purchase : 0;
        totalSell += (qty && sell) ? qty * sell : 0;
    });
    document.getElementById('sellTotalPurchase').value = totalPurchase ? totalPurchase.toLocaleString() : '';
    document.getElementById('sellTotalSell').value = totalSell ? totalSell.toLocaleString() : '';
    updateAmountPaidField();
}

function updateBuyInvoiceTotals() {
    let totalPurchase = 0;
    document.querySelectorAll('#buyItemsTable tbody tr').forEach(tr => {
        const qty = Number(tr.querySelector('.buy-item-qty').value);
        const purchase = Number(tr.querySelector('.buy-item-purchase-price').value);
        totalPurchase += (qty && purchase) ? qty * purchase : 0;
    });
    document.getElementById('buyTotalPurchase').value = totalPurchase ? totalPurchase.toLocaleString() : '';
    updateAmountPaidField();
}

function addSellItemRow(item) {
    const tbody = document.querySelector('#sellItemsTable tbody');
    const tr = createSellItemRow(item);
    tbody.appendChild(tr);
    ['item-name', 'item-qty', 'item-purchase-price', 'item-sell-price'].forEach(cls => {
        tr.querySelector(`.${cls}`).addEventListener('input', () => {
            updateSellRowTotals(tr);
            updateSellInvoiceTotals();
        });
    });
    tr.querySelector('.remove-item-btn').onclick = function() {
        tr.remove();
        updateSellInvoiceTotals();
    };
    updateSellRowTotals(tr);
    updateSellInvoiceTotals();
    showInvoiceTypeSection(document.getElementById('invoiceType').value);
}

function addBuyItemRow(item) {
    const tbody = document.querySelector('#buyItemsTable tbody');
    const tr = createBuyItemRow(item);
    tbody.appendChild(tr);
    ['buy-item-name', 'buy-item-qty', 'buy-item-purchase-price'].forEach(cls => {
        tr.querySelector(`.${cls}`).addEventListener('input', () => {
            updateBuyRowTotals(tr);
            updateBuyInvoiceTotals();
        });
    });
    tr.querySelector('.remove-buy-item-btn').onclick = function() {
        tr.remove();
        updateBuyInvoiceTotals();
    };
    updateBuyRowTotals(tr);
    updateBuyInvoiceTotals();
    showInvoiceTypeSection(document.getElementById('invoiceType').value);
}

function showInvoiceTypeSection(type) {
    const sellItemsSection = document.getElementById('sellItemsSection');
    const buyItemsSection = document.getElementById('buyItemsSection');
    const expensesSection = document.getElementById('expensesSection');
    const customerRow = document.getElementById('customerRow');
    const supplierRow = document.getElementById('supplierRow');
    const invoiceCustomer = document.getElementById('invoiceCustomer');
    const invoiceSupplier = document.getElementById('invoiceSupplier');
    const expensesCost = document.getElementById('expensesCost');
    const expensesDescription = document.getElementById('expensesDescription');
    const sellItemFields = document.querySelectorAll(
        '.item-name, .item-qty, .item-purchase-price, .item-sell-price'
    );
    const buyItemFields = document.querySelectorAll(
        '.buy-item-name, .buy-item-qty, .buy-item-purchase-price'
    );

    // Always clear required for all conditional fields first
    expensesCost.required = false;
    expensesDescription.required = false;
    invoiceCustomer.required = false;
    invoiceSupplier.required = false;
    sellItemFields.forEach(inp => inp.required = false);
    buyItemFields.forEach(inp => inp.required = false);

    if (type === 'expenses') {
        sellItemsSection.style.display = 'none';
        buyItemsSection.style.display = 'none';
        expensesSection.style.display = '';
        customerRow.style.display = 'none';
        supplierRow.style.display = 'none';
        expensesCost.required = true;
        expensesDescription.required = true;
    } else if (type === 'sell') {
        sellItemsSection.style.display = '';
        buyItemsSection.style.display = 'none';
        expensesSection.style.display = 'none';
        customerRow.style.display = '';
        supplierRow.style.display = 'none';
        invoiceCustomer.required = true;
        sellItemFields.forEach(inp => inp.required = true);
    } else if (type === 'buy') {
        sellItemsSection.style.display = 'none';
        buyItemsSection.style.display = '';
        expensesSection.style.display = 'none';
        customerRow.style.display = 'none';
        supplierRow.style.display = '';
        invoiceSupplier.required = true;
        buyItemFields.forEach(inp => inp.required = true);
    }
    updateAmountPaidField();
}

function getInvoiceTotal(type) {
    if (type === "sell") {
        return Number(document.getElementById("sellTotalSell").value.replace(/,/g, "")) || 0;
    } else if (type === "buy") {
        return Number(document.getElementById("buyTotalPurchase").value.replace(/,/g, "")) || 0;
    } else if (type === "expenses") {
        return Number(document.getElementById("expensesCost").value) || 0;
    }
    return 0;
}

function updateAmountPaidField() {
    const type = document.getElementById("invoiceType").value;
    const status = document.getElementById("invoiceStatus").value;
    const group = document.getElementById("amountPaidGroup");
    const input = document.getElementById("amountPaid");
    const total = getInvoiceTotal(type);

    if (status === "pending") {
        group.style.display = "";
        input.readOnly = false;
        input.max = total > 0 ? total - 0.01 : "";
        if (input.value === "" || Number(input.value) >= total) {
            input.value = "";
        }
    } else if (status === "paid") {
        group.style.display = "";
        input.readOnly = true;
        input.value = total;
    } else { // unpaid
        group.style.display = "";
        input.readOnly = true;
        input.value = 0;
    }
}

// --- EDITING LOGIC BELOW ---

function fillInvoiceFormForEdit(invoice) {
    document.getElementById('invoiceType').value = invoice.type;
    document.getElementById('invoiceDate').value = invoice.date || '';
    document.getElementById('invoiceStatus').value = invoice.status || '';
    if(document.getElementById('amountPaid')) 
        document.getElementById('amountPaid').value = invoice.amountPaid || '';

    showInvoiceTypeSection(invoice.type);

    if(invoice.type === 'sell') {
        document.getElementById('invoiceCustomer').value = invoice.customer || '';
        document.querySelector('#sellItemsTable tbody').innerHTML = '';
        (invoice.items || []).forEach(item => addSellItemRow(item));
        updateSellInvoiceTotals();
    } else if(invoice.type === 'buy') {
        document.getElementById('invoiceSupplier').value = invoice.supplier || '';
        document.querySelector('#buyItemsTable tbody').innerHTML = '';
        (invoice.items || []).forEach(item => addBuyItemRow(item));
        updateBuyInvoiceTotals();
    } else if(invoice.type === 'expenses') {
        document.getElementById('expensesCost').value = invoice.expenses || '';
        document.getElementById('expensesDescription').value = invoice.expensesDescription || '';
    }
    updateAmountPaidField();
}

// ------- MYSQL CONNECTION LOGIC BELOW --------

// Fetch customers and suppliers for dropdown population (by name)
let customersList = [];
let suppliersList = [];
let inventoryList = [];

async function fetchAllLookups() {
    customersList = await fetch('http://localhost:3001/api/customers').then(r=>r.json()).catch(()=>[]);
    suppliersList = await fetch('http://localhost:3001/api/suppliers').then(r=>r.json()).catch(()=>[]);
    inventoryList = await fetch('http://localhost:3001/api/inventory').then(r=>r.json()).catch(()=>[]);
}

function findCustomerIdByName(name) {
    name = name.trim().toLowerCase();
    const c = customersList.find(c => c.name.trim().toLowerCase() === name);
    return c ? c.id : null;
}
function findSupplierIdByName(name) {
    name = name.trim().toLowerCase();
    const s = suppliersList.find(s => s.name.trim().toLowerCase() === name);
    return s ? s.id : null;
}
function findProductIdByName(name) {
    name = name.trim().toLowerCase();
    const p = inventoryList.find(p => p.name.trim().toLowerCase() === name);
    return p ? p.id : null;
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchAllLookups();

    document.getElementById('invoiceDate').value = new Date().toISOString().slice(0, 10);
    addSellItemRow();
    addBuyItemRow();

    document.getElementById('addSellItemBtn').onclick = () => addSellItemRow();
    document.getElementById('addBuyItemBtn').onclick = () => addBuyItemRow();

    document.getElementById('invoiceType').addEventListener("change", function() {
        showInvoiceTypeSection(this.value);
    });
    document.getElementById('invoiceStatus').addEventListener("change", updateAmountPaidField);
    document.getElementById("sellTotalSell").addEventListener("input", updateAmountPaidField);
    document.getElementById("buyTotalPurchase").addEventListener("input", updateAmountPaidField);
    document.getElementById("expensesCost").addEventListener("input", updateAmountPaidField);

    showInvoiceTypeSection(document.getElementById('invoiceType').value);

    document.getElementById('invoiceForm').onsubmit = async function(e) {
        e.preventDefault();
        const type = this.invoiceType.value;
        const date = this.invoiceDate.value;
        const status = this.invoiceStatus.value;
        const amountPaid = Number(this.amountPaid.value) || 0;
        const total = getInvoiceTotal(type);

        // Validate amountPaid
        if (status === "pending") {
            if (amountPaid < 0 || amountPaid >= total) {
                alert("For pending, the amount paid must be at least 0 and less than the total.");
                return;
            }
        }
        if (status === "paid" && amountPaid !== total) {
            alert("For paid status, amount paid must match total.");
            return;
        }
        if (status === "unpaid" && amountPaid !== 0) {
            alert("For unpaid status, amount paid must be 0.");
            return;
        }

        // Build the invoice object for MySQL
        let invoiceToSend = {
            type,
            invoice_date: date,
            status,
            paid_amount: amountPaid,
            total_amount: total
        };
        let itemsToSend = [];

        if (type === 'expenses') {
            const expenses = Number(this.expensesCost.value);
            const expensesDescription = this.expensesDescription.value.trim();
            if (isNaN(expenses) || expenses < 0 || !expensesDescription) {
                alert("Please enter valid expenses and description.");
                return;
            }
            invoiceToSend.expenses_description = expensesDescription;
            itemsToSend = [{
                description: expensesDescription,
                quantity: 1,
                unit_price: expenses,
                total_price: expenses
            }];
        } else if (type === 'sell') {
            const customer = this.invoiceCustomer.value.trim();
            const customerId = findCustomerIdByName(customer);
            if (!customerId) {
                alert("Customer not found.");
                return;
            }
            invoiceToSend.customer_id = customerId;
            let valid = true;
            document.querySelectorAll('#sellItemsTable tbody tr').forEach(tr => {
                const name = tr.querySelector('.item-name').value.trim();
                const qty = Number(tr.querySelector('.item-qty').value);
                const purchasePrice = Number(tr.querySelector('.item-purchase-price').value);
                const sellPrice = Number(tr.querySelector('.item-sell-price').value);
                const productId = findProductIdByName(name);
                if (!name || !productId || isNaN(qty) || qty <= 0 || isNaN(purchasePrice) || isNaN(sellPrice)) valid = false;
                itemsToSend.push({
                    product_id: productId,
                    quantity: qty,
                    unit_price: sellPrice,
                    total_price: qty * sellPrice
                });
            });
            if (!itemsToSend.length || !valid) {
                alert("Please fill all fields and at least one valid item with exact product names.");
                return;
            }
        } else if (type === 'buy') {
            const supplier = this.invoiceSupplier.value.trim();
            const supplierId = findSupplierIdByName(supplier);
            if (!supplierId) {
                alert("Supplier not found.");
                return;
            }
            invoiceToSend.supplier_id = supplierId;
            let valid = true;
            document.querySelectorAll('#buyItemsTable tbody tr').forEach(tr => {
                const name = tr.querySelector('.buy-item-name').value.trim();
                const qty = Number(tr.querySelector('.buy-item-qty').value);
                const purchasePrice = Number(tr.querySelector('.buy-item-purchase-price').value);
                const productId = findProductIdByName(name);
                if (!name || !productId || isNaN(qty) || qty <= 0 || isNaN(purchasePrice)) valid = false;
                itemsToSend.push({
                    product_id: productId,
                    quantity: qty,
                    unit_price: purchasePrice,
                    total_price: qty * purchasePrice
                });
            });
            if (!itemsToSend.length || !valid) {
                alert("Please fill all fields and at least one valid item with exact product names.");
                return;
            }
        }

        // Send to backend API
        try {
            const response = await fetch('http://localhost:3001/api/invoices', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoice: invoiceToSend, items: itemsToSend })
            });
            if (!response.ok) {
                alert("Error saving invoice to database.");
                return;
            }
        } catch (err) {
            alert("Error connecting to backend: " + err);
            return;
        }

        // Reset form
        this.reset();
        document.querySelector('#sellItemsTable tbody').innerHTML = '';
        document.querySelector('#buyItemsTable tbody').innerHTML = '';
        addSellItemRow();
        addBuyItemRow();
        document.getElementById('sellTotalPurchase').value = '';
        document.getElementById('sellTotalSell').value = '';
        document.getElementById('buyTotalPurchase').value = '';
        document.getElementById('expensesCost').value = '';
        document.getElementById('expensesDescription').value = '';
        document.getElementById('amountPaid').value = '';

        window.location.href = "invoice-log.html";
    };
});