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
    items: [
      { sku: 'SKU-8841', name: 'Silicon Heat Sinks (Alu-22)', bay: 'Bay B-08', stock: 14, min: 50, cost: 14.50 },
      { sku: 'SKU-4912', name: 'Titanium Hex Screws M4', bay: 'Bay A-02', stock: 820, min: 500, cost: 0.45 },
      { sku: 'SKU-3104', name: 'Optic Sensor Array 4K', bay: 'Bay C-14', stock: 68, min: 40, cost: 120.00 },
      { sku: 'SKU-7720', name: 'Brushless DC Servos 24V', bay: 'Bay D-03', stock: 32, min: 30, cost: 65.00 },
      { sku: 'SKU-9901', name: 'Braided Shielded Ribbon Cable', bay: 'Bay A-11', stock: 450, min: 200, cost: 2.10 }
    ],
    topInventoryItems: [
      { sku: 'SKU-8841', name: 'Silicon Heat Sinks (Alu-22)', inStock: 14, reorderPoint: 50, status: 'REORDER_TRIGGERED' },
      { sku: 'SKU-4912', name: 'Titanium Hex Screws M4', inStock: 820, reorderPoint: 500, status: 'NOMINAL' },
      { sku: 'SKU-3104', name: 'Optic Sensor Array 4K', inStock: 68, reorderPoint: 40, status: 'NOMINAL' }
    ]
  });
};

