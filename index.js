const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: 'xrated',
    database: 'my_shop_dashboard'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// ----------- CUSTOMERS API -----------

// Get all customers
app.get('/api/customers', (req, res) => {
    db.query('SELECT * FROM customers', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a customer
app.post('/api/customers', (req, res) => {
    const { name, phone, address, total_spend } = req.body;
    db.query(
        'INSERT INTO customers (name, phone, address, total_spend) VALUES (?, ?, ?, ?)',
        [name, phone, address, total_spend || 0],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, name, phone, address, total_spend: total_spend || 0 });
        }
    );
});

// Update a customer
app.put('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const { name, phone, address, total_spend } = req.body;
    db.query(
        'UPDATE customers SET name=?, phone=?, address=?, total_spend=? WHERE id=?',
        [name, phone, address, total_spend || 0, customerId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Customer not found" });
            res.json({ id: customerId, name, phone, address, total_spend });
        }
    );
});

// Delete a customer
app.delete('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    db.query('DELETE FROM customers WHERE id = ?', [customerId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Customer not found" });
        res.status(204).send();
    });
});

// ----------- SUPPLIERS API -----------

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
    db.query('SELECT * FROM suppliers', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a supplier
app.post('/api/suppliers', (req, res) => {
    const { name, phone, address, total_purchase, total_debt } = req.body;
    db.query(
        'INSERT INTO suppliers (name, phone, address, total_purchase, total_debt) VALUES (?, ?, ?, ?, ?)',
        [name, phone, address, total_purchase || 0, total_debt || 0],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, name, phone, address, total_purchase: total_purchase || 0, total_debt: total_debt || 0 });
        }
    );
});

// Update a supplier
app.put('/api/suppliers/:id', (req, res) => {
    const supplierId = req.params.id;
    const { name, phone, address, total_purchase, total_debt } = req.body;
    db.query(
        'UPDATE suppliers SET name=?, phone=?, address=?, total_purchase=?, total_debt=? WHERE id=?',
        [name, phone, address, total_purchase || 0, total_debt || 0, supplierId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Supplier not found" });
            res.json({ id: supplierId, name, phone, address, total_purchase, total_debt });
        }
    );
});

// Delete a supplier
app.delete('/api/suppliers/:id', (req, res) => {
    const supplierId = req.params.id;
    db.query('DELETE FROM suppliers WHERE id = ?', [supplierId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Supplier not found" });
        res.status(204).send();
    });
});

// ----------- INVENTORY API -----------

// Get all inventory items
app.get('/api/inventory', (req, res) => {
    db.query('SELECT * FROM inventory', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add an inventory item
app.post('/api/inventory', (req, res) => {
    const { name, quantity, description } = req.body;
    db.query(
        'INSERT INTO inventory (name, quantity, description) VALUES (?, ?, ?)',
        [name, quantity || 0, description || ""],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, name, quantity: quantity || 0, description: description || "" });
        }
    );
});

// Update an inventory item
app.put('/api/inventory/:id', (req, res) => {
    const inventoryId = req.params.id;
    const { name, quantity, description } = req.body;
    db.query(
        'UPDATE inventory SET name=?, quantity=?, description=? WHERE id=?',
        [name, quantity || 0, description || "", inventoryId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Inventory item not found" });
            res.json({ id: inventoryId, name, quantity, description });
        }
    );
});

// Delete an inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const inventoryId = req.params.id;
    db.query('DELETE FROM inventory WHERE id = ?', [inventoryId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Inventory item not found" });
        res.status(204).send();
    });
});

// ----------- INVOICES API (invoice_log/invoice_log_item) -----------

// Get all invoices (with items)
app.get('/api/invoices', (req, res) => {
    db.query('SELECT * FROM invoice_log', (err, invoices) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!invoices.length) return res.json([]);

        const invoiceIds = invoices.map(inv => inv.id);
        if (!invoiceIds.length) return res.json(invoices);

        db.query('SELECT * FROM invoice_log_item WHERE invoice_id IN (?)', [invoiceIds], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });

            // Attach items to invoices
            const itemsByInvoice = {};
            items.forEach(itm => {
                if (!itemsByInvoice[itm.invoice_id]) itemsByInvoice[itm.invoice_id] = [];
                itemsByInvoice[itm.invoice_id].push(itm);
            });
            const result = invoices.map(inv => ({
                ...inv,
                invoice_items: itemsByInvoice[inv.id] || []
            }));
            res.json(result);
        });
    });
});

// Add an invoice (and items)
app.post('/api/invoices', (req, res) => {
    const { invoice, items } = req.body;
    if (!invoice || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Invoice and items required" });
    }
    db.query(
        'INSERT INTO invoice_log (type, invoice_date, status, paid_amount, total_amount, customer_id, supplier_id, expenses_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            invoice.type,
            invoice.invoice_date,
            invoice.status,
            invoice.paid_amount,
            invoice.total_amount,
            invoice.customer_id || null,
            invoice.supplier_id || null,
            invoice.expenses_description || null
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const invoiceId = result.insertId;
            if (!items.length) return res.json({ id: invoiceId });
            const values = items.map(item =>
                [
                    invoiceId,
                    item.product_id || null,
                    item.quantity,
                    item.unit_price,
                    item.total_price,
                    item.description || null
                ]
            );
            db.query(
                'INSERT INTO invoice_log_item (invoice_id, product_id, quantity, unit_price, total_price, description) VALUES ?',
                [values],
                (err2, result2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json({ id: invoiceId });
                }
            );
        }
    );
});

// Delete an invoice (and its items)
app.delete('/api/invoices/:id', (req, res) => {
    const invoiceId = req.params.id;
    db.query('DELETE FROM invoice_log_item WHERE invoice_id=?', [invoiceId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('DELETE FROM invoice_log WHERE id=?', [invoiceId], (err2, result2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (result2.affectedRows === 0) return res.status(404).json({ error: "Invoice not found" });
            res.status(204).send();
        });
    });
});

// ----------- SERVER START -----------
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));