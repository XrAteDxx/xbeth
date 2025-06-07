// Example data, replace with fetch/ajax as needed
const mostSoldItems = [
    { name: "Item X", sold: 1400 },
    { name: "Item Y", sold: 1200 },
    { name: "Item Z", sold: 1100 }
];

const topCustomers = [
    { name: "Alice Johnson", value: "$8,500" },
    { name: "Bob Smith", value: "$7,950" },
    { name: "Carlos Rivera", value: "$6,300" }
];

function renderMostSoldItems() {
    const ul = document.getElementById('mostSoldItems');
    mostSoldItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-box"></i> <strong>${item.name}</strong> <span style="color:#38bdf8;">(${item.sold} sold)</span>`;
        ul.appendChild(li);
    });
}

function renderTopCustomers() {
    const ul = document.getElementById('topCustomers');
    topCustomers.forEach(cust => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-user"></i> <strong>${cust.name}</strong> <span style="color:#059669;">${cust.value}</span>`;
        ul.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderMostSoldItems();
    renderTopCustomers();
});