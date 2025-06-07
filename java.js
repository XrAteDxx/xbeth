document.addEventListener('DOMContentLoaded', function() {
    // --- Customers ---
    let customers = [];
    try { customers = JSON.parse(localStorage.getItem('customers') || '[]'); } catch(e) {}
    document.getElementById('dashboard-customers-count').textContent = customers.length;

    // --- Products ---
    let products = [];
    try { products = JSON.parse(localStorage.getItem('products') || '[]'); } catch(e) {}
    document.getElementById('dashboard-products-count').textContent = products.length;

    // --- Invoices & Finance ---
    let invoices = [];
    try { invoices = JSON.parse(localStorage.getItem('invoiceLog') || '[]'); } catch(e) {}
    // Invoices billed this month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    let billedThisMonth = invoices.filter(inv => {
        let d = inv.date ? new Date(inv.date) : null;
        return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    let billedAmount = billedThisMonth.reduce((sum, inv) => {
        if (inv.type === 'sell') {
            return sum + (inv.items?.reduce((s, item) => s + Number(item.sellPrice || 0) * Number(item.qty || 0), 0) || 0);
        }
        return sum;
    }, 0);
    document.getElementById('dashboard-invoices-amount').textContent = "$" + billedAmount.toLocaleString();

    // --- Inventory: total items in stock ---
    let totalInventory = products.reduce((sum, p) => sum + Number(p.qty || 0), 0);
    document.getElementById('dashboard-inventory-count').textContent = totalInventory.toLocaleString();

    // --- Suppliers ---
    let suppliers = [];
    try { suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]'); } catch(e) {}
    document.getElementById('dashboard-suppliers-count').textContent = suppliers.length;

    // --- Finance: Net revenue (sum of all sell invoices minus purchases/expenses) ---
    let totalSales = 0, totalPurchases = 0, totalExpenses = 0;
    invoices.forEach(inv => {
        if (inv.type === 'sell') {
            totalSales += inv.items?.reduce((sum, item) => sum + Number(item.sellPrice || 0) * Number(item.qty || 0), 0) || 0;
        } else if (inv.type === 'buy') {
            totalPurchases += inv.items?.reduce((sum, item) => sum + Number(item.purchasePrice || 0) * Number(item.qty || 0), 0) || 0;
        } else if (inv.type === 'expenses') {
            totalExpenses += Number(inv.expenses) || 0;
        }
    });
    let netRevenue = totalSales - totalPurchases - totalExpenses;
    document.getElementById('dashboard-finance-net').textContent = "$" + netRevenue.toLocaleString();

    // --- Invoice Log: count of overdue invoices ---
    let overdueCount = invoices.filter(inv =>
        inv.status === 'unpaid' &&
        inv.dueDate &&
        new Date(inv.dueDate) < new Date()
    ).length;
    document.getElementById('dashboard-invoice-log-overdue').textContent = overdueCount;
});