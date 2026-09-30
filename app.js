// FLOWOPS ERP - MANUFACTURING EXECUTION SYSTEM & SUPPLY CHAIN ENGINE
// Binary Froster Enterprise ERP Platform
// Connected to Live Serverless Backend (/api/inventory, /api/kanban)
// Enhanced with Three.js 3D Isometric Digital Twin Factory Floor

(function () {
  'use strict';

  // State
  let inventoryData = [];
  let kanbanOrders = [];

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const inventoryTableBody = document.getElementById('inventoryTableBody');
  const openNewPOModalBtn = document.getElementById('openNewPOModalBtn');
  const newPOModal = document.getElementById('newPOModal');
  const closePOModalBtn = document.getElementById('closePOModalBtn');
  const purchaseOrderForm = document.getElementById('purchaseOrderForm');
  const resetFactoryCameraBtn = document.getElementById('resetFactoryCameraBtn');

  // Kanban Columns
  const colBacklog = document.getElementById('col-backlog');
  const colAssembly = document.getElementById('col-assembly');
  const colQa = document.getElementById('col-qa');
  const colDispatched = document.getElementById('col-dispatched');
  const countBacklog = document.getElementById('countBacklog');
  const countAssembly = document.getElementById('countAssembly');
  const countQa = document.getElementById('countQa');
  const countDispatched = document.getElementById('countDispatched');

  // =========================================================================
  // 1. THREE.JS 3D ISOMETRIC DIGITAL TWIN FACTORY FLOOR
  // =========================================================================
  const factoryContainer = document.getElementById('threejs-factory-container');
  let scene, camera, renderer, factoryGroup;
  let conveyorBoxes = [];
  let agvVehicles = [];
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let plantRotation = { x: 0.5, y: -0.75 };
  let targetRotation = { x: 0.5, y: -0.75 };

  function initThreeJSFactory() {
    if (!factoryContainer || typeof THREE === 'undefined') return;

    const width = factoryContainer.clientWidth || 600;
    const height = factoryContainer.clientHeight || 280;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(7.5, 8.5, 7.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    factoryContainer.innerHTML = '';
    factoryContainer.appendChild(renderer.domElement);

    // Plant Industrial Lighting
    const ambient = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 2.5);
    dirLight1.position.set(8, 12, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 2.0);
    dirLight2.position.set(-6, 8, -4);
    scene.add(dirLight2);

    factoryGroup = new THREE.Group();
    scene.add(factoryGroup);

    // Floor Base Slab
    const floorGeo = new THREE.BoxGeometry(10, 0.2, 8);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x090e1a, roughness: 0.8, metalness: 0.2 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.1;
    factoryGroup.add(floorMesh);

    // Safety Grid & Corridors
    const grid = new THREE.GridHelper(10, 20, 0x1f293d, 0x0f172a);
    grid.position.y = 0.01;
    factoryGroup.add(grid);

    // 1. Conveyor Belt 1 (Left line)
    const belt1Geo = new THREE.BoxGeometry(0.8, 0.35, 6);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const belt1 = new THREE.Mesh(belt1Geo, beltMat);
    belt1.position.set(-2.5, 0.2, 0);
    factoryGroup.add(belt1);

    // Conveyor Packages (animated)
    const boxMatCyan = new THREE.MeshStandardMaterial({ color: 0x00f2fe, roughness: 0.3, emissive: 0x005577 });
    const boxMatEmerald = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, emissive: 0x064e3b });

    for (let i = 0; i < 4; i++) {
      const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), i % 2 === 0 ? boxMatCyan : boxMatEmerald);
      pBox.position.set(-2.5, 0.55, -2.5 + i * 1.6);
      factoryGroup.add(pBox);
      conveyorBoxes.push(pBox);
    }

    // 2. High-Bay Warehouse Racking Structure (Right side)
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    for (let r = 0; r < 3; r++) {
      const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 1.8), rackMat);
      rackFrame.position.set(2.8, 1.25, -2.2 + r * 2.2);
      factoryGroup.add(rackFrame);

      // Stored Pallet boxes
      for (let lvl = 0; lvl < 3; lvl++) {
        const pallet = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.35, 1.4),
          new THREE.MeshStandardMaterial({ color: lvl === 1 ? 0x0284c7 : (lvl === 2 ? 0x10b981 : 0xd97706) })
        );
        pallet.position.set(2.8, 0.35 + lvl * 0.8, -2.2 + r * 2.2);
        factoryGroup.add(pallet);
      }
    }

    // 3. CNC Machining Cells (Center)
    const cncGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
    const cncMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
    const cnc1 = new THREE.Mesh(cncGeo, cncMat);
    cnc1.position.set(0, 0.6, -1.8);
    factoryGroup.add(cnc1);

    // CNC Status Beacon
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.4, -1.8);
    factoryGroup.add(beacon);

    const cnc2 = new THREE.Mesh(cncGeo, cncMat);
    cnc2.position.set(0, 0.6, 1.8);
    factoryGroup.add(cnc2);

    const beacon2 = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
    beacon2.position.set(0, 1.4, 1.8);
    factoryGroup.add(beacon2);

    // 4. Automated Guided Vehicles (AGV Carts)
    const agvGeo = new THREE.BoxGeometry(0.8, 0.25, 1.1);
    const agvMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.5 });

    const agv1 = new THREE.Mesh(agvGeo, agvMat);
    agv1.position.set(1.2, 0.15, 0);
    factoryGroup.add(agv1);
    agvVehicles.push({ mesh: agv1, speed: 0.02, axis: 'z', min: -2.5, max: 2.5, dir: 1 });

    const agv2 = new THREE.Mesh(agvGeo, agvMat);
    agv2.position.set(-1.2, 0.15, 0);
    factoryGroup.add(agv2);
    agvVehicles.push({ mesh: agv2, speed: 0.025, axis: 'z', min: -2.5, max: 2.5, dir: -1 });

    // Orbit Drag Controls
    factoryContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      targetRotation.y += deltaX * 0.006;
      targetRotation.x = Math.max(0.2, Math.min(1.2, targetRotation.x + deltaY * 0.006));
      prevMousePos = { x: e.clientX, y: e.clientY };
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
      targetRotation.x = Math.max(0.2, Math.min(1.2, targetRotation.x + deltaY * 0.006));
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    factoryContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z = Math.max(5.5, Math.min(15.0, camera.position.z + e.deltaY * 0.006));
      camera.position.x = camera.position.z;
    }, { passive: false });

    window.addEventListener('resize', onWindowResize);
    animateThreeJSFactory();
  }

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

    // 1. Animate Conveyor Packages
    conveyorBoxes.forEach(box => {
      box.position.z += 0.015;
      if (box.position.z > 2.8) {
        box.position.z = -2.8;
      }
    });

    // 2. Animate AGV Carts
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

  resetFactoryCameraBtn?.addEventListener('click', () => {
    targetRotation = { x: 0.5, y: -0.75 };
    if (camera) {
      camera.position.set(7.5, 8.5, 7.5);
      camera.lookAt(0, 0, 0);
    }
    if (window.showToast) window.showToast('3D plant digital twin camera reset.', 'info');
  });

  // =========================================================================
  // 2. INVENTORY MANAGEMENT & REAL-TIME STOCK ADJUSTMENT (/api/inventory)
  // =========================================================================
  async function loadInventory() {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        inventoryData = data.items || data;
        renderInventoryTable();
        return;
      }
    } catch (e) {
      console.warn('Inventory fetch fallback:', e);
    }

    inventoryData = [
      { sku: 'SKU-8841', name: 'Silicon Heat Sinks (Alu-22)', bay: 'Bay B-08', stock: 14, min: 50, cost: 14.50 },
      { sku: 'SKU-4912', name: 'Titanium Hex Screws M4', bay: 'Bay A-02', stock: 820, min: 500, cost: 0.45 },
      { sku: 'SKU-3104', name: 'Optic Sensor Array 4K', bay: 'Bay C-14', stock: 68, min: 40, cost: 120.00 },
      { sku: 'SKU-7720', name: 'Brushless DC Servos 24V', bay: 'Bay D-03', stock: 32, min: 30, cost: 65.00 },
      { sku: 'SKU-9901', name: 'Braided Shielded Ribbon Cable', bay: 'Bay A-11', stock: 450, min: 200, cost: 2.10 }
    ];

    renderInventoryTable();
  }

  function renderInventoryTable() {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = inventoryData.map(item => {
      const isLow = item.stock <= item.min;
      return `
        <tr class="hover:bg-white/[0.02]">
          <td class="p-3 text-cyan-400 font-bold">${item.sku}</td>
          <td class="p-3 text-white font-sans font-semibold">${item.name}</td>
          <td class="p-3 text-slate-400">${item.bay}</td>
          <td class="p-3 font-bold text-white">${item.stock} units</td>
          <td class="p-3 text-slate-500">${item.min} units</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-[9px] ${isLow ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}">
              ${isLow ? 'REORDER REQ' : 'OPTIMAL'}
            </span>
          </td>
          <td class="p-3 text-right">
            <div class="inline-flex items-center gap-1">
              <button data-sku="${item.sku}" data-action="dec" class="stock-btn px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-bold">-</button>
              <button data-sku="${item.sku}" data-action="inc" class="stock-btn px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-bold">+</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    inventoryTableBody.querySelectorAll('.stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const action = btn.getAttribute('data-action');
        const found = inventoryData.find(i => i.sku === sku);
        if (found) {
          if (action === 'inc') {
            found.stock += 10;
            if (window.showToast) window.showToast(`Stock replenished: ${found.name} (+10 units). New count: ${found.stock}`, 'success');
          } else if (action === 'dec') {
            found.stock = Math.max(0, found.stock - 10);
            if (found.stock <= found.min) {
              if (window.showToast) window.showToast(`STOCK SAFETY BREACH: ${found.name} dropped to ${found.stock} units (Below safety threshold of ${found.min})!`, 'warning');
            } else {
              if (window.showToast) window.showToast(`Stock picked: ${found.name} (-10 units). Remaining: ${found.stock}`, 'info');
            }
          }
          renderInventoryTable();
        }
      });
    });
  }

  // =========================================================================
  // 3. KANBAN WORK ORDER PIPELINE (/api/kanban)
  // =========================================================================
  async function loadKanban() {
    try {
      const res = await fetch('/api/kanban');
      if (res.ok) {
        const data = await res.json();
        kanbanOrders = data.orders || data;
        renderKanban();
        return;
      }
    } catch (e) {
      console.warn('Kanban fetch fallback:', e);
    }

    kanbanOrders = [
      { id: 'WO-9021', title: '500x Titanium Milling Housings', client: 'SpaceX Propulsion', stage: 'backlog', priority: 'HIGH' },
      { id: 'WO-8944', title: '1,500x SMT Microcontroller PCBs', client: 'Tesla Energy', stage: 'assembly', priority: 'NORMAL' },
      { id: 'WO-9104', title: '100x Laser Calibration Arrays', client: 'Lockheed Optical', stage: 'qa', priority: 'HIGH' },
      { id: 'WO-8802', title: '250x Brushless Actuators', client: 'Boston Dynamics', stage: 'dispatched', priority: 'NORMAL' }
    ];

    renderKanban();
  }

  function renderKanban() {
    if (!colBacklog) return;

    const stages = {
      backlog: { col: colBacklog, count: countBacklog, next: 'assembly', nextLabel: 'Start Assembly →' },
      assembly: { col: colAssembly, count: countAssembly, next: 'qa', nextLabel: 'Send to QA →' },
      qa: { col: colQa, count: countQa, next: 'dispatched', nextLabel: 'Dispatch Batch →' },
      dispatched: { col: colDispatched, count: countDispatched, next: null, nextLabel: 'Complete' }
    };

    Object.keys(stages).forEach(key => {
      stages[key].col.innerHTML = '';
      const list = kanbanOrders.filter(o => o.stage === key);
      stages[key].count.textContent = list.length;

      list.forEach(order => {
        const card = document.createElement('div');
        card.className = 'p-3.5 rounded-xl bg-[#080C18] border border-white/[0.08] hover:border-white/[0.15] space-y-2 text-xs transition-all';
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <span class="font-mono font-bold text-cyan-400">${order.id}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded ${order.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-slate-700 text-slate-300'}">${order.priority}</span>
          </div>
          <p class="font-bold text-white font-sans">${order.title}</p>
          <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
            <span>${order.client}</span>
            ${stages[key].next ? `<button data-id="${order.id}" class="advance-kanban text-emerald-400 hover:text-emerald-300 font-bold">${stages[key].nextLabel}</button>` : '<span class="text-emerald-400 font-bold">Shipped</span>'}
          </div>
        `;
        stages[key].col.appendChild(card);
      });
    });

    document.querySelectorAll('.advance-kanban').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const order = kanbanOrders.find(o => o.id === id);
        if (order) {
          const nextMap = { backlog: 'assembly', assembly: 'qa', qa: 'dispatched' };
          const nextStage = nextMap[order.stage];
          if (nextStage) {
            order.stage = nextStage;
            if (window.showToast) window.showToast(`Work Order ${order.id} routed to ${nextStage.toUpperCase()} stage.`, 'success');
            renderKanban();
          }
        }
      });
    });
  }

  // =========================================================================
  // 4. PURCHASE ORDER MODAL & SUBMISSION
  // =========================================================================
  openNewPOModalBtn?.addEventListener('click', () => {
    if (window.BFAuth && !window.BFAuth.hasPermission('purchase_order_approval')) {
      if (window.showToast) window.showToast('Access Denied: Persona lacks Purchase Order Authorization authority.', 'error');
      return;
    }
    newPOModal?.classList.remove('hidden');
  });

  closePOModalBtn?.addEventListener('click', () => {
    newPOModal?.classList.add('hidden');
  });

  purchaseOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const supplier = document.getElementById('poSupplier').value;
    const skuName = document.getElementById('poSku').value.trim();
    const qty = parseInt(document.getElementById('poQuantity').value, 10) || 100;
    const cost = parseFloat(document.getElementById('poUnitCost').value) || 10.0;

    // Check if SKU exists in inventory
    const existing = inventoryData.find(i => skuName.includes(i.sku) || i.name.toLowerCase().includes(skuName.toLowerCase()));
    if (existing) {
      existing.stock += qty;
    } else {
      inventoryData.unshift({
        sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        name: skuName,
        bay: 'Bay E-01',
        stock: qty,
        min: 50,
        cost: cost
      });
    }

    renderInventoryTable();
    newPOModal?.classList.add('hidden');

    const totalVal = (qty * cost).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (window.showToast) {
      window.showToast(`Purchase Order dispatched to ${supplier} for ${qty} units (${totalVal}). Inventory updated.`, 'success');
    }
  });

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => {
        t.className = 'nav-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap font-mono';
      });
      tab.className = 'nav-tab active-tab flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 border-emerald-400 text-emerald-300 transition-colors whitespace-nowrap font-mono';

      tabContents.forEach(c => c.classList.add('hidden'));
      document.getElementById('tab-' + target)?.classList.remove('hidden');
    });
  });

  // Initialize
  initThreeJSFactory();
  loadInventory();
  loadKanban();

})();
