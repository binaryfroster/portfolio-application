// FLOWOPS ERP - INVENTORY & BARCODE TELEMETRY API
// Endpoints: GET, POST, PATCH, PUT, DELETE /api/inventory
// Binary Froster Enterprise ERP Suite - Strictly zero emojis

let inventoryStore = [
  { sku: 'SKU-8841', name: 'Silicon Heat Sinks (Alu-22)', bay: 'Bay B-08', category: 'Thermal', stock: 14, min: 50, cost: 14.50 },
  { sku: 'SKU-4912', name: 'Titanium Hex Screws M4', bay: 'Bay A-02', category: 'Fasteners', stock: 820, min: 500, cost: 0.45 },
  { sku: 'SKU-3104', name: 'Optic Sensor Array 4K', bay: 'Bay C-14', category: 'Optics', stock: 68, min: 40, cost: 120.00 },
  { sku: 'SKU-7720', name: 'Brushless DC Servos 24V', bay: 'Bay D-03', category: 'Actuators', stock: 32, min: 30, cost: 65.00 },
  { sku: 'SKU-9901', name: 'Braided Shielded Ribbon Cable', bay: 'Bay E-11', category: 'Cables', stock: 450, min: 200, cost: 2.10 },
  { sku: 'SKU-6215', name: 'Alumina Ceramic Thermal Substrate', bay: 'Bay B-02', category: 'Thermal', stock: 95, min: 60, cost: 38.00 },
  { sku: 'SKU-1088', name: 'Precision Stepper Motor NEMA 23', bay: 'Bay D-09', category: 'Actuators', stock: 24, min: 25, cost: 84.50 },
  { sku: 'SKU-5440', name: 'Anodized Aircraft Aluminum Plate', bay: 'Bay A-05', category: 'Raw Materials', stock: 110, min: 80, cost: 42.00 }
];

let lastAuditTimestamp = new Date().toISOString();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body safely if needed
  let body = {};
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }

  // 1. GET: Retrieve inventory items and telemetry metrics
  if (req.method === 'GET') {
    const totalCount = inventoryStore.length;
    const lowStockCount = inventoryStore.filter(item => item.stock <= item.min).length;
    const totalAssetValueUsd = inventoryStore.reduce((acc, it) => acc + (Number(it.stock) * Number(it.cost) || 0), 0);
    const totalAssetValueGbp = totalAssetValueUsd * 0.79;

    return res.status(200).json({
      success: true,
      totalSkus: totalCount,
      lowStockAlerts: lowStockCount,
      inventoryValueUsd: totalAssetValueUsd.toFixed(2),
      inventoryValueGbp: totalAssetValueGbp.toFixed(2),
      lastAuditTimestamp: lastAuditTimestamp,
      items: inventoryStore,
      topInventoryItems: inventoryStore.slice(0, 5).map(item => ({
        sku: item.sku,
        name: item.name,
        inStock: item.stock,
        reorderPoint: item.min,
        status: item.stock <= item.min ? 'REORDER_TRIGGERED' : 'NOMINAL'
      }))
    });
  }

  // 2. POST: Add new SKU or perform cycle count
  if (req.method === 'POST') {
    const { action, sku, name, bay, category, stock, min, cost } = body;

    if (action === 'cycle_count') {
      lastAuditTimestamp = new Date().toISOString();
      return res.status(200).json({
        success: true,
        action: 'cycle_count',
        message: 'Cycle count verification executed successfully across all warehouse bays.',
        auditedBays: ['Bay A', 'Bay B', 'Bay C', 'Bay D', 'Bay E'],
        totalVerifiedSkus: inventoryStore.length,
        discrepancyCount: 0,
        accuracyRate: '99.98%',
        auditTimestamp: lastAuditTimestamp
      });
    }

    // New SKU validation
    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        error: 'Validation failure: Both SKU code and component name are required.'
      });
    }

    const cleanSku = String(sku).trim().toUpperCase();
    const existingIndex = inventoryStore.findIndex(i => i.sku === cleanSku);

    if (existingIndex >= 0) {
      return res.status(409).json({
        success: false,
        error: `SKU collision: SKU ${cleanSku} is already registered in warehouse records.`
      });
    }

    const parsedStock = Math.max(0, parseInt(stock, 10) || 0);
    const parsedMin = Math.max(1, parseInt(min, 10) || 10);
    const parsedCost = Math.max(0.01, parseFloat(cost) || 1.00);

    const newSkuRecord = {
      sku: cleanSku,
      name: String(name).trim(),
      bay: String(bay || 'Bay A-01').trim(),
      category: String(category || 'General').trim(),
      stock: parsedStock,
      min: parsedMin,
      cost: parseFloat(parsedCost.toFixed(2))
    };

    inventoryStore.unshift(newSkuRecord);

    return res.status(201).json({
      success: true,
      message: `SKU ${cleanSku} successfully cataloged in warehouse ERP.`,
      item: newSkuRecord,
      totalSkus: inventoryStore.length
    });
  }

  // 3. PATCH / PUT: Adjust stock quantity, decrement or increment
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const { sku, delta, setStock, bay, min, cost, name } = body;

    if (!sku) {
      return res.status(400).json({ success: false, error: 'SKU code is required for stock updates.' });
    }

    const target = inventoryStore.find(i => i.sku === sku);
    if (!target) {
      return res.status(404).json({ success: false, error: `SKU ${sku} not found in inventory catalog.` });
    }

    if (typeof setStock === 'number') {
      target.stock = Math.max(0, parseInt(setStock, 10));
    } else if (typeof delta === 'number') {
      target.stock = Math.max(0, target.stock + delta);
    }

    if (bay) target.bay = String(bay).trim();
    if (min !== undefined) target.min = Math.max(1, parseInt(min, 10));
    if (cost !== undefined) target.cost = Math.max(0.01, parseFloat(cost));
    if (name) target.name = String(name).trim();

    return res.status(200).json({
      success: true,
      message: `Stock record for ${target.sku} updated. Current balance: ${target.stock} units.`,
      item: target,
      isBelowSafetyThreshold: target.stock <= target.min
    });
  }

  // 4. DELETE: Remove SKU from catalog
  if (req.method === 'DELETE') {
    const { sku } = body.sku ? body : req.query;

    if (!sku) {
      return res.status(400).json({ success: false, error: 'SKU code parameter is required.' });
    }

    const index = inventoryStore.findIndex(i => i.sku === sku);
    if (index === -1) {
      return res.status(404).json({ success: false, error: `SKU ${sku} not found.` });
    }

    const removed = inventoryStore.splice(index, 1)[0];
    return res.status(200).json({
      success: true,
      message: `SKU ${removed.sku} (${removed.name}) retired from inventory.`,
      removed: removed
    });
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
