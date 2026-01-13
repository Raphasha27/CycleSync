/**
 * CycleSync Application Logic - PREMIUM EDITION v2.0
 * Features: Auth, Multi-View, Customer Management, History, Maintenance, Charts, Export
 */

class CycleSync {
    constructor() {
        this.STORAGE_KEY = 'cyclesync_data_v2';
        
        const defaultState = {
            isAuthenticated: false,
            revenue: 1250.00,
            bikes: [
                { id: 'BK-101', model: 'Mountain Trekker X1', type: 'Mountain', status: 'Available', price: 15.00 },
                { id: 'BK-102', model: 'City Cruiser Elite', type: 'City', status: 'Rented', price: 12.50 },
                { id: 'BK-103', model: 'Speedster Pro', type: 'Road', status: 'Maintenance', price: 20.00 },
                { id: 'BK-104', model: 'Urban Glide E1', type: 'Electric', status: 'Available', price: 25.00 },
                { id: 'BK-105', model: 'Kids Racer Z', type: 'Kids', status: 'Available', price: 10.00 }
            ],
            customers: [
                { id: 'C-001', name: 'Alice Wong', email: 'alice@example.com', phone: '+1-555-0101', totalRentals: 12, status: 'Active' },
                { id: 'C-002', name: 'Bob Martinez', email: 'bob@example.com', phone: '+1-555-0102', totalRentals: 7, status: 'Active' },
                { id: 'C-003', name: 'Chen Liu', email: 'chen@example.com', phone: '+1-555-0103', totalRentals: 3, status: 'Active' }
            ],
            rentals: [
                { id: 'R-001', bikeId: 'BK-102', customer: 'Alice Wong', customerId: 'C-001', startTime: Date.now() - 3600000, duration: 2, cost: 25.00, status: 'active' }
            ],
            rentalHistory: [
                { id: 'R-000', bikeId: 'BK-101', customer: 'Bob Martinez', customerId: 'C-002', startTime: Date.now() - 86400000, duration: 3, cost: 45.00, status: 'completed', endTime: Date.now() - 75600000 }
            ],
            maintenanceRecords: [
                { id: 'M-001', bikeId: 'BK-103', issue: 'Brake Adjustment', priority: 'High', scheduled: Date.now(), status: 'In Progress' }
            ],
            maintenanceCompleted: 15
        };

        this.state = this.loadState() || defaultState;
        this.filterTerm = '';
        this.historyFilter = 'all';

        this.init();
    }

    // --- Initialization ---
    init() {
        console.log('🚴 CycleSync Premium v2.0 Initialized');
        this.checkAuth();
        
        window.addEventListener('resize', () => {
            if(this.state.isAuthenticated && document.getElementById('revenueChart')) {
                this.renderChart();
            }
        });
    }

    loadState() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    saveState() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        this.renderAll();
    }

    // --- Authentication ---
    checkAuth() {
        const loginView = document.getElementById('view-login');
        const mainApp = document.getElementById('main-app');
        const menuToggle = document.getElementById('menu-toggle');

        if (this.state.isAuthenticated) {
            loginView.classList.add('hidden');
            mainApp.classList.remove('hidden');
            if(menuToggle) menuToggle.style.display = 'flex';
            this.renderAll();
            setTimeout(() => this.renderChart(), 500);
        } else {
            loginView.classList.remove('hidden');
            mainApp.classList.add('hidden');
            if(menuToggle) menuToggle.style.display = 'none';
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        if (inputs[0].value.toLowerCase() === 'admin' && inputs[1].value === 'admin') {
            this.state.isAuthenticated = true;
            this.saveState();
            this.checkAuth();
            this.showToast('Welcome back, Administrator', 'success');
        } else {
            this.showToast('Invalid Credentials. Try admin/admin', 'error');
        }
    }

    logout() {
        this.state.isAuthenticated = false;
        this.saveState();
        this.checkAuth();
    }

    // --- Mobile Menu ---
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    }

    // --- Navigation ---
    navigate(viewId) {
        // Close mobile menu on navigate
        const sidebar = document.querySelector('.sidebar');
        if(sidebar) sidebar.classList.remove('open');

        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.view === viewId);
        });

        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.add('hidden');
        });
        
        const target = document.getElementById(`view-${viewId}`);
        if(target) {
            target.classList.remove('hidden');
            target.classList.remove('fade-in');
            void target.offsetWidth;
            target.classList.add('fade-in');
            
            // Trigger view-specific renders
            if(viewId === 'dashboard') this.renderChart();
            if(viewId === 'customers') this.renderCustomers();
            if(viewId === 'history') this.renderHistory();
            if(viewId === 'maintenance') this.renderMaintenance();
        }

        // Update Headers
        const headerMap = {
            'dashboard': ['Dashboard', 'Overview of your operations'],
            'inventory': ['Inventory', 'Manage your fleet status'],
            'customers': ['Customers', 'Customer database and insights'],
            'history': ['Rental History', 'Complete transaction timeline'],
            'maintenance': ['Maintenance', 'Service schedule and records']
        };
        const [title, sub] = headerMap[viewId] || ['CycleSync', 'Manager'];
        document.getElementById('page-heading').innerText = title;
        document.getElementById('page-subheading').innerText = sub;
    }

    toggleTheme() {
        this.showToast('Premium Dark Mode is the default experience.', 'info');
    }

    // --- Notifications ---
    showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            'success': 'fa-circle-check',
            'error': 'fa-circle-exclamation',
            'info': 'fa-circle-info'
        };

        toast.innerHTML = `
            <i class="fa-solid ${iconMap[type]} toast-icon"></i>
            <span>${msg}</span>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('active'));

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Render All ---
    renderAll() {
        this.renderStats();
        this.renderInventory();
        this.renderDashboardTable();
    }

    renderStats() {
        const totalRevenue = this.state.revenue; 
        document.getElementById('stat-total').innerText = this.state.bikes.length;
        document.getElementById('stat-rented').innerText = this.state.bikes.filter(b => b.status === 'Rented').length;
        document.getElementById('stat-revenue').innerText = `$${totalRevenue.toLocaleString()}`;
    }

    // --- Inventory ---
    filterInventory(term) {
        this.filterTerm = term.toLowerCase();
        this.renderInventory();
    }

    renderInventory() {
        const tbody = document.getElementById('inventory-table');
        const filteredBikes = this.state.bikes.filter(bike => 
            bike.model.toLowerCase().includes(this.filterTerm) || 
            bike.id.toLowerCase().includes(this.filterTerm)
        );

        if (filteredBikes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No bikes found</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredBikes.map(bike => `
            <tr>
                <td><strong>${bike.id}</strong></td>
                <td>${bike.model}</td>
                <td>${bike.type}</td>
                <td><span class="status-badge status-${bike.status.toLowerCase()}">${bike.status}</span></td>
                <td>$${bike.price.toFixed(2)}</td>
                <td>
                    ${bike.status === 'Available' ? 
                        `<button class="btn-glass" onclick="app.openModal('rent-modal', {id:'${bike.id}', model:'${bike.model}'})" title="Rent"><i class="fa-solid fa-key" style="color:var(--accent)"></i></button>` : 
                        ``
                    }
                    ${bike.status === 'Rented' ? 
                        `<button class="btn-glass" onclick="app.returnBike('${bike.id}')" title="Return"><i class="fa-solid fa-check" style="color:var(--success)"></i></button>` : 
                        ``
                    }
                    <button class="btn-glass" onclick="app.deleteBike('${bike.id}')" title="Delete"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
                </td>
            </tr>
        `).join('');
    }

    renderDashboardTable() {
        const tbody = document.getElementById('dashboard-table');
        const displayList = this.state.rentals.slice(0, 5); 
        
        tbody.innerHTML = displayList.map(rental => {
            const bike = this.state.bikes.find(b => b.id === rental.bikeId);
            const estRevenue = rental.cost || (rental.duration * (bike ? bike.price : 0));
            
            return `
            <tr>
                <td>${bike ? bike.model : 'Unknown'} <small style="color:var(--text-muted)">(${rental.bikeId})</small></td>
                <td>${rental.customer}</td>
                <td>${new Date(rental.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>$${estRevenue.toFixed(2)}</td>
                <td><span class="status-badge status-rented">Active</span></td>
            </tr>
            `;
        }).join('');
    }

    // --- Customers ---
    renderCustomers() {
        // Top Cards
        const grid = document.getElementById('customer-grid');
        const topCustomers = this.state.customers.slice(0, 3);
        
        grid.innerHTML = topCustomers.map(c => `
            <div class="customer-card">
                <div class="customer-header">
                    <div class="customer-avatar">${c.name.split(' ').map(n => n[0]).join('')}</div>
                    <div class="customer-info">
                        <h3>${c.name}</h3>
                        <p>${c.email}</p>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="customer-stat">
                        <div class="value">${c.totalRentals}</div>
                        <div class="label">Rentals</div>
                    </div>
                    <div class="customer-stat">
                        <div class="value">$${(c.totalRentals * 30).toFixed(0)}</div>
                        <div class="label">Revenue</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Table
        const tbody = document.getElementById('customer-table');
        tbody.innerHTML = this.state.customers.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.totalRentals}</td>
                <td><span class="status-badge status-available">${c.status}</span></td>
            </tr>
        `).join('');
    }

    handleAddCustomer(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newCustomer = {
            id: `C-${String(this.state.customers.length + 1).padStart(3, '0')}`,
            name: fd.get('name'),
            email: fd.get('email'),
            phone: fd.get('phone') || 'N/A',
            totalRentals: 0,
            status: 'Active'
        };
        
        this.state.customers.push(newCustomer);
        this.saveState();
        this.closeModal('customer-modal');
        e.target.reset();
        this.showToast('Customer registered successfully', 'success');
        this.renderCustomers();
    }

    // --- Rental History ---
    filterHistory(status) {
        this.historyFilter = status;
        this.renderHistory();
    }

    renderHistory() {
        const timeline = document.getElementById('history-timeline');
        const allHistory = [...this.state.rentals, ...this.state.rentalHistory];
        
        const filtered = this.historyFilter === 'all' ? allHistory :
            allHistory.filter(r => r.status === this.historyFilter);

        timeline.innerHTML = filtered.map(r => {
            const bike = this.state.bikes.find(b => b.id === r.bikeId);
            return `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-title">${r.customer} - ${bike ? bike.model : r.bikeId}</div>
                        <span class="status-badge status-${r.status === 'active' ? 'rented' : 'available'}">${r.status}</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                        ${r.duration} hours • $${r.cost.toFixed(2)} • ${new Date(r.startTime).toLocaleDateString()}
                    </p>
                    ${r.status === 'completed' ? `<small style="color: var(--text-muted);">Returned: ${new Date(r.endTime).toLocaleString()}</small>` : ''}
                </div>
            </div>
            `;
        }).join('');
    }

    exportHistory() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Bike,Customer,Duration,Cost,Status,StartTime\n"
            + [...this.state.rentals, ...this.state.rentalHistory].map(r => 
                `${r.id},${r.bikeId},${r.customer},${r.duration},${r.cost},${r.status},${new Date(r.startTime).toLocaleString()}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rental_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('History exported successfully', 'success');
    }

    // --- Maintenance ---
    renderMaintenance() {
        document.getElementById('stat-maintenance-count').innerText = this.state.bikes.filter(b => b.status === 'Maintenance').length;
        document.getElementById('stat-maintenance-completed').innerText = this.state.maintenanceCompleted;

        const tbody = document.getElementById('maintenance-table');
        tbody.innerHTML = this.state.maintenanceRecords.map(m => {
            const priorityColors = { 'High': 'danger', 'Medium': 'warning', 'Low': 'success' };
            return `
            <tr>
                <td><strong>${m.bikeId}</strong></td>
                <td>${m.issue}</td>
                <td><span class="status-badge status-${priorityColors[m.priority] === 'danger' ? 'maintenance' : 'available'}" style="background: rgba(255,100,100,0.15); color: var(--${priorityColors[m.priority]});">${m.priority}</span></td>
                <td>${new Date(m.scheduled).toLocaleDateString()}</td>
                <td><span class="status-badge status-rented">${m.status}</span></td>
                <td>
                    <button class="btn-glass" onclick="app.completeMaintenance('${m.id}')" title="Complete">
                        <i class="fa-solid fa-check" style="color:var(--success)"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    }

    scheduleMaintenance() {
        const availableBikes = this.state.bikes.filter(b => b.status === 'Available');
        if(availableBikes.length === 0) {
            this.showToast('No available bikes to schedule', 'error');
            return;
        }

        const bikeId = availableBikes[0].id;
        const newRecord = {
            id: `M-${String(this.state.maintenanceRecords.length + 1).padStart(3, '0')}`,
            bikeId: bikeId,
            issue: 'Regular Service',
            priority: 'Medium',
            scheduled: Date.now(),
            status: 'Scheduled'
        };

        this.state.maintenanceRecords.push(newRecord);
        const bike = this.state.bikes.find(b => b.id === bikeId);
        if(bike) bike.status = 'Maintenance';

        this.saveState();
        this.showToast('Maintenance scheduled', 'success');
        this.renderMaintenance();
    }

    completeMaintenance(id) {
        const record = this.state.maintenanceRecords.find(r => r.id === id);
        if(record) {
            this.state.maintenanceRecords = this.state.maintenanceRecords.filter(r => r.id !== id);
            this.state.maintenanceCompleted++;
            
            const bike = this.state.bikes.find(b => b.id === record.bikeId);
            if(bike) bike.status = 'Available';

            this.saveState();
            this.showToast('Maintenance completed', 'success');
            this.renderMaintenance();
        }
    }

    // --- Chart Rendering ---
    renderChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.offsetWidth;
        const height = 250;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const dataPoints = [400, 650, 450, 800, 700, 900, 1250];

        ctx.clearRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            const y = height - (i * (height/5));
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Line
        ctx.beginPath();
        const stepX = width / (dataPoints.length - 1);
        const maxVal = 1500;
        
        dataPoints.forEach((val, i) => {
            const x = i * stepX;
            const y = height - ((val / maxVal) * height);
            if(i===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00E5FF');
        gradient.addColorStop(1, '#7000FF');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
        ctx.fill();

        // Points
        dataPoints.forEach((val, i) => {
            const x = i * stepX;
            const y = height - ((val / maxVal) * height);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        });
    }

    // --- Modal Handling ---
    openModal(modalId, contextData = null) {
        document.getElementById(modalId).classList.add('active');
        if (modalId === 'rent-modal' && contextData) {
            document.getElementById('rent-bike-id').value = contextData.id;
            document.getElementById('rent-bike-model').value = contextData.model;
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // --- Actions ---
    handleAddBike(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newBike = {
            id: `BK-${100 + this.state.bikes.length + 1}`,
            model: fd.get('model'),
            type: fd.get('type'),
            price: parseFloat(fd.get('price')),
            status: 'Available'
        };
        
        this.state.bikes.push(newBike);
        this.saveState();
        this.closeModal('bike-modal');
        e.target.reset();
        this.showToast('New bike added to fleet', 'success');
    }

    processRent(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const bikeId = fd.get('bikeId');
        const duration = parseFloat(fd.get('duration'));
        
        const bikeIndex = this.state.bikes.findIndex(b => b.id === bikeId);
        if (bikeIndex > -1) {
            const bike = this.state.bikes[bikeIndex];
            bike.status = 'Rented';
            
            const cost = duration * bike.price;
            this.state.revenue += cost;
            
            this.state.rentals.unshift({
                id: `R-${Date.now()}`,
                bikeId: bikeId,
                customer: fd.get('customer'),
                duration: duration,
                cost: cost,
                startTime: Date.now(),
                status: 'active'
            });
            
            this.saveState();
            this.closeModal('rent-modal');
            e.target.reset();
            this.showToast(`Rental Confirmed! Revenue: $${cost.toFixed(2)}`, 'success');
        }
    }

    returnBike(bikeId) {
        if(confirm('Confirm bike return?')) {
            const bike = this.state.bikes.find(b => b.id === bikeId);
            if(bike) {
                bike.status = 'Available';
                
                const rental = this.state.rentals.find(r => r.bikeId === bikeId);
                if(rental) {
                    rental.status = 'completed';
                    rental.endTime = Date.now();
                    this.state.rentalHistory.unshift(rental);
                    this.state.rentals = this.state.rentals.filter(r => r.bikeId !== bikeId);
                }
                
                this.saveState();
                this.showToast('Bike returned successfully', 'info');
            }
        }
    }

    deleteBike(bikeId) {
        if(confirm('Permanently remove this bike?')) {
            this.state.bikes = this.state.bikes.filter(b => b.id !== bikeId);
            this.saveState();
            this.showToast('Bike removed from fleet', 'error');
        }
    }

    exportData() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Model,Type,Status,Price\n"
            + this.state.bikes.map(e => `${e.id},${e.model},${e.type},${e.status},${e.price}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cyclesync_inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Inventory report downloaded', 'success');
    }
}

const app = new CycleSync();
