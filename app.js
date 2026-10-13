// TableMaster Pro - Core Restaurant Management Logic & State

class RestaurantApp {
  constructor() {
    this.config = INITIAL_RESTAURANT_CONFIG;
    this.sections = SECTIONS;
    this.menuCategories = MENU_CATEGORIES;
    this.menuItems = MENU_ITEMS;
    this.staff = STAFF_MEMBERS;

    // Load persisted state or fallback
    this.tables = this.loadState("tm_tables", INITIAL_TABLES);
    this.reservations = this.loadState("tm_reservations", INITIAL_RESERVATIONS);
    this.completedTransactions = this.loadState("tm_transactions", [
      { id: "tx-1", tableId: "T2", amount: 124.50, timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), itemsCount: 5, server: "Elena Vance" },
      { id: "tx-2", tableId: "P2", amount: 88.00, timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), itemsCount: 3, server: "David Kim" },
      { id: "tx-3", tableId: "B2", amount: 48.50, timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), itemsCount: 2, server: "Amara Patel" }
    ]);

    // View state
    this.currentView = "floor"; // floor | reservations | kot | analytics
    this.selectedTableId = null;
    this.sectionFilter = "all";
    this.statusFilter = "all";
    this.capacityFilter = "all";
    this.menuFilterCategory = "all";
    this.menuSearchQuery = "";
    this.reservationSearchQuery = "";
    this.soundEnabled = true;

    // Audio synthesizer for interaction feedback
    this.audioCtx = null;

    this.init();
  }

  loadState(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(fallback));
    } catch (e) {
      console.warn("Storage load error:", e);
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  saveState() {
    try {
      localStorage.setItem("tm_tables", JSON.stringify(this.tables));
      localStorage.setItem("tm_reservations", JSON.stringify(this.reservations));
      localStorage.setItem("tm_transactions", JSON.stringify(this.completedTransactions));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  init() {
    this.bindEvents();
    this.renderHeaderStats();
    this.renderFloorGrid();
    this.renderReservationList();
    this.renderKOTBoard();
    this.renderAnalytics();
    this.startLiveTimers();
  }

  // Audio tone generation for tactile feedback
  playTone(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === "seat") {
        // Welcoming two-tone chime
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "add-item") {
        // Quick subtle click/blip
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "paid") {
        // Register payment chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "alert") {
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  showNotification(message, type = "success") {
    const banner = document.getElementById("toastNotification");
    if (!banner) return;
    banner.innerText = message;
    banner.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm transition-all transform duration-300 z-50 flex items-center gap-2 ${
      type === "success" ? "bg-emerald-600 border border-emerald-400" :
      type === "warning" ? "bg-amber-600 border border-amber-400" : "bg-blue-600 border border-blue-400"
    }`;
    banner.classList.remove("opacity-0", "translate-y-8", "pointer-events-none");
    setTimeout(() => {
      banner.classList.add("opacity-0", "translate-y-8", "pointer-events-none");
    }, 3200);
  }

  startLiveTimers() {
    setInterval(() => {
      this.updateElapsedTimers();
      this.renderHeaderStats();
    }, 30000); // refresh every 30 seconds
  }

  updateElapsedTimers() {
    document.querySelectorAll("[data-elapsed-for]").forEach(el => {
      const iso = el.getAttribute("data-elapsed-for");
      if (iso) {
        el.innerText = this.formatElapsed(iso);
      }
    });
  }

  formatElapsed(isoString) {
    if (!isoString) return "";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hrs = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return `${hrs}h ${remMins}m`;
  }

  // Calculate bill for a table
  calculateBill(table) {
    const orders = table.orders || [];
    const subtotal = orders.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * this.config.taxRate;
    const serviceCharge = subtotal * this.config.serviceChargeRate;
    const grandTotal = subtotal + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, grandTotal };
  }

  // Header quick statistics
  renderHeaderStats() {
    const totalTables = this.tables.length;
    const occupiedTables = this.tables.filter(t => t.status === "occupied" || t.status === "billing");
    const occupancyRate = Math.round((occupiedTables.length / totalTables) * 100);

    const activeGuests = occupiedTables.reduce((sum, t) => sum + (t.currentGuest ? (t.currentGuest.partySize || 0) : 0), 0);
    
    // Live sales: completed transactions today + active unbilled subtotals
    const activeSubtotals = occupiedTables.reduce((sum, t) => sum + this.calculateBill(t).grandTotal, 0);
    const closedSales = this.completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const todayTotalRevenue = closedSales + activeSubtotals;

    const availableCount = this.tables.filter(t => t.status === "available").length;
    const reservedCount = this.tables.filter(t => t.status === "reserved").length;

    const statOccupancy = document.getElementById("statOccupancy");
    const statActiveGuests = document.getElementById("statActiveGuests");
    const statTotalRevenue = document.getElementById("statTotalRevenue");
    const statAvailable = document.getElementById("statAvailable");
    const statReserved = document.getElementById("statReserved");

    if (statOccupancy) statOccupancy.innerText = `${occupancyRate}% (${occupiedTables.length}/${totalTables})`;
    if (statActiveGuests) statActiveGuests.innerText = activeGuests;
    if (statTotalRevenue) statTotalRevenue.innerText = `${this.config.currency}${todayTotalRevenue.toFixed(2)}`;
    if (statAvailable) statAvailable.innerText = availableCount;
    if (statReserved) statReserved.innerText = reservedCount;
  }

  // Filter & Render floor plan tables
  renderFloorGrid() {
    const container = document.getElementById("floorGridContainer");
    if (!container) return;

    let filtered = this.tables;

    // Section filter
    if (this.sectionFilter !== "all") {
      filtered = filtered.filter(t => t.section === this.sectionFilter);
    }

    // Status filter
    if (this.statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === this.statusFilter);
    }

    // Capacity filter
    if (this.capacityFilter !== "all") {
      const cap = parseInt(this.capacityFilter, 10);
      if (cap === 6) {
        filtered = filtered.filter(t => t.capacity >= 6);
      } else {
        filtered = filtered.filter(t => t.capacity === cap);
      }
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
          <p class="text-lg font-medium text-slate-300">No tables match your selected filters</p>
          <p class="text-sm text-slate-500 mt-1">Try resetting the section or status filters above.</p>
          <button id="resetFiltersBtn" class="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-sm transition">
            Reset Filters
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
        this.sectionFilter = "all";
        this.statusFilter = "all";
        this.capacityFilter = "all";
        document.querySelectorAll(".section-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.section === "all"));
        document.querySelectorAll(".status-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.status === "all"));
        this.renderFloorGrid();
      });
      return;
    }

    container.innerHTML = filtered.map(t => this.generateTableCardHTML(t)).join("");
    if (window.lucide) lucide.createIcons();
    this.updateElapsedTimers();
  }

  generateTableCardHTML(t) {
    const isSelected = this.selectedTableId === t.id;
    const bill = this.calculateBill(t);

    // Status styling
    let statusBadge = "";
    let borderStyle = "border-slate-800 hover:border-slate-600";
    let bgStyle = "bg-slate-900/90";
    let pulseGlow = "";

    switch (t.status) {
      case "available":
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Available
        </span>`;
        borderStyle = "border-emerald-900/40 hover:border-emerald-500/80";
        break;
      case "occupied":
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Occupied
        </span>`;
        borderStyle = "border-rose-900/50 hover:border-rose-500/80";
        pulseGlow = "shadow-lg shadow-rose-950/20";
        break;
      case "billing":
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/70">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Bill Due
        </span>`;
        borderStyle = "border-amber-600/60 hover:border-amber-400";
        pulseGlow = "shadow-lg shadow-amber-950/30";
        break;
      case "reserved":
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Reserved
        </span>`;
        borderStyle = "border-indigo-900/40 hover:border-indigo-500/80";
        break;
      case "cleaning":
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-600">
          <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i> Turnaround
        </span>`;
        borderStyle = "border-slate-700/60 hover:border-slate-500";
        break;
    }

    const sectionName = this.sections.find(s => s.id === t.section)?.name || t.section;

    // Body content based on state
    let bodyContent = "";
    if (t.status === "occupied" || t.status === "billing") {
      const itemCount = (t.orders || []).reduce((acc, i) => acc + i.qty, 0);
      bodyContent = `
        <div class="mt-3 pt-3 border-t border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-300">
            <span class="font-medium text-slate-200 truncate max-w-[120px] flex items-center gap-1">
              <i data-lucide="user" class="w-3 h-3 text-amber-400"></i> ${t.currentGuest?.name || "Guest"}
            </span>
            <span class="text-slate-400 font-mono flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3 text-slate-500"></i>
              <span data-elapsed-for="${t.currentGuest?.seatedAt}">${this.formatElapsed(t.currentGuest?.seatedAt)}</span>
            </span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>${itemCount} items ordered</span>
            <span class="text-emerald-400 font-semibold font-mono text-sm">${this.config.currency}${bill.grandTotal.toFixed(2)}</span>
          </div>
          <div class="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <i data-lucide="badge-percent" class="w-3 h-3 text-slate-600"></i> Server: ${t.currentGuest?.server || "Unassigned"}
          </div>
        </div>
      `;
    } else if (t.status === "reserved") {
      bodyContent = `
        <div class="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
          <div class="text-indigo-300 font-medium truncate flex items-center gap-1">
            <i data-lucide="calendar" class="w-3 h-3"></i> ${t.reservationInfo?.guestName || "Booked Guest"}
          </div>
          <div class="text-slate-400 flex items-center justify-between">
            <span>Slot: <strong class="text-slate-200">${t.reservationInfo?.time || "TBD"}</strong></span>
            <span>${t.reservationInfo?.partySize || t.capacity} guests</span>
          </div>
        </div>
      `;
    } else if (t.status === "cleaning") {
      bodyContent = `
        <div class="mt-3 pt-3 border-t border-slate-800 text-center py-2">
          <p class="text-xs text-slate-400">Busser needed to sanitize table</p>
          <span class="inline-block mt-1 text-[11px] text-amber-400 font-medium hover:underline cursor-pointer mark-clean-btn" data-table-id="${t.id}">
            Click to Mark Clean
          </span>
        </div>
      `;
    } else {
      // Available
      bodyContent = `
        <div class="mt-3 pt-3 border-t border-slate-800/80 text-center py-3">
          <p class="text-xs text-slate-400">Ready for walk-in seating</p>
          <div class="mt-2 flex justify-center gap-1 text-slate-500 text-xs">
            <span class="px-2 py-0.5 rounded bg-slate-800/60 text-[11px]">Up to ${t.capacity} guests</span>
          </div>
        </div>
      `;
    }

    return `
      <div 
        class="table-card relative group rounded-2xl p-4 border transition-all duration-200 cursor-pointer ${bgStyle} ${borderStyle} ${pulseGlow} ${isSelected ? 'ring-2 ring-amber-400' : ''}"
        data-table-id="${t.id}"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-white tracking-wide">${t.name}</span>
              <span class="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md">
                ${sectionName}
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span class="flex items-center gap-1">
                <i data-lucide="users" class="w-3 h-3 text-slate-400"></i> ${t.capacity} seats
              </span>
              <span class="text-slate-600">•</span>
              <span class="capitalize text-slate-400">${t.shape}</span>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        ${bodyContent}

        <!-- Hover Action Quick Bar -->
        <div class="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200 transition">
          <span class="text-[11px] text-slate-500 group-hover:text-amber-400/90 transition flex items-center gap-1">
            <i data-lucide="expand" class="w-3 h-3"></i> Manage Table
          </span>
          ${t.status === "available" ? `
            <button class="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[11px] font-medium transition quick-seat-btn" data-table-id="${t.id}" onclick="event.stopPropagation(); restaurantApp.openQuickSeatModal('${t.id}')">
              Quick Seat
            </button>
          ` : t.status === "billing" ? `
            <button class="px-2 py-1 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded text-[11px] font-medium transition quick-settle-btn" data-table-id="${t.id}" onclick="event.stopPropagation(); restaurantApp.openTableDrawer('${t.id}')">
              Settle Bill
            </button>
          ` : t.status === "cleaning" ? `
            <button class="px-2 py-1 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white rounded text-[11px] font-medium transition" onclick="event.stopPropagation(); restaurantApp.updateTableStatus('${t.id}', 'available')">
              Cleaned ✓
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Open the detail drawer for a table
  openTableDrawer(tableId) {
    this.selectedTableId = tableId;
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return;

    const drawer = document.getElementById("tableDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (!drawer || !backdrop) return;

    this.renderDrawerContent(table);
    drawer.classList.remove("translate-x-full");
    backdrop.classList.remove("hidden");
    this.renderFloorGrid();
  }

  closeTableDrawer() {
    const drawer = document.getElementById("tableDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (drawer) drawer.classList.add("translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
    this.selectedTableId = null;
    this.renderFloorGrid();
  }

  renderDrawerContent(table) {
    const container = document.getElementById("drawerBody");
    if (!container) return;

    const bill = this.calculateBill(table);
    const sectionName = this.sections.find(s => s.id === table.section)?.name || table.section;

    // Render Drawer Top Header
    let content = `
      <div class="p-6 border-b border-slate-800 bg-slate-900/90">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold text-white">${table.name}</h2>
              <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
                ${sectionName}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span><i data-lucide="users" class="w-3.5 h-3.5 inline mr-1 text-slate-500"></i> ${table.capacity} Person Table</span>
              <span>•</span>
              <span class="capitalize">${table.shape} Style</span>
            </p>
          </div>
          <button id="closeDrawerBtn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Status Controller -->
        <div class="mt-4 flex items-center gap-2">
          <label class="text-xs text-slate-400 font-medium">Status:</label>
          <select id="drawerStatusSelect" class="bg-slate-800 border border-slate-700 text-white rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-amber-400 font-medium cursor-pointer">
            <option value="available" ${table.status === 'available' ? 'selected' : ''}>🟢 Available</option>
            <option value="occupied" ${table.status === 'occupied' ? 'selected' : ''}>🔴 Occupied & Dining</option>
            <option value="billing" ${table.status === 'billing' ? 'selected' : ''}>🟣 Billed / Awaiting Payment</option>
            <option value="reserved" ${table.status === 'reserved' ? 'selected' : ''}>🔵 Reserved</option>
            <option value="cleaning" ${table.status === 'cleaning' ? 'selected' : ''}>⚪ Needs Cleaning</option>
          </select>
        </div>
      </div>
    `;

    // Active Guest Details or Seating Trigger
    if (table.status === "occupied" || table.status === "billing") {
      content += `
        <div class="p-6 border-b border-slate-800 bg-slate-900/40">
          <div class="flex items-center justify-between">
            <h3 class="text-xs uppercase tracking-wider font-semibold text-slate-400">Current Party</h3>
            <span class="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i data-lucide="timer" class="w-3 h-3"></i> Seated: <span data-elapsed-for="${table.currentGuest?.seatedAt}">${this.formatElapsed(table.currentGuest?.seatedAt)}</span>
            </span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-800">
              <span class="text-[11px] text-slate-400 block">Lead Guest</span>
              <span class="font-semibold text-white truncate block mt-0.5">${table.currentGuest?.name || "Walk-In"}</span>
              <span class="text-xs text-slate-400 block">${table.currentGuest?.partySize || table.capacity} Guests • ${table.currentGuest?.phone || "No phone"}</span>
            </div>
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-800">
              <span class="text-[11px] text-slate-400 block">Assigned Server</span>
              <select id="drawerServerSelect" class="bg-transparent text-white font-semibold text-sm w-full mt-0.5 border-b border-slate-700 focus:outline-none cursor-pointer">
                ${this.staff.map(s => `<option value="${s.name}" class="bg-slate-900" ${table.currentGuest?.server === s.name ? 'selected' : ''}>${s.name} (${s.role})</option>`).join("")}
              </select>
              <span class="text-[11px] text-slate-500 block mt-1">Special: ${table.currentGuest?.notes || "None"}</span>
            </div>
          </div>
        </div>

        <!-- Orders Section -->
        <div class="p-6 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <i data-lucide="shopping-bag" class="w-4 h-4 text-amber-400"></i> Table Orders
            </h3>
            <button id="toggleMenuPickerBtn" class="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Add Menu Items
            </button>
          </div>

          <!-- Menu Catalog Drawer (Collapsible/Inline) -->
          <div id="inlineMenuPicker" class="hidden mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs uppercase font-bold text-slate-300">Quick Menu Browser</h4>
              <div class="relative w-44">
                <input type="text" id="inlineMenuSearch" placeholder="Search dish..." class="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-amber-400">
              </div>
            </div>

            <!-- Category pills -->
            <div class="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3" id="inlineCategoryPills">
              <button class="px-2 py-1 rounded text-[11px] font-medium bg-amber-500 text-slate-950 inline-cat-btn" data-cat="all">All</button>
              ${this.menuCategories.map(c => `
                <button class="px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 inline-cat-btn" data-cat="${c.id}">${c.name}</button>
              `).join("")}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1" id="inlineMenuItemsList">
              ${this.renderInlineMenuItems("all", "")}
            </div>
          </div>

          <!-- Order item list -->
          <div class="space-y-2.5">
            ${(table.orders && table.orders.length > 0) ? table.orders.map(item => `
              <div class="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <div class="flex-1 pr-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-white">${item.name}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${item.status === 'served' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}">
                      ${item.status === 'served' ? 'Served' : 'Preparing'}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    ${this.config.currency}${item.price.toFixed(2)} each ${item.note ? `• <span class="text-amber-300 italic">${item.note}</span>` : ''}
                  </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="flex items-center gap-2">
                  <div class="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                    <button class="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs qty-decrease-btn" data-order-id="${item.id}">-</button>
                    <span class="px-2 py-1 text-xs font-semibold text-white font-mono">${item.qty}</span>
                    <button class="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs qty-increase-btn" data-order-id="${item.id}">+</button>
                  </div>
                  <span class="text-sm font-semibold font-mono text-emerald-400 w-16 text-right">
                    ${this.config.currency}${(item.price * item.qty).toFixed(2)}
                  </span>
                  <button class="text-slate-500 hover:text-rose-400 p-1 transition remove-order-btn" data-order-id="${item.id}" title="Remove item">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join("") : `
              <div class="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <i data-lucide="utensils" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                <p class="text-sm">No items added to this table yet.</p>
                <p class="text-xs mt-1">Click "Add Menu Items" above to take order.</p>
              </div>
            `}
          </div>
        </div>

        <!-- Bill Total & Checkout Footer -->
        <div class="p-6 border-t border-slate-800 bg-slate-900/90 space-y-3">
          <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-mono">${this.config.currency}${bill.subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Sales Tax (${(this.config.taxRate * 100).toFixed(0)}%):</span>
              <span class="font-mono">${this.config.currency}${bill.tax.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Service Charge (${(this.config.serviceChargeRate * 100).toFixed(0)}%):</span>
              <span class="font-mono">${this.config.currency}${bill.serviceCharge.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span class="font-mono text-emerald-400">${this.config.currency}${bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button id="printReceiptBtn" class="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
              <i data-lucide="printer" class="w-4 h-4 text-amber-400"></i> Print Receipt
            </button>
            <button id="sendKOTBtn" class="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition">
              <i data-lucide="chef-hat" class="w-4 h-4"></i> Send to Kitchen
            </button>
          </div>

          <button id="settleAndFreeTableBtn" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i> Settle Bill & Free Table
          </button>
        </div>
      `;
    } else if (table.status === "available") {
      content += `
        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <div class="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-5 text-center">
            <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <i data-lucide="check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-base font-bold text-white">Table Ready for Guests</h3>
            <p class="text-xs text-slate-400 mt-1">This table is clean, sanitized, and ready for immediate seating.</p>
          </div>

          <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 class="text-xs uppercase font-bold text-amber-400 tracking-wider">Quick Seat Walk-In Party</h4>
            
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Guest / Party Name</label>
              <input type="text" id="seatGuestName" placeholder="e.g. Liam Johnson" class="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Party Size</label>
                <input type="number" id="seatPartySize" value="${Math.min(2, table.capacity)}" min="1" max="${table.capacity + 2}" class="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400">
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Assigned Server</label>
                <select id="seatServerSelect" class="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400">
                  ${this.staff.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Notes / Preferences (Optional)</label>
              <input type="text" id="seatNotes" placeholder="e.g. Window booth, anniversary, high chair" class="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400">
            </div>

            <button id="confirmSeatNowBtn" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Seat Party Now
            </button>
          </div>
        </div>
      `;
    } else if (table.status === "reserved") {
      const res = table.reservationInfo || {};
      content += `
        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <div class="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-5">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-2">Reservation Details</span>
            <h3 class="text-xl font-bold text-white">${res.guestName || "Reserved Party"}</h3>
            <div class="mt-3 space-y-2 text-xs text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-400">Time Slot:</span>
                <span class="font-semibold text-white font-mono">${res.time || "Tonight"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Party Size:</span>
                <span class="font-semibold text-white">${res.partySize || table.capacity} guests</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Phone Contact:</span>
                <span class="font-mono text-white">${res.phone || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Special Notes:</span>
                <span class="text-amber-300">${res.notes || "None"}</span>
              </div>
            </div>
          </div>

          <button id="seatReservedPartyBtn" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/40 transition">
            <i data-lucide="log-in" class="w-4 h-4"></i> Seat Reserved Party Now
          </button>
        </div>
      `;
    } else if (table.status === "cleaning") {
      content += `
        <div class="p-6 space-y-6 flex-1 overflow-y-auto text-center py-16">
          <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400 border border-slate-700">
            <i data-lucide="sparkles" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-white">Table Marked for Cleaning</h3>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            Previous guests have settled their bill. Once sanitized and reset with cutlery, mark table as available.
          </p>

          <button id="markCleanReadyBtn" class="mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Mark Clean & Available
          </button>
        </div>
      `;
    }

    container.innerHTML = content;
    if (window.lucide) lucide.createIcons();
    this.bindDrawerActions(table);
  }

  renderInlineMenuItems(categoryId, search) {
    let items = this.menuItems;
    if (categoryId !== "all") {
      items = items.filter(i => i.category === categoryId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }

    if (items.length === 0) {
      return `<p class="col-span-full py-4 text-center text-xs text-slate-500">No dishes match search.</p>`;
    }

    return items.map(dish => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
        <div class="truncate pr-2">
          <p class="text-xs font-semibold text-white truncate">${dish.name}</p>
          <p class="text-[11px] text-slate-400 font-mono">${this.config.currency}${dish.price.toFixed(2)}</p>
        </div>
        <button class="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded text-xs font-bold transition add-dish-to-table-btn" data-dish-id="${dish.id}">
          + Add
        </button>
      </div>
    `).join("");
  }

  bindDrawerActions(table) {
    // Close Drawer
    document.getElementById("closeDrawerBtn")?.addEventListener("click", () => this.closeTableDrawer());

    // Status Select
    document.getElementById("drawerStatusSelect")?.addEventListener("change", (e) => {
      this.updateTableStatus(table.id, e.target.value);
      this.openTableDrawer(table.id);
    });

    // Server Select
    document.getElementById("drawerServerSelect")?.addEventListener("change", (e) => {
      if (table.currentGuest) {
        table.currentGuest.server = e.target.value;
        this.saveState();
        this.renderFloorGrid();
      }
    });

    // Toggle Menu Picker
    const toggleMenuBtn = document.getElementById("toggleMenuPickerBtn");
    const menuPicker = document.getElementById("inlineMenuPicker");
    if (toggleMenuBtn && menuPicker) {
      toggleMenuBtn.addEventListener("click", () => {
        menuPicker.classList.toggle("hidden");
      });
    }

    // Category Filter in Menu Picker
    document.querySelectorAll(".inline-cat-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".inline-cat-btn").forEach(b => {
          b.className = "px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 inline-cat-btn";
        });
        e.target.className = "px-2 py-1 rounded text-[11px] font-medium bg-amber-500 text-slate-950 inline-cat-btn";
        const cat = e.target.getAttribute("data-cat");
        const search = document.getElementById("inlineMenuSearch")?.value || "";
        const list = document.getElementById("inlineMenuItemsList");
        if (list) {
          list.innerHTML = this.renderInlineMenuItems(cat, search);
          this.bindAddDishButtons(table);
        }
      });
    });

    // Search in Menu Picker
    document.getElementById("inlineMenuSearch")?.addEventListener("input", (e) => {
      const activeCat = document.querySelector(".inline-cat-btn.bg-amber-500")?.getAttribute("data-cat") || "all";
      const list = document.getElementById("inlineMenuItemsList");
      if (list) {
        list.innerHTML = this.renderInlineMenuItems(activeCat, e.target.value);
        this.bindAddDishButtons(table);
      }
    });

    this.bindAddDishButtons(table);

    // Quantity adjustments
    document.querySelectorAll(".qty-increase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-order-id");
        const order = table.orders?.find(o => o.id === orderId);
        if (order) {
          order.qty += 1;
          this.playTone("add-item");
          this.saveState();
          this.renderDrawerContent(table);
          this.renderFloorGrid();
          this.renderHeaderStats();
        }
      });
    });

    document.querySelectorAll(".qty-decrease-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-order-id");
        const order = table.orders?.find(o => o.id === orderId);
        if (order) {
          if (order.qty > 1) {
            order.qty -= 1;
          } else {
            table.orders = table.orders.filter(o => o.id !== orderId);
          }
          this.playTone("add-item");
          this.saveState();
          this.renderDrawerContent(table);
          this.renderFloorGrid();
          this.renderHeaderStats();
        }
      });
    });

    document.querySelectorAll(".remove-order-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-order-id");
        table.orders = table.orders?.filter(o => o.id !== orderId) || [];
        this.saveState();
        this.renderDrawerContent(table);
        this.renderFloorGrid();
        this.renderHeaderStats();
        this.showNotification("Item removed from order", "warning");
      });
    });

    // Send to Kitchen
    document.getElementById("sendKOTBtn")?.addEventListener("click", () => {
      if (!table.orders || table.orders.length === 0) {
        this.showNotification("Cannot send empty order to kitchen", "warning");
        return;
      }
      table.orders.forEach(o => {
        if (o.status !== "served") o.status = "preparing";
      });
      this.playTone("alert");
      this.saveState();
      this.showNotification(`Order dispatched to kitchen for ${table.name}!`, "success");
      this.renderDrawerContent(table);
      this.renderKOTBoard();
    });

    // Print Receipt
    document.getElementById("printReceiptBtn")?.addEventListener("click", () => {
      this.openThermalReceiptModal(table);
    });

    // Settle Bill & Free Table
    document.getElementById("settleAndFreeTableBtn")?.addEventListener("click", () => {
      this.settleBill(table);
    });

    // Confirm Seat Now (From Available)
    document.getElementById("confirmSeatNowBtn")?.addEventListener("click", () => {
      const name = document.getElementById("seatGuestName")?.value.trim() || "Walk-In Guest";
      const partySize = parseInt(document.getElementById("seatPartySize")?.value, 10) || 2;
      const server = document.getElementById("seatServerSelect")?.value || "Elena Vance";
      const notes = document.getElementById("seatNotes")?.value.trim() || "";

      this.seatParty(table.id, {
        name,
        partySize,
        server,
        notes,
        phone: "+1 555-0100",
        seatedAt: new Date().toISOString()
      });
    });

    // Seat Reserved Party
    document.getElementById("seatReservedPartyBtn")?.addEventListener("click", () => {
      const res = table.reservationInfo || {};
      this.seatParty(table.id, {
        name: res.guestName || "Reserved Guest",
        partySize: res.partySize || table.capacity,
        server: "Elena Vance",
        notes: res.notes || "",
        phone: res.phone || "",
        seatedAt: new Date().toISOString()
      });
    });

    // Mark Clean & Ready
    document.getElementById("markCleanReadyBtn")?.addEventListener("click", () => {
      this.updateTableStatus(table.id, "available");
      this.openTableDrawer(table.id);
    });
  }

  bindAddDishButtons(table) {
    document.querySelectorAll(".add-dish-to-table-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const dishId = btn.getAttribute("data-dish-id");
        const dish = this.menuItems.find(m => m.id === dishId);
        if (!dish) return;

        if (!table.orders) table.orders = [];

        // Check if item already in order
        const existing = table.orders.find(o => o.itemId === dish.id);
        if (existing) {
          existing.qty += 1;
        } else {
          table.orders.push({
            id: "o-" + Date.now() + "-" + Math.floor(Math.random() * 100),
            itemId: dish.id,
            name: dish.name,
            price: dish.price,
            qty: 1,
            note: "",
            status: "preparing"
          });
        }

        this.playTone("add-item");
        this.saveState();
        this.renderDrawerContent(table);
        this.renderFloorGrid();
        this.renderHeaderStats();
        this.showNotification(`Added ${dish.name} to ${table.name}`);
      });
    });
  }

  // Seat party helper
  seatParty(tableId, guestData) {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return;

    table.status = "occupied";
    table.currentGuest = guestData;
    table.reservationInfo = null;
    if (!table.orders) table.orders = [];

    // Mark any matching reservation as seated
    const matchedRes = this.reservations.find(r => r.tableId === tableId && r.status === "confirmed");
    if (matchedRes) {
      matchedRes.status = "seated";
    }

    this.playTone("seat");
    this.saveState();
    this.renderFloorGrid();
    this.renderHeaderStats();
    this.renderReservationList();
    this.openTableDrawer(tableId);
    this.showNotification(`Party seated at ${table.name}!`, "success");
  }

  // Settle bill
  settleBill(table) {
    const bill = this.calculateBill(table);

    // Record closed transaction
    const tx = {
      id: "tx-" + Date.now(),
      tableId: table.id,
      tableName: table.name,
      amount: bill.grandTotal,
      timestamp: new Date().toISOString(),
      itemsCount: (table.orders || []).reduce((sum, i) => sum + i.qty, 0),
      server: table.currentGuest?.server || "Server",
      guest: table.currentGuest?.name || "Guest"
    };

    this.completedTransactions.unshift(tx);

    // Reset table to cleaning
    table.status = "cleaning";
    table.currentGuest = null;
    table.orders = [];

    this.playTone("paid");
    this.saveState();
    this.renderFloorGrid();
    this.renderHeaderStats();
    this.renderAnalytics();
    this.openTableDrawer(table.id);
    this.showNotification(`Bill of ${this.config.currency}${bill.grandTotal.toFixed(2)} settled for ${table.name}! Table set to cleaning.`, "success");
  }

  updateTableStatus(tableId, newStatus) {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return;

    table.status = newStatus;
    if (newStatus === "available") {
      table.currentGuest = null;
      table.orders = [];
      table.reservationInfo = null;
    }
    this.saveState();
    this.renderFloorGrid();
    this.renderHeaderStats();
    this.showNotification(`${table.name} status updated to ${newStatus}`);
  }

  // Quick seat walk-in modal
  openQuickSeatModal(preferredTableId = null) {
    const modal = document.getElementById("quickSeatModal");
    if (!modal) return;

    const tableSelect = document.getElementById("qsTableSelect");
    if (tableSelect) {
      const availTables = this.tables.filter(t => t.status === "available" || t.id === preferredTableId);
      tableSelect.innerHTML = availTables.map(t => `
        <option value="${t.id}" ${t.id === preferredTableId ? 'selected' : ''}>
          ${t.name} (${t.capacity} seats, ${this.sections.find(s => s.id === t.section)?.name || t.section})
        </option>
      `).join("");
    }

    modal.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  }

  closeQuickSeatModal() {
    const modal = document.getElementById("quickSeatModal");
    if (modal) modal.classList.add("hidden");
  }

  // Thermal Receipt Modal
  openThermalReceiptModal(table) {
    const modal = document.getElementById("thermalReceiptModal");
    const container = document.getElementById("thermalReceiptContent");
    if (!modal || !container) return;

    const bill = this.calculateBill(table);
    const dateStr = new Date().toLocaleString();

    container.innerHTML = `
      <div class="text-center pb-4 border-b border-dashed border-slate-400">
        <h2 class="text-xl font-bold tracking-tight uppercase">${this.config.name}</h2>
        <p class="text-xs text-slate-600 mt-0.5">${this.config.tagline}</p>
        <p class="text-[11px] text-slate-500 mt-1">${this.config.address}</p>
        <p class="text-[11px] text-slate-500">Tel: ${this.config.phone}</p>
      </div>

      <div class="py-3 text-xs border-b border-dashed border-slate-400 space-y-1">
        <div class="flex justify-between">
          <span>Table: <strong>${table.name}</strong></span>
          <span>Server: <strong>${table.currentGuest?.server || 'Server'}</strong></span>
        </div>
        <div class="flex justify-between">
          <span>Date: ${dateStr}</span>
          <span>Guests: ${table.currentGuest?.partySize || table.capacity}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Receipt #: ${'REC-' + Math.floor(100000 + Math.random() * 900000)}</span>
          <span>Dine-In</span>
        </div>
      </div>

      <!-- Itemized lines -->
      <div class="py-3 text-xs border-b border-dashed border-slate-400 space-y-2">
        <div class="flex justify-between font-bold text-slate-700">
          <span>QTY ITEM</span>
          <span>AMOUNT</span>
        </div>
        ${(table.orders || []).map(item => `
          <div class="flex justify-between">
            <span class="truncate pr-2">${item.qty}x ${item.name}</span>
            <span class="font-mono">${this.config.currency}${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join("")}
      </div>

      <!-- Totals -->
      <div class="py-3 text-xs space-y-1.5 border-b border-dashed border-slate-400">
        <div class="flex justify-between">
          <span>SUBTOTAL:</span>
          <span class="font-mono">${this.config.currency}${bill.subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>TAX (${(this.config.taxRate * 100).toFixed(0)}%):</span>
          <span class="font-mono">${this.config.currency}${bill.tax.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>SERVICE (${(this.config.serviceChargeRate * 100).toFixed(0)}%):</span>
          <span class="font-mono">${this.config.currency}${bill.serviceCharge.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm font-bold pt-2 border-t border-dashed border-slate-400">
          <span>TOTAL:</span>
          <span class="font-mono">${this.config.currency}${bill.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <!-- Footer Barcode & Thank you note -->
      <div class="pt-4 text-center text-xs space-y-2">
        <p class="font-semibold text-slate-700">THANK YOU FOR DINING WITH US!</p>
        <p class="text-[11px] text-slate-500">WiFi: Etoile_Guest • Pass: bonappetit</p>
        <div class="font-mono text-xs tracking-widest text-slate-400 py-1">
          ||| | ||||| || |||||| | ||||| |||
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  closeThermalReceiptModal() {
    const modal = document.getElementById("thermalReceiptModal");
    if (modal) modal.classList.add("hidden");
  }

  // Reservation management rendering
  renderReservationList() {
    const container = document.getElementById("reservationListContainer");
    if (!container) return;

    let list = this.reservations;
    if (this.reservationSearchQuery.trim()) {
      const q = this.reservationSearchQuery.toLowerCase();
      list = list.filter(r => r.guestName.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q) || r.tableId.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-slate-500">
          <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
          <p class="text-base font-medium text-slate-300">No reservations found</p>
          <p class="text-xs text-slate-500 mt-1">Book a table reservation using the button above.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = list.map(res => {
      const table = this.tables.find(t => t.id === res.tableId);
      const tableName = table ? table.name : res.tableId;
      const isSeated = res.status === "seated";
      const isCancelled = res.status === "cancelled";

      return `
        <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex flex-col items-center justify-center font-bold">
              <span class="text-sm font-mono">${res.time}</span>
              <span class="text-[9px] uppercase text-indigo-300">Today</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-bold text-white">${res.guestName}</h4>
                <span class="text-xs px-2 py-0.5 rounded-full ${
                  isSeated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  isCancelled ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  'bg-indigo-950 text-indigo-400 border border-indigo-800'
                }">
                  ${res.status}
                </span>
                ${(res.tags || []).map(tag => `
                  <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">${tag}</span>
                `).join("")}
              </div>
              <div class="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span class="flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-500"></i> ${res.phone}</span>
                <span>•</span>
                <span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3 text-slate-500"></i> Party of ${res.partySize}</span>
                <span>•</span>
                <span class="flex items-center gap-1"><i data-lucide="layout" class="w-3 h-3 text-slate-500"></i> Table: <strong>${tableName}</strong></span>
              </div>
              ${res.notes ? `<p class="text-xs text-amber-400/80 mt-1 italic">Note: "${res.notes}"</p>` : ''}
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center">
            ${!isSeated && !isCancelled ? `
              <button class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition seat-reservation-btn" data-res-id="${res.id}">
                <i data-lucide="user-check" class="w-3.5 h-3.5"></i> Seat Party
              </button>
              <button class="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-semibold transition cancel-reservation-btn" data-res-id="${res.id}">
                Cancel
              </button>
            ` : `
              <span class="text-xs text-slate-500 font-medium">Completed</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
    this.bindReservationActions();
  }

  bindReservationActions() {
    document.querySelectorAll(".seat-reservation-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const resId = btn.getAttribute("data-res-id");
        const res = this.reservations.find(r => r.id === resId);
        if (!res) return;

        this.seatParty(res.tableId, {
          name: res.guestName,
          partySize: res.partySize,
          phone: res.phone,
          server: "Elena Vance",
          notes: res.notes,
          seatedAt: new Date().toISOString()
        });

        res.status = "seated";
        this.saveState();
        this.renderReservationList();
        this.switchView("floor");
      });
    });

    document.querySelectorAll(".cancel-reservation-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const resId = btn.getAttribute("data-res-id");
        const res = this.reservations.find(r => r.id === resId);
        if (!res) return;

        res.status = "cancelled";
        const table = this.tables.find(t => t.id === res.tableId);
        if (table && table.status === "reserved") {
          table.status = "available";
          table.reservationInfo = null;
        }

        this.saveState();
        this.renderReservationList();
        this.renderFloorGrid();
        this.showNotification(`Reservation for ${res.guestName} cancelled.`, "warning");
      });
    });
  }

  // Kitchen Order Ticket (KOT) Screen
  renderKOTBoard() {
    const container = document.getElementById("kotBoardContainer");
    if (!container) return;

    // Collect all active table orders
    const activeTables = this.tables.filter(t => (t.status === "occupied" || t.status === "billing") && t.orders && t.orders.length > 0);

    if (activeTables.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500">
          <i data-lucide="chef-hat" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
          <p class="text-base font-medium text-slate-300">Kitchen Display is Clean</p>
          <p class="text-xs text-slate-500 mt-1">No active food orders in preparation right now.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = activeTables.map(t => {
      const items = t.orders || [];
      const preparingCount = items.filter(i => i.status === "preparing").length;
      const allServed = items.every(i => i.status === "served");

      return `
        <div class="bg-slate-900 border ${allServed ? 'border-emerald-800/40' : 'border-amber-700/60 shadow-lg shadow-amber-950/20'} rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-lg font-bold text-white">${t.name}</span>
                <span class="text-xs text-slate-400 block">${t.currentGuest?.name} • Server: ${t.currentGuest?.server || 'Staff'}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800">
                  <span data-elapsed-for="${t.currentGuest?.seatedAt}">${this.formatElapsed(t.currentGuest?.seatedAt)}</span>
                </span>
                <span class="text-[10px] text-slate-500 block mt-1">${items.length} items total</span>
              </div>
            </div>

            <!-- Items checklist -->
            <div class="py-3 space-y-2 text-xs">
              ${items.map(i => `
                <div class="flex items-center justify-between p-2 rounded-lg ${i.status === 'served' ? 'bg-slate-950/40 text-slate-500 line-through' : 'bg-slate-800/80 text-white'}">
                  <div>
                    <span class="font-bold text-amber-400 mr-1 font-mono">${i.qty}x</span>
                    <span>${i.name}</span>
                    ${i.note ? `<span class="block text-[11px] text-amber-300 italic not-italic">Note: ${i.note}</span>` : ''}
                  </div>
                  <button class="px-2 py-1 rounded text-[10px] font-bold ${i.status === 'served' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} transition kot-toggle-item-btn" data-table-id="${t.id}" data-order-id="${i.id}">
                    ${i.status === 'served' ? 'Served ✓' : 'Mark Ready'}
                  </button>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span class="text-slate-400">${preparingCount} dishes preparing</span>
            <button class="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg font-semibold transition kot-mark-all-btn" data-table-id="${t.id}">
              Mark All Served ✓
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
    this.bindKOTActions();
  }

  bindKOTActions() {
    document.querySelectorAll(".kot-toggle-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tableId = btn.getAttribute("data-table-id");
        const orderId = btn.getAttribute("data-order-id");
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        const order = table.orders?.find(o => o.id === orderId);
        if (order) {
          order.status = order.status === "served" ? "preparing" : "served";
          this.playTone("add-item");
          this.saveState();
          this.renderKOTBoard();
          if (this.selectedTableId === tableId) this.renderDrawerContent(table);
        }
      });
    });

    document.querySelectorAll(".kot-mark-all-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tableId = btn.getAttribute("data-table-id");
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        table.orders?.forEach(o => o.status = "served");
        this.playTone("alert");
        this.saveState();
        this.renderKOTBoard();
        if (this.selectedTableId === tableId) this.renderDrawerContent(table);
        this.showNotification(`All items for ${table.name} marked as served!`);
      });
    });
  }

  // Analytics View
  renderAnalytics() {
    const closedSales = this.completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const activeSubtotals = this.tables
      .filter(t => t.status === "occupied" || t.status === "billing")
      .reduce((sum, t) => sum + this.calculateBill(t).grandTotal, 0);

    const grossRevenue = closedSales + activeSubtotals;
    const totalTransactionsCount = this.completedTransactions.length;
    const avgCheck = totalTransactionsCount > 0 ? (closedSales / totalTransactionsCount) : 0;

    const elGross = document.getElementById("analyticsGrossRevenue");
    const elClosed = document.getElementById("analyticsClosedCount");
    const elAvgCheck = document.getElementById("analyticsAvgCheck");
    const elTxTable = document.getElementById("analyticsTxTableBody");

    if (elGross) elGross.innerText = `${this.config.currency}${grossRevenue.toFixed(2)}`;
    if (elClosed) elClosed.innerText = totalTransactionsCount;
    if (elAvgCheck) elAvgCheck.innerText = `${this.config.currency}${avgCheck.toFixed(2)}`;

    if (elTxTable) {
      if (this.completedTransactions.length === 0) {
        elTxTable.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">No settled transactions yet.</td></tr>`;
      } else {
        elTxTable.innerHTML = this.completedTransactions.map(tx => `
          <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs text-slate-300">
            <td class="py-3 px-4 font-mono text-slate-400">${tx.id}</td>
            <td class="py-3 px-4 font-semibold text-white">${tx.tableName || tx.tableId}</td>
            <td class="py-3 px-4">${tx.server || "Server"}</td>
            <td class="py-3 px-4 font-mono">${new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td class="py-3 px-4 font-mono font-bold text-emerald-400 text-right">${this.config.currency}${tx.amount.toFixed(2)}</td>
          </tr>
        `).join("");
      }
    }
  }

  // Navigation tab switcher
  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const isTarget = btn.getAttribute("data-view") === viewName;
      btn.classList.toggle("bg-amber-500", isTarget);
      btn.classList.toggle("text-slate-950", isTarget);
      btn.classList.toggle("text-slate-300", !isTarget);
      btn.classList.toggle("bg-slate-800", !isTarget);
    });

    document.getElementById("viewFloor")?.classList.toggle("hidden", viewName !== "floor");
    document.getElementById("viewReservations")?.classList.toggle("hidden", viewName !== "reservations");
    document.getElementById("viewKOT")?.classList.toggle("hidden", viewName !== "kot");
    document.getElementById("viewAnalytics")?.classList.toggle("hidden", viewName !== "analytics");

    if (viewName === "floor") this.renderFloorGrid();
    if (viewName === "reservations") this.renderReservationList();
    if (viewName === "kot") this.renderKOTBoard();
    if (viewName === "analytics") this.renderAnalytics();
  }

  // Global event bindings
  bindEvents() {
    // Navigation tabs
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchView(btn.getAttribute("data-view"));
      });
    });

    // Section filter buttons
    document.querySelectorAll(".section-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".section-filter-btn").forEach(b => {
          b.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white section-filter-btn transition";
        });
        const target = e.currentTarget;
        target.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 section-filter-btn transition";
        this.sectionFilter = target.getAttribute("data-section");
        this.renderFloorGrid();
      });
    });

    // Status filter select
    document.getElementById("floorStatusFilter")?.addEventListener("change", (e) => {
      this.statusFilter = e.target.value;
      this.renderFloorGrid();
    });

    // Capacity filter select
    document.getElementById("floorCapacityFilter")?.addEventListener("change", (e) => {
      this.capacityFilter = e.target.value;
      this.renderFloorGrid();
    });

    // Click on table card to open drawer
    document.getElementById("floorGridContainer")?.addEventListener("click", (e) => {
      const card = e.target.closest(".table-card");
      if (card) {
        const tableId = card.getAttribute("data-table-id");
        if (tableId) this.openTableDrawer(tableId);
      }
    });

    // Drawer backdrop close
    document.getElementById("drawerBackdrop")?.addEventListener("click", () => {
      this.closeTableDrawer();
    });

    // Quick Seat Top Button
    document.getElementById("topQuickSeatBtn")?.addEventListener("click", () => {
      this.openQuickSeatModal();
    });

    // Quick Seat Modal Close
    document.getElementById("closeQuickSeatModalBtn")?.addEventListener("click", () => {
      this.closeQuickSeatModal();
    });
    document.getElementById("cancelQuickSeatBtn")?.addEventListener("click", () => {
      this.closeQuickSeatModal();
    });

    // Quick Seat Form Submit
    document.getElementById("confirmQuickSeatModalBtn")?.addEventListener("click", () => {
      const tableId = document.getElementById("qsTableSelect")?.value;
      const guestName = document.getElementById("qsGuestName")?.value.trim() || "Walk-In Guest";
      const partySize = parseInt(document.getElementById("qsPartySize")?.value, 10) || 2;
      const server = document.getElementById("qsServerSelect")?.value || "Elena Vance";
      const notes = document.getElementById("qsNotes")?.value.trim() || "";

      if (!tableId) {
        this.showNotification("Please select an available table", "warning");
        return;
      }

      this.seatParty(tableId, {
        name: guestName,
        partySize,
        server,
        notes,
        phone: "+1 555-0100",
        seatedAt: new Date().toISOString()
      });

      this.closeQuickSeatModal();
    });

    // Thermal Receipt Close
    document.getElementById("closeReceiptModalBtn")?.addEventListener("click", () => {
      this.closeThermalReceiptModal();
    });
    document.getElementById("printNowBtn")?.addEventListener("click", () => {
      window.print();
    });

    // New Reservation Modal Open/Close
    document.getElementById("openNewReservationModalBtn")?.addEventListener("click", () => {
      document.getElementById("newReservationModal")?.classList.remove("hidden");
    });
    document.getElementById("closeNewResModalBtn")?.addEventListener("click", () => {
      document.getElementById("newReservationModal")?.classList.add("hidden");
    });
    document.getElementById("cancelNewResBtn")?.addEventListener("click", () => {
      document.getElementById("newReservationModal")?.classList.add("hidden");
    });

    // Create New Reservation Submit
    document.getElementById("saveNewReservationBtn")?.addEventListener("click", () => {
      const guestName = document.getElementById("newResGuestName")?.value.trim();
      const phone = document.getElementById("newResPhone")?.value.trim() || "+1 555-0000";
      const partySize = parseInt(document.getElementById("newResPartySize")?.value, 10) || 2;
      const time = document.getElementById("newResTime")?.value || "19:30";
      const tableId = document.getElementById("newResTableSelect")?.value || "T2";
      const notes = document.getElementById("newResNotes")?.value.trim() || "";

      if (!guestName) {
        this.showNotification("Guest name is required", "warning");
        return;
      }

      const newRes = {
        id: "res-" + Date.now(),
        guestName,
        phone,
        partySize,
        date: new Date().toISOString().split("T")[0],
        time,
        tableId,
        status: "confirmed",
        tags: ["Reservation"],
        notes
      };

      this.reservations.unshift(newRes);

      // Also mark designated table as reserved if it was available
      const table = this.tables.find(t => t.id === tableId);
      if (table && table.status === "available") {
        table.status = "reserved";
        table.reservationInfo = {
          guestName,
          partySize,
          time,
          phone,
          notes
        };
      }

      this.saveState();
      this.renderReservationList();
      this.renderFloorGrid();
      this.renderHeaderStats();
      document.getElementById("newReservationModal")?.classList.add("hidden");
      this.showNotification(`Reservation booked for ${guestName}!`, "success");
    });

    // Reservation Search
    document.getElementById("reservationSearchInput")?.addEventListener("input", (e) => {
      this.reservationSearchQuery = e.target.value;
      this.renderReservationList();
    });

    // Sound Toggle Button
    document.getElementById("soundToggleBtn")?.addEventListener("click", () => {
      this.soundEnabled = !this.soundEnabled;
      const icon = document.getElementById("soundToggleIcon");
      if (icon) {
        icon.setAttribute("data-lucide", this.soundEnabled ? "volume-2" : "volume-x");
        if (window.lucide) lucide.createIcons();
      }
      this.showNotification(`Audio feedback ${this.soundEnabled ? 'enabled' : 'muted'}`);
    });

    // Reset Demo Data
    document.getElementById("resetDemoDataBtn")?.addEventListener("click", () => {
      if (confirm("Reset all tables, reservations, and orders to initial demo state?")) {
        localStorage.removeItem("tm_tables");
        localStorage.removeItem("tm_reservations");
        localStorage.removeItem("tm_transactions");
        this.tables = JSON.parse(JSON.stringify(INITIAL_TABLES));
        this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
        this.completedTransactions = [];
        this.saveState();
        this.renderHeaderStats();
        this.renderFloorGrid();
        this.renderReservationList();
        this.renderKOTBoard();
        this.renderAnalytics();
        this.showNotification("Restored demo data successfully!");
      }
    });

    // Export Daily Shift Report CSV/JSON
    document.getElementById("exportReportBtn")?.addEventListener("click", () => {
      const report = {
        restaurant: this.config.name,
        timestamp: new Date().toISOString(),
        tables: this.tables,
        transactions: this.completedTransactions,
        reservations: this.reservations
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `shift-report-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showNotification("Shift report downloaded!");
    });
  }
}

// Instantiate upon DOM load
let restaurantApp = null;
window.addEventListener("DOMContentLoaded", () => {
  restaurantApp = new RestaurantApp();
  if (window.lucide) {
    lucide.createIcons();
  }
});
