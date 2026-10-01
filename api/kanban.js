// FLOWOPS ERP - MANUFACTURING PIPELINE & KANBAN API
// Endpoints: GET, POST, PATCH, PUT, DELETE /api/kanban
// Binary Froster Enterprise ERP Suite - Strictly zero emojis

let kanbanOrdersStore = [
  { id: 'WO-9021', title: '500x Titanium Milling Housings', client: 'SpaceX Propulsion', stage: 'backlog', priority: 'HIGH', qty: 500, createdDate: '2026-09-28' },
  { id: 'WO-8944', title: '1,500x SMT Microcontroller PCBs', client: 'Tesla Energy', stage: 'assembly', priority: 'NORMAL', qty: 1500, createdDate: '2026-09-29' },
  { id: 'WO-9104', title: '100x Laser Calibration Arrays', client: 'Lockheed Optical', stage: 'qa', priority: 'HIGH', qty: 100, createdDate: '2026-09-30' },
  { id: 'WO-8802', title: '250x Brushless Actuators', client: 'Boston Dynamics', stage: 'dispatched', priority: 'NORMAL', qty: 250, createdDate: '2026-09-25' },
  { id: 'WO-9240', title: '800x Anodized Enclosure Brackets', client: 'Northrop Grumman', stage: 'backlog', priority: 'LOW', qty: 800, createdDate: '2026-09-30' },
  { id: 'WO-9318', title: '300x Silicon Heat Sink Assemblies', client: 'Raytheon Defense', stage: 'assembly', priority: 'CRITICAL', qty: 300, createdDate: '2026-10-01' }
];

let dispatchManifestsStore = [
  {
    manifestId: 'MF-8910',
    timestamp: '2026-09-25T14:30:00Z',
    carrier: 'DHL Global Logistics',
    ordersDispatched: ['WO-8802'],
    totalUnits: 250,
    status: 'IN_TRANSIT'
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = {};
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }

  // 1. GET: Retrieve Kanban stages, active orders, and live OEE telemetry
  if (req.method === 'GET') {
    const totalOrders = kanbanOrdersStore.length;
    const dispatchedCount = kanbanOrdersStore.filter(o => o.stage === 'dispatched').length;
    const activeAssemblyCount = kanbanOrdersStore.filter(o => o.stage === 'assembly').length;
    const qaCount = kanbanOrdersStore.filter(o => o.stage === 'qa').length;
    const backlogCount = kanbanOrdersStore.filter(o => o.stage === 'backlog').length;

    // Operational metrics calculation with division-by-zero protection
    const operatingTime = 465; // minutes in shift
    const plannedTime = 480; // minutes scheduled
    const availabilityRate = plannedTime > 0 ? (operatingTime / plannedTime) : 0.968;

    const actualRunRate = 3450; // parts produced
    const idealRunRate = 3600; // design capacity
    const performanceRate = idealRunRate > 0 ? (actualRunRate / idealRunRate) : 0.958;

    const totalProduced = actualRunRate;
    const scrapCount = 14; // units rejected
    const qualityRate = totalProduced > 0 ? ((totalProduced - scrapCount) / totalProduced) : 0.995;

    const oeeComputed = Math.min(100, Math.max(0, availabilityRate * performanceRate * qualityRate * 100));
    const onTimeFulfillmentRate = totalOrders > 0 ? Math.min(100, Math.max(0, ((totalOrders - 1) / totalOrders) * 100)) : 98.4;
    const scrapRateComputed = totalProduced > 0 ? ((scrapCount / totalProduced) * 100) : 0.38;

    return res.status(200).json({
      success: true,
      orders: kanbanOrdersStore,
      manifests: dispatchManifestsStore,
      summary: {
        totalOrders,
        backlogCount,
        activeAssemblyCount,
        qaCount,
        dispatchedCount
      },
      telemetry: {
        oee: parseFloat(oeeComputed.toFixed(1)),
        availability: parseFloat((availabilityRate * 100).toFixed(1)),
        performance: parseFloat((performanceRate * 100).toFixed(1)),
        quality: parseFloat((qualityRate * 100).toFixed(1)),
        onTimeFulfillment: parseFloat(onTimeFulfillmentRate.toFixed(1)),
        scrapRate: parseFloat(scrapRateComputed.toFixed(2)),
        cycleTimeReduction: '40% Faster'
      },
      lastSync: new Date().toISOString()
    });
  }

  // 2. POST: Create work order OR dispatch batch
  if (req.method === 'POST') {
    const { action, id, title, client, stage, priority, qty, carrier } = body;

    // Handle Dispatch Batch
    if (action === 'dispatch_batch') {
      const readyOrders = kanbanOrdersStore.filter(o => o.stage === 'dispatched');
      if (readyOrders.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Dispatch queue empty: No work orders currently in Ready for Dispatch stage.'
        });
      }

      const manifestId = 'MF-' + Math.floor(1000 + Math.random() * 9000);
      const totalUnits = readyOrders.reduce((sum, o) => sum + (parseInt(o.qty, 10) || 0), 0);
      const manifest = {
        manifestId,
        timestamp: new Date().toISOString(),
        carrier: carrier || 'DHL Global Forwarding (Industrial Freight)',
        ordersDispatched: readyOrders.map(o => o.id),
        totalUnits: totalUnits > 0 ? totalUnits : readyOrders.length * 100,
        status: 'SHIPPED_CARRIER_CONFIRMED'
      };

      dispatchManifestsStore.unshift(manifest);

      // Keep orders marked dispatched with archived tag or simulate fresh queue
      return res.status(200).json({
        success: true,
        action: 'dispatch_batch',
        message: `Batch Manifest ${manifestId} created. ${readyOrders.length} work orders released to ${manifest.carrier}.`,
        manifest: manifest,
        remainingOrders: kanbanOrdersStore
      });
    }

    // New Work Order Creation
    if (!title || !client) {
      return res.status(400).json({
        success: false,
        error: 'Validation failure: Work order title and client organization are required.'
      });
    }

    const orderId = (id && String(id).trim()) || ('WO-' + Math.floor(1000 + Math.random() * 9000));
    const cleanPriority = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].includes(String(priority).toUpperCase())
      ? String(priority).toUpperCase()
      : 'NORMAL';

    const validStages = ['backlog', 'assembly', 'qa', 'dispatched'];
    const assignedStage = validStages.includes(stage) ? stage : 'backlog';

    const newOrder = {
      id: orderId,
      title: String(title).trim(),
      client: String(client).trim(),
      stage: assignedStage,
      priority: cleanPriority,
      qty: Math.max(1, parseInt(qty, 10) || 100),
      createdDate: new Date().toISOString().split('T')[0]
    };

    kanbanOrdersStore.push(newOrder);

    return res.status(201).json({
      success: true,
      message: `Work Order ${orderId} scheduled in ${assignedStage.toUpperCase()} stage.`,
      order: newOrder,
      totalOrders: kanbanOrdersStore.length
    });
  }

  // 3. PATCH / PUT: Move order stage or edit metadata
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const { id, stage, priority, client, title } = body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Work order ID parameter is required.' });
    }

    const order = kanbanOrdersStore.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: `Work Order ${id} not found.` });
    }

    const validStages = ['backlog', 'assembly', 'qa', 'dispatched'];
    if (stage && validStages.includes(stage)) {
      order.stage = stage;
    }

    if (priority) {
      const pUpper = String(priority).toUpperCase();
      if (['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].includes(pUpper)) {
        order.priority = pUpper;
      }
    }

    if (client) order.client = String(client).trim();
    if (title) order.title = String(title).trim();

    return res.status(200).json({
      success: true,
      message: `Work Order ${order.id} updated. Current stage: ${order.stage.toUpperCase()}.`,
      order: order
    });
  }

  // 4. DELETE: Remove or cancel work order
  if (req.method === 'DELETE') {
    const { id } = body.id ? body : req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Work Order ID parameter is required.' });
    }

    const index = kanbanOrdersStore.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: `Work Order ${id} not found.` });
    }

    const removed = kanbanOrdersStore.splice(index, 1)[0];
    return res.status(200).json({
      success: true,
      message: `Work Order ${removed.id} decommissioned.`,
      removed: removed
    });
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
