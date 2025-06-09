function formatCurrency(amount) {
    return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}
function getInvoiceSellTotal(inv) {
    if(inv.type === 'sell') {
        return inv.items?.reduce((sum, item) => sum + Number(item.sellPrice || 0) * Number(item.qty || 0), 0) || 0;
    }
    return 0;
}
function getInvoiceCOGS(inv) {
    if(inv.type === 'sell') {
        return inv.items?.reduce((sum, item) => sum + Number(item.purchasePrice || 0) * Number(item.qty || 0), 0) || 0;
    }
    return 0;
}
function getInvoiceBuyTotal(inv) {
    if(inv.type === 'buy') {
        return inv.items?.reduce((sum, item) => sum + Number(item.purchasePrice || 0) * Number(item.qty || 0), 0) || 0;
    }
    return 0;
}
function getInvoiceExpensesTotal(inv) {
    if(inv.type === 'expenses') {
        return Number(inv.expenses) || 0;
    }
    return 0;
}
function getRemaining(inv, total) {
    return Math.max(0, (total || 0) - (Number(inv.amountPaid) || 0));
}

function filterInvoicesByDate(invoices, startDate, endDate) {
    return invoices.filter(inv => {
        const invDate = inv.date ? new Date(inv.date) : null;
        if (!invDate) return false;
        let afterStart = true, beforeEnd = true;
        if (startDate) afterStart = invDate >= new Date(startDate);
        if (endDate) beforeEnd = invDate <= new Date(endDate);
        return afterStart && beforeEnd;
    });
}

function renderFinanceSummary(invoices) {
    let totalSales = 0, paidSales = 0, unpaidPendingSales = 0;
    let totalPurchases = 0, paidPurchases = 0, unpaidPendingPurchases = 0;
    let totalExpenses = 0, paidExpenses = 0, unpaidPendingExpenses = 0;
    let sumSellPrices = 0, sumSellCOGS = 0, sumExpenses = 0;

    // Status counters
    let paidCount = 0, unpaidCount = 0, pendingCount = 0;

    invoices.forEach(inv => {
        // Count by status
        if (inv.status === "paid") paidCount++;
        else if (inv.status === "unpaid") unpaidCount++;
        else if (inv.status === "pending") pendingCount++;

        if(inv.type === "sell") {
            const sellTotal = getInvoiceSellTotal(inv);
            totalSales += sellTotal;
            sumSellPrices += sellTotal;
            sumSellCOGS += getInvoiceCOGS(inv);

            if(inv.status === "paid") {
                paidSales += Number(inv.amountPaid) || 0;
            } else if(inv.status === "pending" || inv.status === "unpaid") {
                unpaidPendingSales += getRemaining(inv, sellTotal);
            }
        }
        if(inv.type === "buy") {
            const buyTotal = getInvoiceBuyTotal(inv);
            totalPurchases += buyTotal;
            if(inv.status === "paid") {
                paidPurchases += Number(inv.amountPaid) || 0;
            } else if(inv.status === "pending" || inv.status === "unpaid") {
                unpaidPendingPurchases += getRemaining(inv, buyTotal);
            }
        }
        if(inv.type === "expenses") {
            const expensesTotal = getInvoiceExpensesTotal(inv);
            totalExpenses += expensesTotal;
            sumExpenses += expensesTotal;
            if(inv.status === "paid") {
                paidExpenses += Number(inv.amountPaid) || 0;
            } else if(inv.status === "pending" || inv.status === "unpaid") {
                unpaidPendingExpenses += getRemaining(inv, expensesTotal);
            }
        }
    });

    const netProfit = sumSellPrices - sumSellCOGS - sumExpenses;

    const el = document.getElementById('financeSummary');
    el.innerHTML = `
        <div class="finance-summary-card">
            <h3>Total Sales</h3>
            <div class="finance-summary-value">${formatCurrency(totalSales)}</div>
            <div class="finance-summary-note">
                Paid: ${formatCurrency(paidSales)}<br>
                Unpaid+Pending: ${formatCurrency(unpaidPendingSales)}
            </div>
        </div>
        <div class="finance-summary-card">
            <h3>Total Purchases</h3>
            <div class="finance-summary-value">${formatCurrency(totalPurchases)}</div>
            <div class="finance-summary-note">
                Paid: ${formatCurrency(paidPurchases)}<br>
                Unpaid+Pending: ${formatCurrency(unpaidPendingPurchases)}
            </div>
        </div>
        <div class="finance-summary-card">
            <h3>Expenses</h3>
            <div class="finance-summary-value">${formatCurrency(totalExpenses)}</div>
            <div class="finance-summary-note">
                Paid: ${formatCurrency(paidExpenses)}<br>
                Unpaid+Pending: ${formatCurrency(unpaidPendingExpenses)}
            </div>
        </div>
        <div class="finance-summary-card">
            <h3>Net Profit</h3>
            <div class="finance-summary-value">${formatCurrency(netProfit)}</div>
            <div class="finance-summary-note">&nbsp;</div>
        </div>
        <div class="finance-summary-card">
            <h3>Invoices Status</h3>
            <div class="finance-summary-value">
                Total: ${paidCount + unpaidCount + pendingCount}
                <div class="invoice-status-stack">
                    <div>Paid: ${paidCount}</div>
                    <div>Pending: ${pendingCount}</div>
                    <div>Unpaid: ${unpaidCount}</div>
                </div>
            </div>
            <div class="finance-summary-note">&nbsp;</div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", function() {
    let invoices = [];
    try { invoices = JSON.parse(localStorage.getItem('invoiceLog') || '[]'); } catch(e) {}
    renderFinanceSummary(invoices);

    document.getElementById('filterDateBtn').onclick = function() {
        const start = document.getElementById('filterStartDate').value;
        const end = document.getElementById('filterEndDate').value;
        let filtered = filterInvoicesByDate(invoices, start, end);
        renderFinanceSummary(filtered);
    };

    document.getElementById('clearFilterBtn').onclick = function() {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        renderFinanceSummary(invoices);
    };
});