// FLOWOPS ERP - INVENTORY & BARCODE TELEMETRY API
// Endpoint: GET /api/inventory

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    success: true,
    totalSkus: 1420,
    lowStockAlerts: 2,
    inventoryValueGbp: '£1,420,800',
    topInventoryItems: [
      { sku: 'SKU-CFE-001', name: 'Carbon-Fiber Enclosures', inStock: 450, reorderPoint: 100, status: 'NOMINAL' },
      { sku: 'SKU-ACT-089', name: 'High-Torque Actuator Core', inStock: 34, reorderPoint: 50, status: 'REORDER_TRIGGERED' },
      { sku: 'SKU-PCB-602', name: 'Sensor Telemetry PCB Module', inStock: 890, reorderPoint: 200, status: 'NOMINAL' }
    ]
  });
};
