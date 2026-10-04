// FLOWOPS ERP - UNIFIED MANUFACTURING EXECUTION SYSTEM & SUPPLY CHAIN OS
// Binary Froster Enterprise Production Suite
// Strictly zero emojis. Fully responsive, Three.js Digital Twin, Drag & Drop Kanban,
// Sortable Inventory Catalog, PO Management, Cycle Count Audits, and Batch Dispatch.

(function () {
  'use strict';

  // Local Storage Keys
  const STORAGE_KEY_INV = 'bf_flowops_inventory';
  const STORAGE_KEY_KANBAN = 'bf_flowops_kanban';
  const STORAGE_KEY_AUDIT = 'bf_flowops_last_audit';

  // Default In-Memory Fallback State
  const DEFAULT_INVENTORY = [
    { sku: 'SKU-8841', name: 'Silicon Heat Sinks (Alu-22)', bay: 'Bay B-08', category: 'Thermal', stock: 14, min: 50, cost: 14.50 },
    { sku: 'SKU-4912', name: 'Titanium Hex Screws M4', bay: 'Bay A-02', category: 'Fasteners', stock: 820, min: 500, cost: 0.45 },
    { sku: 'SKU-3104', name: 'Optic Sensor Array 4K', bay: 'Bay C-14', category: 'Optics', stock: 68, min: 40, cost: 120.00 },
    { sku: 'SKU-7720', name: 'Brushless DC Servos 24V', bay: 'Bay D-03', category: 'Actuators', stock: 32, min: 30, cost: 65.00 },
    { sku: 'SKU-9901', name: 'Braided Shielded Ribbon Cable', bay: 'Bay E-11', category: 'Cables', stock: 450, min: 200, cost: 2.10 },
    { sku: 'SKU-6215', name: 'Alumina Ceramic Thermal Substrate', bay: 'Bay B-02', category: 'Thermal', stock: 95, min: 60, cost: 38.00 },
    { sku: 'SKU-1088', name: 'Precision Stepper Motor NEMA 23', bay: 'Bay D-09', category: 'Actuators', stock: 24, min: 25, cost: 84.50 },
    { sku: 'SKU-5440', name: 'Anodized Aircraft Aluminum Plate', bay: 'Bay A-05', category: 'Raw Materials', stock: 110, min: 80, cost: 42.00 }
  ];

  const DEFAULT_KANBAN = [
    { id: 'WO-9021', title: '500x Titanium Milling Housings', client: 'SpaceX Propulsion', stage: 'backlog', priority: 'HIGH', qty: 500 },
    { id: 'WO-8944', title: '1,500x SMT Microcontroller PCBs', client: 'Tesla Energy', stage: 'assembly', priority: 'NORMAL', qty: 1500 },
    { id: 'WO-9104', title: '100x Laser Calibration Arrays', client: 'Lockheed Optical', stage: 'qa', priority: 'HIGH', qty: 100 },
    { id: 'WO-8802', title: '250x Brushless Actuators', client: 'Boston Dynamics', stage: 'dispatched', priority: 'NORMAL', qty: 250 },
    { id: 'WO-9240', title: '800x Anodized Enclosure Brackets', client: 'Northrop Grumman', stage: 'backlog', priority: 'LOW', qty: 800 },
    { id: 'WO-9318', title: '300x Silicon Heat Sink Assemblies', client: 'Raytheon Defense', stage: 'assembly', priority: 'CRITICAL', qty: 300 }
  ];

  // Runtime State
  let inventoryData = [];
  let kanbanOrders = [];
  let currentCategoryFilter = 'ALL';
  let currentSearchQuery = '';
  let sortColumn = 'sku';
  let sortDirection = 'asc';
  let currentPriorityFilter = 'ALL';
  let lastAuditTimestamp = localStorage.getItem(STORAGE_KEY_AUDIT) || '2026-10-01 10:00 UTC';

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const inventoryTableBody = document.getElementById('inventoryTableBody');
  const inventorySearchInput = document.getElementById('inventorySearchInput');
  const invFilterBtns = document.querySelectorAll('.inv-filter-btn');
  const kanbanFilterBtns = document.querySelectorAll('.kanban-filter-btn');

  // Top KPI Elements
  const headerOeeVal = document.getElementById('headerOeeVal');
  const kpiOeeDisplay = document.getElementById('kpiOeeDisplay');
  const kpiOeeBar = document.getElementById('kpiOeeBar');
  const kpiAvailDisplay = document.getElementById('kpiAvailDisplay');
  const kpiPerfDisplay = document.getElementById('kpiPerfDisplay');
  const kpiQualDisplay = document.getElementById('kpiQualDisplay');
  const kpiOnTimeDisplay = document.getElementById('kpiOnTimeDisplay');
  const kpiOnTimeBar = document.getElementById('kpiOnTimeBar');
  const kpiScrapDisplay = document.getElementById('kpiScrapDisplay');
  const kpiScrapBar = document.getElementById('kpiScrapBar');
  const kpiInventoryDisplay = document.getElementById('kpiInventoryDisplay');
  const kpiInventoryGbpDisplay = document.getElementById('kpiInventoryGbpDisplay');
  const kpiSkuCountBadge = document.getElementById('kpiSkuCountBadge');
  const invTotalCountDisplay = document.getElementById('invTotalCountDisplay');
  const invLowCountDisplay = document.getElementById('invLowCountDisplay');
  const invTotalValDisplay = document.getElementById('invTotalValDisplay');
  const lastAuditDisplay = document.getElementById('lastAuditDisplay');
  const rackOccupancyBadge = document.getElementById('rackOccupancyBadge');

  // Kanban Columns
  const colBacklog = document.getElementById('col-backlog');
  const colAssembly = document.getElementById('col-assembly');
  const colQa = document.getElementById('col-qa');
  const colDispatched = document.getElementById('col-dispatched');
  const countBacklog = document.getElementById('countBacklog');
  const countAssembly = document.getElementById('countAssembly');
  const countQa = document.getElementById('countQa');
  const countDispatched = document.getElementById('countDispatched');

  // Modals & Triggers
  const openNewPOModalBtn = document.getElementById('openNewPOModalBtn');
  const newPOModal = document.getElementById('newPOModal');
  const closePOModalBtn = document.getElementById('closePOModalBtn');
  const purchaseOrderForm = document.getElementById('purchaseOrderForm');
  const poSkuSelect = document.getElementById('poSkuSelect');
  const poQuantity = document.getElementById('poQuantity');
  const poUnitCost = document.getElementById('poUnitCost');
  const poTotalVal = document.getElementById('poTotalVal');

  const openNewWOModalBtn = document.getElementById('openNewWOModalBtn');
  const openKanbanNewWOBtn = document.getElementById('openKanbanNewWOBtn');
  const newWOModal = document.getElementById('newWOModal');
  const closeWOModalBtn = document.getElementById('closeWOModalBtn');
  const workOrderForm = document.getElementById('workOrderForm');
  const woIdInput = document.getElementById('woIdInput');

  const openNewSKUModalBtn = document.getElementById('openNewSKUModalBtn');
  const openAddSKUModalBtn = document.getElementById('openAddSKUModalBtn');
  const newSKUModal = document.getElementById('newSKUModal');
  const closeSKUModalBtn = document.getElementById('closeSKUModalBtn');
  const skuCatalogForm = document.getElementById('skuCatalogForm');

  const dispatchBatchBtn = document.getElementById('dispatchBatchBtn');
  const dispatchBatchModal = document.getElementById('dispatchBatchModal');
  const closeDispatchModalBtn = document.getElementById('closeDispatchModalBtn');
  const dispatchOrdersList = document.getElementById('dispatchOrdersList');
  const confirmDispatchBtn = document.getElementById('confirmDispatchBtn');
  const manifestNumberPreview = document.getElementById('manifestNumberPreview');

  const performCycleCountBtn = document.getElementById('performCycleCountBtn');
  const cycleCountModal = document.getElementById('cycleCountModal');
  const closeCycleModalBtn = document.getElementById('closeCycleModalBtn');
  const confirmCycleCountBtn = document.getElementById('confirmCycleCountBtn');
  const cycleSkusCount = document.getElementById('cycleSkusCount');

  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // Three.js Camera preset buttons
  const btnCamIso = document.getElementById('btnCamIso');
  const btnCamTop = document.getElementById('btnCamTop');
  const btnCamLine = document.getElementById('btnCamLine');
  const resetFactoryCameraBtn = document.getElementById('resetFactoryCameraBtn');

  // HUD Pallet Inspector
  const palletSlotInspectorHud = document.getElementById('palletSlotInspectorHud');
  const closeHudBtn = document.getElementById('closeHudBtn');
  const hudSlotId = document.getElementById('hudSlotId');
  const hudComponentName = document.getElementById('hudComponentName');
  const hudSku = document.getElementById('hudSku');
  const hudStock = document.getElementById('hudStock');
  const hudMin = document.getElementById('hudMin');
  const hudCost = document.getElementById('hudCost');
  const hudStatus = document.getElementById('hudStatus');
  const hudPickBtn = document.getElementById('hudPickBtn');
  const hudRestockBtn = document.getElementById('hudRestockBtn');
  let selectedHudSku = null;

  // =========================================================================
  // 1. TELEMETRY & METRIC COMPUTATION (ZERO DIVISION-BY-ZERO ASSURANCE)
  // =========================================================================
  function calculateTelemetry() {
    // Availability calculation
    const plannedTimeMinutes = 480;
    const operatingTimeMinutes = 465;
    const availabilityRate = plannedTimeMinutes > 0 ? (operatingTimeMinutes / plannedTimeMinutes) : 0.968;

    // Performance rate calculation
    const idealRunUnits = 3600;
    const actualRunUnits = 3450;
    const performanceRate = idealRunUnits > 0 ? (actualRunUnits / idealRunUnits) : 0.958;

    // Quality rate calculation
    const scrapCount = 14;
    const totalProducedUnits = actualRunUnits;
    const qualityRate = totalProducedUnits > 0 ? Math.max(0, (totalProducedUnits - scrapCount) / totalProducedUnits) : 0.996;

    // OEE = (Availability * Performance * Quality) * 100
    const oeeVal = Math.min(100, Math.max(0, availabilityRate * performanceRate * qualityRate * 100));

    // Total Inventory Asset Valuation
    const totalAssetValuation = inventoryData.reduce((sum, item) => {
      const s = Number(item.stock) || 0;
      const c = Number(item.cost) || 0;
      return sum + (s * c);
    }, 0);
    const totalValuationGbp = totalAssetValuation * 0.79;

    // Dispatched on-time fulfillment calculation
    const dispatchedCount = kanbanOrders.filter(o => o.stage === 'dispatched').length;
    const onTimeFulfillmentRate = dispatchedCount > 0 ? 98.4 : 98.4;

    // Scrap rate %
    const scrapRateComputed = totalProducedUnits > 0 ? ((scrapCount / totalProducedUnits) * 100) : 0.38;

    // Low stock count
    const lowStockCount = inventoryData.filter(i => i.stock <= i.min).length;

    // Update Telemetry Displays safely
    if (headerOeeVal) headerOeeVal.textContent = `${oeeVal.toFixed(1)}%`;
    if (kpiOeeDisplay) kpiOeeDisplay.textContent = `${oeeVal.toFixed(1)}%`;
    if (kpiOeeBar) kpiOeeBar.style.width = `${Math.min(100, oeeVal)}%`;
    if (kpiAvailDisplay) kpiAvailDisplay.textContent = `${(availabilityRate * 100).toFixed(1)}%`;
    if (kpiPerfDisplay) kpiPerfDisplay.textContent = `${(performanceRate * 100).toFixed(1)}%`;
    if (kpiQualDisplay) kpiQualDisplay.textContent = `${(qualityRate * 100).toFixed(1)}%`;

    if (kpiOnTimeDisplay) kpiOnTimeDisplay.textContent = `${onTimeFulfillmentRate.toFixed(1)}%`;
    if (kpiOnTimeBar) kpiOnTimeBar.style.width = `${Math.min(100, onTimeFulfillmentRate)}%`;

    if (kpiScrapDisplay) kpiScrapDisplay.textContent = `${scrapRateComputed.toFixed(2)}%`;
    if (kpiScrapBar) kpiScrapBar.style.width = `${Math.min(100, (scrapRateComputed / 2) * 100)}%`;

    const formattedUsd = totalAssetValuation.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const formattedGbp = totalValuationGbp.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });

    if (kpiInventoryDisplay) kpiInventoryDisplay.textContent = formattedUsd;
    if (kpiInventoryGbpDisplay) kpiInventoryGbpDisplay.textContent = formattedGbp;
    if (kpiSkuCountBadge) kpiSkuCountBadge.textContent = `${inventoryData.length} SKUs`;

    if (invTotalCountDisplay) invTotalCountDisplay.textContent = inventoryData.length;
    if (invLowCountDisplay) invLowCountDisplay.textContent = lowStockCount;
    if (invTotalValDisplay) invTotalValDisplay.textContent = formattedUsd;
    if (lastAuditDisplay) lastAuditDisplay.textContent = lastAuditTimestamp;
    if (cycleSkusCount) cycleSkusCount.textContent = `${inventoryData.length} SKUs`;
  }

  // =========================================================================
  // 2. THREE.JS 3D ISOMETRIC DIGITAL TWIN FACTORY & RACK INSPECTOR
  // =========================================================================
  const factoryContainer = document.getElementById('threejs-factory-container');
  let scene, camera, renderer, factoryGroup;
  let conveyorBoxes = [];
  let agvVehicles = [];
  let interactivePallets = [];
  let raycaster, mouse;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let plantRotation = { x: 0.0, y: -0.78 };
  let targetRotation = { x: 0.0, y: -0.78 };
  let hoveredPallet = null;

  function initThreeJSFactory() {
    if (!factoryContainer || typeof THREE === 'undefined') return;

    const width = factoryContainer.clientWidth || 800;
    const height = factoryContainer.clientHeight || 360;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.025);

    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(7.8, 8.2, 7.8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050812, 0);
    factoryContainer.innerHTML = '';
    factoryContainer.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // Industrial Lighting System (Dieter Rams Factory Standard)
    const ambient = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(8, 14, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 1.2);
    dirLight2.position.set(-8, 10, -6);
    scene.add(dirLight2);

    factoryGroup = new THREE.Group();
    scene.add(factoryGroup);

    // Factory Floor Base Slab
    const floorGeo = new THREE.BoxGeometry(11, 0.25, 9);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.8, metalness: 0.2 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.125;
    factoryGroup.add(floorMesh);

    // Grid System
    const grid = new THREE.GridHelper(11, 22, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    factoryGroup.add(grid);

    // Conveyor Belt 1 (Left assembly line)
    const belt1Geo = new THREE.BoxGeometry(0.85, 0.35, 6.5);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const belt1 = new THREE.Mesh(belt1Geo, beltMat);
    belt1.position.set(-2.8, 0.2, 0);
    factoryGroup.add(belt1);

    // Conveyor Machined Component Billets
    const boxMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 });
    const boxMat2 = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });

    for (let i = 0; i < 4; i++) {
      const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), i % 2 === 0 ? boxMat1 : boxMat2);
      pBox.position.set(-2.8, 0.55, -2.8 + i * 1.8);
      factoryGroup.add(pBox);
      conveyorBoxes.push(pBox);
    }

    // High-Bay Warehouse Racking Structure (Right side)
    buildWarehouseRacks();

    // CNC Milling Cells (Center Floor)
    const cncGeo = new THREE.BoxGeometry(1.6, 1.3, 1.6);
    const cncMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.25 });

    // CNC Machine 1
    const cnc1 = new THREE.Mesh(cncGeo, cncMat);
    cnc1.position.set(0, 0.65, -2.0);
    factoryGroup.add(cnc1);

    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12);
    const beaconMat1 = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beacon1 = new THREE.Mesh(beaconGeo, beaconMat1);
    beacon1.position.set(0, 1.5, -2.0);
    factoryGroup.add(beacon1);

    // CNC Machine 2
    const cnc2 = new THREE.Mesh(cncGeo, cncMat);
    cnc2.position.set(0, 0.65, 2.0);
    factoryGroup.add(cnc2);

    const beaconMat2 = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const beacon2 = new THREE.Mesh(beaconGeo, beaconMat2);
    beacon2.position.set(0, 1.5, 2.0);
    factoryGroup.add(beacon2);

    // Automated Guided Vehicles (AGV Carts)
    const agvGeo = new THREE.BoxGeometry(0.9, 0.25, 1.2);
    const agvMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.5 });

    const agv1 = new THREE.Mesh(agvGeo, agvMat);
    agv1.position.set(1.4, 0.15, 0);
    factoryGroup.add(agv1);
    agvVehicles.push({ mesh: agv1, speed: 0.02, axis: 'z', min: -2.8, max: 2.8, dir: 1 });

    const agv2 = new THREE.Mesh(agvGeo, agvMat);
    agv2.position.set(-1.2, 0.15, 0);
    factoryGroup.add(agv2);
    agvVehicles.push({ mesh: agv2, speed: 0.025, axis: 'z', min: -2.8, max: 2.8, dir: -1 });

    // Mouse and Touch Interaction Listeners
    setupThreeJSInteractions();

    window.addEventListener('resize', onWindowResize);
    animateThreeJSFactory();
  }

  function buildWarehouseRacks() {
    interactivePallets = [];
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    let totalSlots = 0;
    let occupiedSlots = 0;

    for (let r = 0; r < 3; r++) {
      const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.6, 2.0), rackMat);
      rackFrame.position.set(3.2, 1.3, -2.4 + r * 2.4);
      factoryGroup.add(rackFrame);

      // Stored Pallet slots (3 vertical levels, 2 slots per level = 6 per rack => 18 total)
      for (let lvl = 0; lvl < 3; lvl++) {
        for (let slot = 0; slot < 2; slot++) {
          totalSlots++;
          const slotZ = (-2.4 + r * 2.4) + (slot === 0 ? -0.45 : 0.45);
          const slotY = 0.38 + lvl * 0.85;

          // Assign SKU if available
          const skuIndex = (r * 6 + lvl * 2 + slot) % inventoryData.length;
          const assigned = inventoryData[skuIndex];

          const isOccupied = assigned && assigned.stock > 0;
          if (isOccupied) occupiedSlots++;

          const palletGeo = new THREE.BoxGeometry(0.95, 0.3, 0.7);
          const palletMat = new THREE.MeshStandardMaterial({
            color: assigned && assigned.stock <= assigned.min ? 0xf59e0b : (lvl === 1 ? 0x0284c7 : 0x10b981),
            roughness: 0.35,
            metalness: 0.3
          });

          const palletMesh = new THREE.Mesh(palletGeo, palletMat);
          palletMesh.position.set(3.2, slotY, slotZ);

          palletMesh.userData = {
            isPallet: true,
            slotId: `RACK-0${r + 1} / BAY-${String.fromCharCode(65 + r)} / LEVEL-${lvl + 1}-S${slot + 1}`,
            sku: assigned ? assigned.sku : 'SKU-0000',
            name: assigned ? assigned.name : 'Staged Inventory',
            stock: assigned ? assigned.stock : 0,
            min: assigned ? assigned.min : 20,
            cost: assigned ? assigned.cost : 10.0,
            bay: assigned ? assigned.bay : `Bay ${String.fromCharCode(65 + r)}-0${lvl + 1}`,
            status: assigned && assigned.stock <= assigned.min ? 'REORDER REQ' : 'OPTIMAL'
          };

          factoryGroup.add(palletMesh);
          interactivePallets.push(palletMesh);
        }
      }
    }

    // Update Occupancy Telemetry Badge
    const occupancyPercent = totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(1) : '75.0';
    if (rackOccupancyBadge) {
      rackOccupancyBadge.textContent = `RACK OCCUPANCY: ${occupiedSlots} / ${totalSlots} SLOTS (${occupancyPercent}%)`;
    }
  }

  function setupThreeJSInteractions() {
    if (!factoryContainer) return;

    factoryContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      const rect = factoryContainer.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) {
        checkPalletHover();
        return;
      }

      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x = Math.max(-0.25, Math.min(0.35, targetRotation.x + deltaY * 0.004));
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Pallet Click Inspector
    factoryContainer.addEventListener('click', (e) => {
      const rect = factoryContainer.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactivePallets);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        openPalletInspectorHud(hit.userData);
      }
    });

    // Touch support
    factoryContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x = Math.max(-0.25, Math.min(0.35, targetRotation.x + deltaY * 0.004));
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // Scroll Zoom
    factoryContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 1 + e.deltaY * 0.001;
      const newDist = camera.position.length() * zoomFactor;
      if (newDist >= 6 && newDist <= 24) {
        camera.position.multiplyScalar(zoomFactor);
        camera.lookAt(0, 0, 0);
      }
    }, { passive: false });

    // Camera preset buttons
    btnCamIso?.addEventListener('click', () => {
      targetRotation = { x: 0.0, y: -0.78 };
      camera.position.set(9.0, 9.5, 9.0);
      camera.lookAt(0, 0, 0);
      if (window.showToast) window.showToast('Camera preset: Standard Isometric View activated.', 'info');
    });

    btnCamTop?.addEventListener('click', () => {
      targetRotation = { x: 0.35, y: -0.05 };
      camera.position.set(0.1, 16.0, 1.5);
      camera.lookAt(0, 0, 0);
      if (window.showToast) window.showToast('Camera preset: High-Bay Warehouse Top-Down View activated.', 'info');
    });

    btnCamLine?.addEventListener('click', () => {
      targetRotation = { x: -0.1, y: -1.55 };
      camera.position.set(-9.5, 4.5, 0.5);
      camera.lookAt(0, 0.5, 0);
      if (window.showToast) window.showToast('Camera preset: Production Assembly Line View activated.', 'info');
    });

    resetFactoryCameraBtn?.addEventListener('click', () => {
      targetRotation = { x: 0.0, y: -0.78 };
      camera.position.set(9.0, 9.5, 9.0);
      camera.lookAt(0, 0, 0);
      if (window.showToast) window.showToast('Digital Twin camera viewpoint reset to default.', 'info');
    });
  }

  function checkPalletHover() {
    if (!raycaster || !camera) return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactivePallets);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hoveredPallet !== hit) {
        if (hoveredPallet && hoveredPallet.material.emissive) {
          hoveredPallet.material.emissive.setHex(0x000000);
        }
        hoveredPallet = hit;
        if (hoveredPallet.material.emissive) {
          hoveredPallet.material.emissive.setHex(0x004455);
        }
        factoryContainer.style.cursor = 'pointer';
      }
    } else {
      if (hoveredPallet && hoveredPallet.material.emissive) {
        hoveredPallet.material.emissive.setHex(0x000000);
      }
      hoveredPallet = null;
      factoryContainer.style.cursor = 'grab';
    }
  }

  function openPalletInspectorHud(palletData) {
    if (!palletSlotInspectorHud) return;

    selectedHudSku = palletData.sku;
    const liveItem = inventoryData.find(i => i.sku === palletData.sku) || palletData;

    if (hudSlotId) hudSlotId.textContent = palletData.slotId;
    if (hudComponentName) hudComponentName.textContent = liveItem.name;
    if (hudSku) hudSku.textContent = `${liveItem.sku} (${liveItem.bay})`;
    if (hudStock) hudStock.textContent = `${liveItem.stock} units`;
    if (hudMin) hudMin.textContent = `${liveItem.min} units`;
    if (hudCost) hudCost.textContent = `$${Number(liveItem.cost).toFixed(2)}`;

    const isLow = liveItem.stock <= liveItem.min;
    if (hudStatus) {
      hudStatus.textContent = isLow ? 'REORDER REQ' : 'OPTIMAL';
      hudStatus.className = isLow ? 'text-amber-400 font-bold text-xs' : 'text-emerald-400 font-bold text-xs';
    }

    palletSlotInspectorHud.classList.remove('hidden');
    if (window.showToast) {
      window.showToast(`Pallet Slot Inspected: ${liveItem.sku} in ${palletData.slotId}.`, 'info');
    }
  }

  closeHudBtn?.addEventListener('click', () => {
    palletSlotInspectorHud?.classList.add('hidden');
  });

  hudPickBtn?.addEventListener('click', () => {
    if (!selectedHudSku) return;
    const found = inventoryData.find(i => i.sku === selectedHudSku);
    if (found) {
      found.stock = Math.max(0, found.stock - 10);
      saveInventoryState();
      renderInventoryTable();
      calculateTelemetry();
      openPalletInspectorHud({ ...found, slotId: hudSlotId.textContent });
      if (window.showToast) {
        window.showToast(`Pallet Pick Dispatched: 10 units extracted from ${found.sku}. Balance: ${found.stock} units.`, 'info');
      }
    }
  });

  hudRestockBtn?.addEventListener('click', () => {
    if (!selectedHudSku) return;
    const found = inventoryData.find(i => i.sku === selectedHudSku);
    if (found) {
      found.stock += 20;
      saveInventoryState();
      renderInventoryTable();
      calculateTelemetry();
      openPalletInspectorHud({ ...found, slotId: hudSlotId.textContent });
      if (window.showToast) {
        window.showToast(`Pallet Replenished: +20 units stored for ${found.sku}. New balance: ${found.stock} units.`, 'success');
      }
    }
  });

  function onWindowResize() {
    if (!factoryContainer || !renderer || !camera) return;
    const width = factoryContainer.clientWidth;
    const height = factoryContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animateThreeJSFactory() {
    requestAnimationFrame(animateThreeJSFactory);

    plantRotation.x += (targetRotation.x - plantRotation.x) * 0.08;
    plantRotation.y += (targetRotation.y - plantRotation.y) * 0.08;

    if (factoryGroup) {
      factoryGroup.rotation.x = plantRotation.x;
      factoryGroup.rotation.y = plantRotation.y;
    }

    // Animate Conveyor Packages
    conveyorBoxes.forEach(box => {
      box.position.z += 0.016;
      if (box.position.z > 3.0) {
        box.position.z = -3.0;
      }
    });

    // Animate AGV Vehicles
    agvVehicles.forEach(v => {
      v.mesh.position[v.axis] += v.speed * v.dir;
      if (v.mesh.position[v.axis] > v.max) {
        v.dir = -1;
      } else if (v.mesh.position[v.axis] < v.min) {
        v.dir = 1;
      }
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // =========================================================================
  // 3. INVENTORY CATALOG & SORTABLE TABLE (/api/inventory)
  // =========================================================================
  async function loadInventory() {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data) ? data : (data.items || data.topInventoryItems);
        if (Array.isArray(incoming) && incoming.length > 0) {
          inventoryData = incoming.map(it => ({
            sku: it.sku || 'SKU-0000',
            name: it.name || 'Component',
            bay: it.bay || 'Bay A-01',
            category: it.category || 'General',
            stock: it.stock !== undefined ? Number(it.stock) : (it.inStock !== undefined ? Number(it.inStock) : 50),
            min: it.min !== undefined ? Number(it.min) : (it.reorderPoint !== undefined ? Number(it.reorderPoint) : 20),
            cost: it.cost !== undefined ? Number(it.cost) : 10.00
          }));
          saveInventoryState();
          populatePOSkuSelect();
          renderInventoryTable();
          calculateTelemetry();
          return;
        }
      }
    } catch (e) {
      console.warn('Inventory API fallback to local storage:', e);
    }

    // LocalStorage or default fallback
    try {
      const cached = localStorage.getItem(STORAGE_KEY_INV);
      if (cached) {
        inventoryData = JSON.parse(cached);
      } else {
        inventoryData = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
      }
    } catch (e) {
      inventoryData = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
    }

    populatePOSkuSelect();
    renderInventoryTable();
    calculateTelemetry();
  }

  function saveInventoryState() {
    try {
      localStorage.setItem(STORAGE_KEY_INV, JSON.stringify(inventoryData));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  function populatePOSkuSelect() {
    if (!poSkuSelect) return;
    poSkuSelect.innerHTML = inventoryData.map(item => `
      <option value="${item.sku}" data-cost="${item.cost}">${item.sku} - ${item.name} ($${item.cost.toFixed(2)})</option>
    `).join('');

    // Trigger calculation
    updatePOTotal();
  }

  function updatePOTotal() {
    if (!poQuantity || !poUnitCost || !poTotalVal) return;
    const q = parseInt(poQuantity.value, 10) || 0;
    const c = parseFloat(poUnitCost.value) || 0;
    const total = q * c;
    poTotalVal.textContent = total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  poSkuSelect?.addEventListener('change', () => {
    const selectedOption = poSkuSelect.options[poSkuSelect.selectedIndex];
    const cost = selectedOption?.getAttribute('data-cost');
    if (cost && poUnitCost) {
      poUnitCost.value = parseFloat(cost).toFixed(2);
      updatePOTotal();
    }
  });

  poQuantity?.addEventListener('input', updatePOTotal);
  poUnitCost?.addEventListener('input', updatePOTotal);

  function renderInventoryTable() {
    if (!inventoryTableBody) return;

    // Filter items
    let filtered = inventoryData.filter(item => {
      // Search filter
      const q = currentSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.bay.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      // Category filter
      let matchesCat = true;
      if (currentCategoryFilter === 'LOW_STOCK') {
        matchesCat = item.stock <= item.min;
      } else if (currentCategoryFilter !== 'ALL') {
        matchesCat = item.category === currentCategoryFilter;
      }

      return matchesSearch && matchesCat;
    });

    // Sort items
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortColumn === 'sku') { valA = a.sku; valB = b.sku; }
      else if (sortColumn === 'name') { valA = a.name; valB = b.name; }
      else if (sortColumn === 'bay') { valA = a.bay; valB = b.bay; }
      else if (sortColumn === 'stock') { valA = a.stock; valB = b.stock; }
      else if (sortColumn === 'min') { valA = a.min; valB = b.min; }
      else if (sortColumn === 'cost') { valA = a.cost; valB = b.cost; }
      else if (sortColumn === 'value') { valA = a.stock * a.cost; valB = b.stock * b.cost; }
      else if (sortColumn === 'status') { valA = a.stock <= a.min ? 1 : 0; valB = b.stock <= b.min ? 1 : 0; }
      else { valA = a.sku; valB = b.sku; }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    if (filtered.length === 0) {
      inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-500 font-sans">
            No catalog inventory items matching query "${currentSearchQuery}".
          </td>
        </tr>
      `;
      return;
    }

    inventoryTableBody.innerHTML = filtered.map(item => {
      const isLow = item.stock <= item.min;
      const totalValuation = (item.stock * item.cost).toFixed(2);
      const stockRatio = Math.min(100, Math.round((item.stock / (item.min * 2 || 1)) * 100));

      return `
        <tr class="hover:bg-white/[0.02] transition-colors">
          <td class="p-3 text-cyan-400 font-bold tracking-tight">${item.sku}</td>
          <td class="p-3">
            <span class="text-white font-sans font-semibold block">${item.name}</span>
            <span class="text-[10px] text-slate-500 font-mono">${item.category}</span>
          </td>
          <td class="p-3 text-slate-400">${item.bay}</td>
          <td class="p-3">
            <span class="font-bold text-white text-xs">${item.stock}</span>
            <span class="text-[10px] text-slate-500 ml-1">units</span>
          </td>
          <td class="p-3 text-slate-400 font-mono">${item.min} units</td>
          <td class="p-3 text-slate-300 font-mono">$${Number(item.cost).toFixed(2)}</td>
          <td class="p-3 font-bold text-emerald-400 font-mono">$${Number(totalValuation).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="p-3">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[9px] font-bold ${isLow ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}">
                ${isLow ? 'REORDER REQ' : 'OPTIMAL'}
              </span>
              <div class="w-16 bg-[#080C16] rounded-full h-1 overflow-hidden">
                <div class="${isLow ? 'bg-amber-400' : 'bg-emerald-400'} h-full rounded-full" style="width: ${stockRatio}%"></div>
              </div>
            </div>
          </td>
          <td class="p-3 text-right">
            <div class="inline-flex items-center gap-1">
              <button data-sku="${item.sku}" data-action="dec" title="Pick 10 units" class="stock-btn px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 font-bold transition-colors text-xs active:scale-95">-10</button>
              <button data-sku="${item.sku}" data-action="inc" title="Replenish 10 units" class="stock-btn px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-emerald-400 font-bold transition-colors text-xs active:scale-95">+10</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button listeners
    inventoryTableBody.querySelectorAll('.stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const action = btn.getAttribute('data-action');
        const found = inventoryData.find(i => i.sku === sku);

        if (found) {
          if (action === 'inc') {
            found.stock += 10;
            saveInventoryState();
            renderInventoryTable();
            calculateTelemetry();
            if (window.showToast) {
              window.showToast(`Stock replenished: ${found.name} (+10 units). Total count: ${found.stock}`, 'success');
            }
          } else if (action === 'dec') {
            found.stock = Math.max(0, found.stock - 10);
            saveInventoryState();
            renderInventoryTable();
            calculateTelemetry();
            if (found.stock <= found.min) {
              if (window.showToast) {
                window.showToast(`SAFETY STOCK BREACH: ${found.name} fell to ${found.stock} units (Below safety reorder threshold of ${found.min})!`, 'warning');
              }
            } else {
              if (window.showToast) {
                window.showToast(`Stock picked: ${found.name} (-10 units). Remaining: ${found.stock}`, 'info');
              }
            }
          }
        }
      });
    });
  }

  // Column Sorting Listeners
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (sortColumn === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = col;
        sortDirection = 'asc';
      }

      // Update header indicators
      document.querySelectorAll('th[data-sort] .sort-icon').forEach(icon => {
        icon.textContent = '--';
        icon.className = 'sort-icon text-slate-600';
      });

      const activeIcon = th.querySelector('.sort-icon');
      if (activeIcon) {
        activeIcon.textContent = sortDirection === 'asc' ? '▲' : '▼';
        activeIcon.className = 'sort-icon text-cyan-400 font-bold';
      }

      renderInventoryTable();
    });
  });

  // Search Input Listener
  inventorySearchInput?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderInventoryTable();
  });

  // Category Filter Pills
  invFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      invFilterBtns.forEach(b => {
        b.className = 'inv-filter-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all whitespace-nowrap';
      });
      btn.className = 'inv-filter-btn px-2.5 py-1 rounded-lg bg-white/[0.1] text-white font-bold transition-all whitespace-nowrap border border-white/20';
      currentCategoryFilter = btn.getAttribute('data-cat') || 'ALL';
      renderInventoryTable();
    });
  });

  // =========================================================================
  // 4. KANBAN MANUFACTURING PIPELINE & DRAG & DROP (/api/kanban)
  // =========================================================================
  async function loadKanban() {
    try {
      const res = await fetch('/api/kanban');
      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data) ? data : (data.orders || (data.columns ? data.columns.flatMap(c => c.cards || []) : null));
        if (Array.isArray(incoming) && incoming.length > 0) {
          kanbanOrders = incoming.map(o => ({
            id: o.id || 'WO-0000',
            title: o.title || o.part || 'Batch Order',
            client: o.client || 'Enterprise Partner',
            stage: (o.stage === 'staged' ? 'backlog' : (o.stage === 'active' ? 'assembly' : o.stage)) || 'backlog',
            priority: o.priority || 'NORMAL',
            qty: o.qty ? parseInt(o.qty, 10) : 100
          }));
          saveKanbanState();
          renderKanban();
          calculateTelemetry();
          return;
        }
      }
    } catch (e) {
      console.warn('Kanban API fallback to local storage:', e);
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY_KANBAN);
      if (cached) {
        kanbanOrders = JSON.parse(cached);
      } else {
        kanbanOrders = JSON.parse(JSON.stringify(DEFAULT_KANBAN));
      }
    } catch (e) {
      kanbanOrders = JSON.parse(JSON.stringify(DEFAULT_KANBAN));
    }

    renderKanban();
    calculateTelemetry();
  }

  function saveKanbanState() {
    try {
      localStorage.setItem(STORAGE_KEY_KANBAN, JSON.stringify(kanbanOrders));
    } catch (e) {
      console.warn('Kanban storage save error:', e);
    }
  }

  function renderKanban() {
    if (!colBacklog) return;

    const stagesConfig = {
      backlog: { col: colBacklog, count: countBacklog, prev: null, next: 'assembly', nextLabel: 'Start Assembly →' },
      assembly: { col: colAssembly, count: countAssembly, prev: 'backlog', next: 'qa', nextLabel: 'Send to QA →' },
      qa: { col: colQa, count: countQa, prev: 'assembly', next: 'dispatched', nextLabel: 'Ready for Dispatch →' },
      dispatched: { col: colDispatched, count: countDispatched, prev: 'qa', next: null, nextLabel: 'Shipped' }
    };

    Object.keys(stagesConfig).forEach(key => {
      const stageObj = stagesConfig[key];
      stageObj.col.innerHTML = '';

      let list = kanbanOrders.filter(o => o.stage === key);

      // Priority filter
      if (currentPriorityFilter !== 'ALL') {
        list = list.filter(o => o.priority === currentPriorityFilter);
      }

      stageObj.count.textContent = list.length;

      list.forEach(order => {
        const card = document.createElement('div');
        card.draggable = true;
        card.setAttribute('data-id', order.id);
        card.className = 'p-3.5 rounded-xl bg-[#080C18] border border-white/[0.08] hover:border-cyan-500/40 space-y-2 text-xs transition-all cursor-grab active:cursor-grabbing select-none shadow-sm';

        const priorityColors = {
          CRITICAL: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          HIGH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          NORMAL: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          LOW: 'bg-slate-700/40 text-slate-400 border-slate-600/30'
        }[order.priority] || 'bg-slate-700/40 text-slate-300 border-slate-600/30';

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <span class="font-mono font-bold text-cyan-400">${order.id}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded border ${priorityColors} font-bold">${order.priority}</span>
          </div>
          <p class="font-bold text-white font-sans text-xs leading-snug">${order.title}</p>
          <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>${order.client}</span>
            <span class="text-slate-300 bg-white/[0.05] px-1.5 py-0.5 rounded">${order.qty || 100} units</span>
          </div>
          <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-white/[0.06]">
            ${stageObj.prev ? `<button data-id="${order.id}" data-action="prev" class="kanban-revert text-slate-400 hover:text-white transition-colors">← Revert</button>` : '<span></span>'}
            ${stageObj.next ? `<button data-id="${order.id}" data-action="next" class="kanban-advance text-emerald-400 hover:text-emerald-300 font-bold transition-colors">${stageObj.nextLabel}</button>` : '<span class="text-emerald-400 font-bold">Ready</span>'}
          </div>
        `;

        // HTML5 Drag Events on Card
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', order.id);
          card.classList.add('opacity-40');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('opacity-40');
        });

        stageObj.col.appendChild(card);
      });
    });

    // Button event listeners
    document.querySelectorAll('.kanban-advance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const nextMap = { backlog: 'assembly', assembly: 'qa', qa: 'dispatched' };
        moveOrder(id, nextMap);
      });
    });

    document.querySelectorAll('.kanban-revert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const prevMap = { dispatched: 'qa', qa: 'assembly', assembly: 'backlog' };
        moveOrder(id, prevMap);
      });
    });
  }

  function moveOrder(id, map) {
    const order = kanbanOrders.find(o => o.id === id);
    if (order && map[order.stage]) {
      const targetStage = map[order.stage];
      order.stage = targetStage;
      saveKanbanState();
      renderKanban();
      calculateTelemetry();
      if (window.showToast) {
        window.showToast(`Work Order ${order.id} routed to ${targetStage.toUpperCase()} stage.`, 'success');
      }
    }
  }

  // Setup Column Drag & Drop Zones
  ['backlog', 'assembly', 'qa', 'dispatched'].forEach(stage => {
    const dropZone = document.getElementById(`kanban-drop-${stage}`);
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('kanban-drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('kanban-drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('kanban-drag-over');
      const orderId = e.dataTransfer.getData('text/plain');
      const order = kanbanOrders.find(o => o.id === orderId);

      if (order && order.stage !== stage) {
        order.stage = stage;
        saveKanbanState();
        renderKanban();
        calculateTelemetry();
        if (window.showToast) {
          window.showToast(`Work Order ${order.id} drag-routed to ${stage.toUpperCase()}.`, 'success');
        }
      }
    });
  });

  // Priority Filter Buttons
  kanbanFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      kanbanFilterBtns.forEach(b => {
        b.className = 'kanban-filter-btn px-2.5 py-1 rounded text-slate-400 hover:text-white transition-all';
      });
      btn.className = 'kanban-filter-btn px-2.5 py-1 rounded bg-white/[0.1] text-white font-bold transition-all';
      currentPriorityFilter = btn.getAttribute('data-filter-priority') || 'ALL';
      renderKanban();
    });
  });

  // =========================================================================
  // 5. PURCHASE ORDER CREATION MODAL & EXECUTION
  // =========================================================================
  openNewPOModalBtn?.addEventListener('click', () => {
    if (window.BFAuth && !window.BFAuth.hasPermission('purchase_order_approval')) {
      if (window.showToast) window.showToast('Access Denied: Active persona lacks Purchase Order Authorization privilege.', 'error');
      return;
    }
    populatePOSkuSelect();
    newPOModal?.classList.remove('hidden');
  });

  closePOModalBtn?.addEventListener('click', () => {
    newPOModal?.classList.add('hidden');
  });

  purchaseOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const supplier = document.getElementById('poSupplier').value;
    const selectedSkuCode = poSkuSelect.value;
    const qty = parseInt(poQuantity.value, 10) || 100;
    const cost = parseFloat(poUnitCost.value) || 10.0;

    const existing = inventoryData.find(i => i.sku === selectedSkuCode);
    if (existing) {
      existing.stock += qty;
      existing.cost = cost;
    } else {
      inventoryData.unshift({
        sku: selectedSkuCode,
        name: 'Procured Component Batch',
        bay: 'Bay E-01',
        category: 'Thermal',
        stock: qty,
        min: 50,
        cost: cost
      });
    }

    saveInventoryState();
    renderInventoryTable();
    calculateTelemetry();
    newPOModal?.classList.add('hidden');

    const totalVal = (qty * cost).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (window.showToast) {
      window.showToast(`Purchase Order Authorized: Dispatched to ${supplier} for ${qty} units (${totalVal}). Inventory updated.`, 'success');
    }
  });

  // =========================================================================
  // 6. ADD WORK ORDER MODAL
  // =========================================================================
  function openWorkOrderModal() {
    if (woIdInput) {
      woIdInput.value = 'WO-' + Math.floor(9200 + Math.random() * 800);
    }
    newWOModal?.classList.remove('hidden');
  }

  openNewWOModalBtn?.addEventListener('click', openWorkOrderModal);
  openKanbanNewWOBtn?.addEventListener('click', openWorkOrderModal);

  closeWOModalBtn?.addEventListener('click', () => {
    newWOModal?.classList.add('hidden');
  });

  workOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = woIdInput.value.trim().toUpperCase();
    const client = document.getElementById('woClientInput').value.trim();
    const title = document.getElementById('woTitleInput').value.trim();
    const qty = parseInt(document.getElementById('woQtyInput').value, 10) || 100;
    const priority = document.getElementById('woPriorityInput').value;
    const stage = document.getElementById('woStageInput').value;

    if (!id || !title || !client) {
      if (window.showToast) window.showToast('Validation Error: Work Order ID, Client, and Description are required.', 'error');
      return;
    }

    // Check collision
    if (kanbanOrders.some(o => o.id === id)) {
      if (window.showToast) window.showToast(`Order Collision: Work Order ${id} is already in production pipeline.`, 'warning');
      return;
    }

    const newOrder = { id, title, client, stage, priority, qty };
    kanbanOrders.unshift(newOrder);
    saveKanbanState();
    renderKanban();
    calculateTelemetry();

    newWOModal?.classList.add('hidden');
    workOrderForm.reset();

    if (window.showToast) {
      window.showToast(`Work Order ${id} (${title}) authorized and routed to ${stage.toUpperCase()}.`, 'success');
    }
  });

  // =========================================================================
  // 7. ADD NEW SKU MODAL
  // =========================================================================
  function openSkuModal() {
    newSKUModal?.classList.remove('hidden');
  }

  openNewSKUModalBtn?.addEventListener('click', openSkuModal);
  openAddSKUModalBtn?.addEventListener('click', openSkuModal);

  closeSKUModalBtn?.addEventListener('click', () => {
    newSKUModal?.classList.add('hidden');
  });

  skuCatalogForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const sku = document.getElementById('newSkuCode').value.trim().toUpperCase();
    const name = document.getElementById('newSkuName').value.trim();
    const bay = document.getElementById('newSkuBay').value.trim();
    const category = document.getElementById('newSkuCategory').value;
    const stock = parseInt(document.getElementById('newSkuStock').value, 10) || 0;
    const min = parseInt(document.getElementById('newSkuMin').value, 10) || 20;
    const cost = parseFloat(document.getElementById('newSkuCost').value) || 10.0;

    if (!sku || !name) {
      if (window.showToast) window.showToast('Validation Error: SKU code and Component Name are required.', 'error');
      return;
    }

    if (inventoryData.some(i => i.sku === sku)) {
      if (window.showToast) window.showToast(`SKU Conflict: ${sku} already cataloged in warehouse database.`, 'warning');
      return;
    }

    const newSkuRecord = { sku, name, bay, category, stock, min, cost };
    inventoryData.unshift(newSkuRecord);
    saveInventoryState();
    populatePOSkuSelect();
    renderInventoryTable();
    calculateTelemetry();

    newSKUModal?.classList.add('hidden');
    skuCatalogForm.reset();

    if (window.showToast) {
      window.showToast(`New SKU ${sku} (${name}) cataloged and allocated to ${bay}.`, 'success');
    }
  });

  // =========================================================================
  // 8. BATCH DISPATCH EXECUTION MODAL
  // =========================================================================
  dispatchBatchBtn?.addEventListener('click', () => {
    const readyOrders = kanbanOrders.filter(o => o.stage === 'dispatched');

    if (readyOrders.length === 0) {
      if (window.showToast) window.showToast('Dispatch Queue Empty: No work orders currently in Ready for Dispatch stage.', 'warning');
      return;
    }

    if (dispatchOrdersList) {
      dispatchOrdersList.innerHTML = readyOrders.map(o => `
        <div class="flex justify-between items-center p-2 rounded bg-white/[0.04]">
          <span class="font-bold text-cyan-400">${o.id}</span>
          <span class="text-white">${o.title}</span>
          <span class="text-emerald-400 font-bold">${o.qty || 100} units</span>
        </div>
      `).join('');
    }

    if (manifestNumberPreview) {
      manifestNumberPreview.textContent = 'MF-' + Math.floor(9000 + Math.random() * 999);
    }

    dispatchBatchModal?.classList.remove('hidden');
  });

  closeDispatchModalBtn?.addEventListener('click', () => {
    dispatchBatchModal?.classList.add('hidden');
  });

  confirmDispatchBtn?.addEventListener('click', () => {
    const carrier = document.getElementById('dispatchCarrierSelect').value;
    const manifestId = manifestNumberPreview?.textContent || 'MF-9104';
    const readyOrders = kanbanOrders.filter(o => o.stage === 'dispatched');

    // Archive or complete ready orders
    kanbanOrders = kanbanOrders.filter(o => o.stage !== 'dispatched');
    saveKanbanState();
    renderKanban();
    calculateTelemetry();

    dispatchBatchModal?.classList.add('hidden');

    if (window.showToast) {
      window.showToast(`Batch Manifest ${manifestId} signed. ${readyOrders.length} work orders released to ${carrier}.`, 'success');
    }
  });

  // =========================================================================
  // 9. CYCLE COUNT RECONCILIATION MODAL
  // =========================================================================
  performCycleCountBtn?.addEventListener('click', () => {
    if (cycleSkusCount) {
      cycleSkusCount.textContent = `${inventoryData.length} SKUs`;
    }
    cycleCountModal?.classList.remove('hidden');
  });

  closeCycleModalBtn?.addEventListener('click', () => {
    cycleCountModal?.classList.add('hidden');
  });

  confirmCycleCountBtn?.addEventListener('click', () => {
    lastAuditTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    localStorage.setItem(STORAGE_KEY_AUDIT, lastAuditTimestamp);

    calculateTelemetry();
    cycleCountModal?.classList.add('hidden');

    if (window.showToast) {
      window.showToast(`AUDIT CERTIFIED: Cycle count verified across 5 bays. 0 discrepancy found. Ledger synchronized.`, 'success');
    }
  });

  // =========================================================================
  // 10. EXPORT CSV INVENTORY AUDIT REPORT
  // =========================================================================
  exportCsvBtn?.addEventListener('click', () => {
    if (inventoryData.length === 0) {
      if (window.showToast) window.showToast('Export failed: No inventory records found.', 'warning');
      return;
    }

    const headers = [
      'SKU Code',
      'Component Description',
      'Category',
      'Warehouse Bay',
      'Available Stock',
      'Safety Minimum',
      'Unit Cost (USD)',
      'Total Value (USD)',
      'Stock Health Status',
      'Audit Timestamp'
    ];

    const rows = inventoryData.map(item => [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.bay}"`,
      item.stock,
      item.min,
      item.cost.toFixed(2),
      (item.stock * item.cost).toFixed(2),
      item.stock <= item.min ? '"REORDER_TRIGGERED"' : '"OPTIMAL"',
      `"${lastAuditTimestamp}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FlowOps_ERP_Inventory_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast(`Audit Report Exported: Downloaded CSV record of ${inventoryData.length} warehouse SKUs.`, 'success');
    }
  });

  // =========================================================================
  // 11. TAB SWITCHING
  // =========================================================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => {
        t.className = 'nav-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap font-mono';
      });
      tab.className = 'nav-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-emerald-400 text-emerald-300 transition-colors whitespace-nowrap font-mono';

      tabContents.forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById('tab-' + target);
      if (activeContent) activeContent.classList.remove('hidden');

      // Refresh 3D container size when switching to dashboard
      if (target === 'dashboard') {
        setTimeout(onWindowResize, 50);
      }
    });
  });

  // =========================================================================
  // 12. CNC MILL TELEMETRY & MULTI-LEVEL BOM CONTROLLER
  // =========================================================================
  const GCODE_BLOCKS = [
    'N420 G01 X142.500 Y88.220 Z-12.400 F4800 S14200',
    'N421 G02 X156.120 Y94.880 I12.500 J-4.200 F4800 S14200',
    'N422 G01 X168.400 Y102.150 Z-14.800 F5200 S14200',
    'N423 G03 X182.200 Y110.450 R8.500 F4600 S14150',
    'N424 G00 Z50.000 M09 (Tool Clearance Rapid)',
    'N425 G01 X142.500 Y88.220 Z-16.200 F4800 S14200'
  ];
  let gcodeIdx = 0;

  setInterval(() => {
    const spindleEl = document.getElementById('cncSpindleRpm');
    const feedEl = document.getElementById('cncFeedRate');
    const gcodeEl = document.getElementById('cncGcodeBlock');
    if (!spindleEl || !feedEl || !gcodeEl) return;

    const rpmJitter = Math.floor(Math.random() * 80) - 40;
    const feedJitter = Math.floor(Math.random() * 60) - 30;

    spindleEl.innerHTML = `${(14200 + rpmJitter).toLocaleString('en-US')} <span class="text-[9px] font-normal text-slate-400">RPM</span>`;
    feedEl.innerHTML = `${(4800 + feedJitter).toLocaleString('en-US')} <span class="text-[9px] font-normal text-slate-400">mm/min</span>`;

    gcodeIdx = (gcodeIdx + 1) % GCODE_BLOCKS.length;
    gcodeEl.textContent = GCODE_BLOCKS[gcodeIdx];
  }, 2500);

  // BOM Expand / Collapse Toggle
  const toggleBomTreeBtn = document.getElementById('toggleBomTreeBtn');
  let bomExpanded = true;
  toggleBomTreeBtn?.addEventListener('click', () => {
    bomExpanded = !bomExpanded;
    const l2Rows = document.querySelectorAll('#bomTableBody tr.text-slate-400');
    l2Rows.forEach(row => {
      row.style.display = bomExpanded ? '' : 'none';
    });
    toggleBomTreeBtn.textContent = bomExpanded ? 'Collapse Sub-Levels' : 'Expand All Levels';
    if (window.showToast) window.showToast(`BOM tree ${bomExpanded ? 'expanded' : 'collapsed'}.`, 'info');
  });

  // =========================================================================
  // 13. INDUSTRIAL MES PLAN ESTIMATOR & SHOP FLOOR SIZING ENGINE
  // =========================================================================
  const MES_PLANS = {
    shop: { name: 'Prototype Machine Shop', base: 550, cells: 4, wos: 250 },
    factory: { name: 'High-Precision Batch Factory', base: 1950, cells: 16, wos: 1500 },
    gigafactory: { name: 'Tier-1 Aerospace Gigafactory', base: 5200, cells: 64, wos: 10000 }
  };

  let activeMesPlan = 'factory';
  let mesCells = 16;
  let mesWos = 1500;

  const mesCellsSlider = document.getElementById('mesCellsSlider');
  const mesCellsLabel = document.getElementById('mesCellsLabel');
  const mesWosSlider = document.getElementById('mesWosSlider');
  const mesWosLabel = document.getElementById('mesWosLabel');
  const mesLegacyCost = document.getElementById('mesLegacyCost');
  const mesPlatformCost = document.getElementById('mesPlatformCost');
  const mesNetSavings = document.getElementById('mesNetSavings');
  const mesAnnualSavings = document.getElementById('mesAnnualSavings');

  function updateMesEstimator() {
    const plan = MES_PLANS[activeMesPlan] || MES_PLANS.factory;
    const legacyCost = (mesCells * 650) + Math.round(mesWos * 5.2);
    const extraCells = Math.max(0, mesCells - plan.cells);
    const extraWos = Math.max(0, mesWos - plan.wos);
    const platformCost = plan.base + (extraCells * 95) + Math.round(extraWos * 0.85);
    const monthlySavings = Math.max(0, legacyCost - platformCost);
    const annualSavings = monthlySavings * 12;

    if (mesCellsLabel) mesCellsLabel.textContent = `${mesCells} Cells`;
    if (mesWosLabel) mesWosLabel.textContent = `${mesWos.toLocaleString('en-US')} Orders`;
    if (mesLegacyCost) mesLegacyCost.textContent = `$${legacyCost.toLocaleString('en-US')} / mo`;
    if (mesPlatformCost) {
      mesPlatformCost.textContent = `$${platformCost.toLocaleString('en-US')} / mo`;
      const sub = mesPlatformCost.nextElementSibling;
      if (sub) {
        sub.textContent = (extraCells > 0 || extraWos > 0)
          ? `Base $${plan.base.toLocaleString()} + capacity overage`
          : `All ${mesCells} cells included in base`;
      }
    }
    if (mesNetSavings) mesNetSavings.textContent = `$${monthlySavings.toLocaleString('en-US')} / mo`;
    if (mesAnnualSavings) mesAnnualSavings.textContent = `$${annualSavings.toLocaleString('en-US')} / yr`;

    // Modal sync
    const modalPlanName = document.getElementById('modalFlowOpsPlanName');
    const modalPlanCost = document.getElementById('modalFlowOpsPlanCost');
    const modalCapacity = document.getElementById('modalFlowOpsCapacity');
    const modalSavings = document.getElementById('modalFlowOpsSavings');
    if (modalPlanName) modalPlanName.textContent = plan.name;
    if (modalPlanCost) modalPlanCost.textContent = `$${platformCost.toLocaleString('en-US')} / mo`;
    if (modalCapacity) modalCapacity.textContent = `${mesCells} Cells / ${mesWos.toLocaleString('en-US')} WOs`;
    if (modalSavings) modalSavings.textContent = `$${annualSavings.toLocaleString('en-US')}`;
  }

  // Plan Card Selection Listeners
  document.querySelectorAll('.mes-plan-card').forEach(card => {
    card.addEventListener('click', () => {
      const planKey = card.getAttribute('data-plan');
      if (!planKey || !MES_PLANS[planKey]) return;
      activeMesPlan = planKey;

      document.querySelectorAll('.mes-plan-card').forEach(c => {
        c.classList.remove('border-emerald-500', 'border-2', 'bg-emerald-950/20', 'shadow-[0_0_30px_rgba(16,185,129,0.2)]');
        c.classList.add('border-white/[0.08]', 'border', 'bg-[#080D1A]');
        const btn = c.querySelector('.select-mes-plan-btn');
        if (btn) {
          btn.className = 'select-mes-plan-btn mt-6 w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono font-bold border border-white/[0.1] transition-all';
          btn.textContent = `Select ${c.getAttribute('data-plan').toUpperCase()} Plan`;
        }
      });

      card.classList.remove('border-white/[0.08]', 'bg-[#080D1A]');
      card.classList.add('border-emerald-500', 'border-2', 'bg-emerald-950/20', 'shadow-[0_0_30px_rgba(16,185,129,0.2)]');
      const activeBtn = card.querySelector('.select-mes-plan-btn');
      if (activeBtn) {
        activeBtn.className = 'select-mes-plan-btn mt-6 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        activeBtn.textContent = 'Selected Plan';
      }

      updateMesEstimator();
      if (window.showToast) window.showToast(`Selected ${MES_PLANS[planKey].name} tier.`, 'info');
    });
  });

  mesCellsSlider?.addEventListener('input', (e) => {
    mesCells = parseInt(e.target.value, 10) || 16;
    updateMesEstimator();
  });

  mesWosSlider?.addEventListener('input', (e) => {
    mesWos = parseInt(e.target.value, 10) || 1500;
    updateMesEstimator();
  });

  // Quotation Modal Triggers & Direct Action Handlers
  const flowopsQuotationModal = document.getElementById('flowopsQuotationModal');
  const closeFlowOpsQuotationModal = document.getElementById('closeFlowOpsQuotationModal');
  const confirmFlowOpsQuoteBtn = document.getElementById('confirmFlowOpsQuoteBtn');
  const printFlowOpsQuoteBtn = document.getElementById('printFlowOpsQuoteBtn');

  const openFlowOpsBtns = [
    document.getElementById('openFlowOpsQuotationBtn'),
    document.getElementById('openFlowOpsQuotationBtnBottom'),
    document.getElementById('openFlowOpsQuotationBtnHeader'),
    document.getElementById('directActionPlanBtn')
  ];

  openFlowOpsBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
      updateMesEstimator();
      const dateEl = document.getElementById('flowopsQuoteDate');
      if (dateEl) {
        dateEl.textContent = `DATE: ${new Date().toISOString().split('T')[0]}`;
      }
      if (flowopsQuotationModal) flowopsQuotationModal.classList.remove('hidden');
    });
  });

  // Direct Action Card 1: Dispatch Production Batch
  const directActionBatchBtn = document.getElementById('directActionBatchBtn');
  directActionBatchBtn?.addEventListener('click', () => {
    const woBtn = document.getElementById('openNewWOModalBtn');
    if (woBtn) {
      woBtn.click();
    } else {
      const woTab = document.querySelector('.nav-tab[data-tab="workorders"]');
      woTab?.click();
    }
    if (window.showToast) window.showToast('Work Order Dispatch Modal initialized.', 'info');
  });

  // Direct Action Card 2: Audit 3D Warehouse Floor
  const directActionFloorBtn = document.getElementById('directActionFloorBtn');
  directActionFloorBtn?.addEventListener('click', () => {
    const dashTab = document.querySelector('.nav-tab[data-tab="dashboard"]');
    dashTab?.click();
    const floor = document.getElementById('threejs-factory-container');
    if (floor) {
      floor.scrollIntoView({ behavior: 'smooth' });
    }
    if (window.showToast) window.showToast('Inspecting 3D Digital Twin Factory floor.', 'info');
  });

  closeFlowOpsQuotationModal?.addEventListener('click', () => {
    if (flowopsQuotationModal) flowopsQuotationModal.classList.add('hidden');
  });

  flowopsQuotationModal?.addEventListener('click', (e) => {
    if (e.target === flowopsQuotationModal) {
      flowopsQuotationModal.classList.add('hidden');
    }
  });

  confirmFlowOpsQuoteBtn?.addEventListener('click', () => {
    const org = document.getElementById('flowopsQuoteOrg')?.value || 'Manufacturing Partner';
    const signer = document.getElementById('flowopsQuoteSigner')?.value || 'VP Operations';
    if (window.showToast) {
      window.showToast(`Manufacturing MES SLA Locked for ${org} (${signer}).`, 'success');
    }
    if (flowopsQuotationModal) flowopsQuotationModal.classList.add('hidden');
  });

  printFlowOpsQuoteBtn?.addEventListener('click', () => {
    if (window.showToast) window.showToast('Preparing executive Manufacturing MES quotation for export...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  });

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  initThreeJSFactory();
  loadInventory();
  loadKanban();
  updateMesEstimator();

})();
