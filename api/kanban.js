// FLOWOPS ERP - MANUFACTURING PIPELINE & KANBAN API
// Endpoint: GET/POST /api/kanban

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const columns = [
    {
      id: 'staged',
      title: 'Staged / Raw Materials',
      cards: [
        { id: 'WO-8841', part: 'Carbon-Fiber Enclosure Shell', qty: '450 units', priority: 'HIGH', stage: 'staged' },
        { id: 'WO-8842', part: 'Titanium Fastener Array M4', qty: '2,400 units', priority: 'NORMAL', stage: 'staged' }
      ]
    },
    {
      id: 'active',
      title: 'Active CNC Assembly',
      cards: [
        { id: 'WO-8839', part: 'High-Torque Actuator Core', qty: '120 units', priority: 'CRITICAL', stage: 'active' },
        { id: 'WO-8840', part: 'Sensor Telemetry PCB Module', qty: '600 units', priority: 'NORMAL', stage: 'active' }
      ]
    },
    {
      id: 'qa',
      title: 'QA Inspection Gate',
      cards: [
        { id: 'WO-8837', part: 'Thermal Heat Pipe Heatsinks', qty: '300 units', priority: 'NORMAL', stage: 'qa' }
      ]
    },
    {
      id: 'dispatched',
      title: 'Dispatched / Warehouse',
      cards: [
        { id: 'WO-8835', part: 'Optic Laser Diode Coupler', qty: '80 units', priority: 'COMPLETED', stage: 'dispatched' }
      ]
    }
  ];

  return res.status(200).json({
    success: true,
    columns: columns,
    activeWorkOrders: 6,
    cogsEfficiency: '+41.2% reduction in cycle waste',
    lastSync: new Date().toISOString()
  });
};
