class AshlessTracker {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('ashless_entries')) || [];
        this.editingIndex = null;
        this.currentEntryDate = null;
        this.chart = null;
        
        // Load settings
        this.settings = JSON.parse(localStorage.getItem('ashless_settings')) || {
            cigarettePrice: 20,
            defaultProduct: 'cigarettes'
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadEntries();
        this.setTodayDate();
        this.updateSettingsInputs();
        this.updatePriceDisplay();
    }
    
    initializeElements() {
        // Buttons
        this.addEntryBtn = document.getElementById('addEntryBtn');
        this.menuToggle = document.getElementById('menuToggle');
        this.closeMenu = document.getElementById('closeMenu');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.chartBtn = document.getElementById('chartBtn');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.confirmImport = document.getElementById('confirmImport');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        
        // Modals
        this.entryModal = document.getElementById('entryModal');
        this.notesModal = document.getElementById('notesModal');
        this.actionsModal = document.getElementById('actionsModal');
        this.chartModal = document.getElementById('chartModal');
        this.aboutModal = document.getElementById('aboutModal');
        this.importModal = document.getElementById('importModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.sideMenu = document.getElementById('sideMenu');
        this.menuOverlay = document.getElementById('menuOverlay');
        
        // Forms and inputs
        this.entryForm = document.getElementById('entryForm');
        this.entryDate = document.getElementById('entryDate');
        this.cravingsInput = document.getElementById('cravings');
        this.smokedInput = document.getElementById('smoked');
        this.notesInput = document.getElementById('notes');
        this.saveEntryBtn = document.getElementById('saveEntry');
        this.dateError = document.getElementById('dateError');
        
        // Settings inputs
        this.cigarettePriceInput = document.getElementById('cigarettePrice');
        this.defaultProductInput = document.getElementById('defaultProduct');
        
        // Price display
        this.currentPriceDisplay = document.getElementById('currentPrice');
        
        // Chart elements
        this.timeRange = document.getElementById('timeRange');
        this.toggleSmoked = document.getElementById('toggleSmoked');
        this.toggleCravings = document.getElementById('toggleCravings');
        this.totalSmoked = document.getElementById('totalSmoked');
        this.moneySpent = document.getElementById('moneySpent');
        
        // Display area
        this.entriesTable = document.getElementById('entriesTable');
    }
    
    attachEventListeners() {
        // Add entry button
        this.addEntryBtn.addEventListener('click', () => this.openEntryModal());
        
        // Menu buttons
        this.menuToggle.addEventListener('click', () => this.openMenu());
        this.closeMenu.addEventListener('click', () => this.closeMenuFunc());
        this.menuOverlay.addEventListener('click', () => this.closeMenuFunc());
        
        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => this.closeEntryModal());
        document.querySelector('.close-notes').addEventListener('click', () => this.closeNotesModal());
        document.querySelector('.close-actions').addEventListener('click', () => this.closeActionsModal());
        document.querySelector('.close-chart').addEventListener('click', () => this.closeChartModal());
        document.querySelector('.close-about').addEventListener('click', () => this.closeAboutModal());
        document.querySelector('.close-import').addEventListener('click', () => this.closeImportModal());
        document.querySelector('.close-settings').addEventListener('click', () => this.closeSettingsModal());
        
        // Form submission
        this.entryForm.addEventListener('submit', (e) => this.saveEntry(e));
        
        // Number input buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.adjustNumber(e));
        });
        
        // Menu actions
        this.exportBtn.addEventListener('click', () => this.exportCSV());
        this.importBtn.addEventListener('click', () => this.openImportModal());
        this.chartBtn.addEventListener('click', () => this.openChartModal());
        this.aboutBtn.addEventListener('click', () => this.openAboutModal());
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        
        // Import functionality
        this.confirmImport.addEventListener('click', () => this.importCSV());
        
        // Settings functionality
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Chart controls
        this.timeRange.addEventListener('change', () => this.updateChart());
        this.toggleSmoked.addEventListener('click', () => this.toggleChartData('smoked'));
        this.toggleCravings.addEventListener('click', () => this.toggleChartData('cravings'));
        
        // Close modals on outside click
        window.addEventListener('click', (e) => this.handleOutsideClick(e));
    }
    
    setTodayDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.entryDate.value = `${yyyy}-${mm}-${dd}`;
    }
    
    formatDate(dateStr) {
        // Convert from YYYY-MM-DD to DD-MM-YY
        const [year, month, day] = dateStr.split('-');
        return {
            full: `${day}-${month}-${year.slice(-2)}`,
            day: day,
            month: month,
            year: year.slice(-2)
        };
    }
    
    formatDateForInput(dateStr) {
        // Convert from DD-MM-YY to YYYY-MM-DD
        const [day, month, year] = dateStr.split('-');
        return `20${year}-${month}-${day}`;
    }
    
    openEntryModal(entry = null, index = null) {
        this.editingIndex = index;
        
        if (entry) {
            // Editing existing entry
            document.getElementById('modalTitle').textContent = 'Edit Entry';
            this.entryDate.value = this.formatDateForInput(entry.date);
            this.cravingsInput.value = entry.cravings;
            this.smokedInput.value = entry.smoked;
            this.notesInput.value = entry.notes || '';
            this.currentEntryDate = entry.date;
        } else {
            // Adding new entry
            document.getElementById('modalTitle').textContent = 'Add Entry';
            this.setTodayDate();
            this.cravingsInput.value = '0';
            this.smokedInput.value = '0';
            this.notesInput.value = '';
            this.currentEntryDate = null;
        }
        
        this.entryModal.style.display = 'block';
        this.dateError.style.display = 'none';
        this.updateSaveButton();
    }
    
    closeEntryModal() {
        this.entryModal.style.display = 'none';
        this.entryForm.reset();
        this.editingIndex = null;
        this.currentEntryDate = null;
    }
    
    openMenu() {
        this.sideMenu.style.right = '0';
        this.menuOverlay.style.display = 'block';
    }
    
    closeMenuFunc() {
        this.sideMenu.style.right = '-300px';
        this.menuOverlay.style.display = 'none';
    }
    
    openNotesModal(notes) {
        // Replace escaped newlines with actual newlines
        const formattedNotes = notes.replace(/\\n/g, '\n');
        document.getElementById('notesContent').textContent = formattedNotes;
        this.notesModal.style.display = 'block';
    }
    
    closeNotesModal() {
        this.notesModal.style.display = 'none';
    }
    
    openActionsModal(index) {
        this.editingIndex = index;
        this.actionsModal.style.display = 'block';
        
        // Set up action buttons
        document.getElementById('editEntry').onclick = () => {
            this.closeActionsModal();
            this.openEntryModal(this.entries[index], index);
        };
        
        document.getElementById('deleteEntry').onclick = () => {
            if (confirm('Are you sure you want to delete this entry?')) {
                this.deleteEntry(index);
                this.closeActionsModal();
            }
        };
    }
    
    closeActionsModal() {
        this.actionsModal.style.display = 'none';
        this.editingIndex = null;
    }
    
    openChartModal() {
        this.chartModal.style.display = 'block';
        this.closeMenuFunc();
        setTimeout(() => this.updateChart(), 100);
    }
    
    closeChartModal() {
        this.chartModal.style.display = 'none';
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
    
    openAboutModal() {
        this.aboutModal.style.display = 'block';
        this.closeMenuFunc();
    }
    
    closeAboutModal() {
        this.aboutModal.style.display = 'none';
    }
    
    openImportModal() {
        this.importModal.style.display = 'block';
        this.closeMenuFunc();
    }
    
    closeImportModal() {
        this.importModal.style.display = 'none';
        document.getElementById('csvFile').value = '';
    }
    
    openSettingsModal() {
        this.updateSettingsInputs();
        this.settingsModal.style.display = 'block';
        this.closeMenuFunc();
    }
    
    closeSettingsModal() {
        this.settingsModal.style.display = 'none';
    }
    
    handleOutsideClick(event) {
        if (event.target === this.entryModal) this.closeEntryModal();
        if (event.target === this.notesModal) this.closeNotesModal();
        if (event.target === this.actionsModal) this.closeActionsModal();
        if (event.target === this.chartModal) this.closeChartModal();
        if (event.target === this.aboutModal) this.closeAboutModal();
        if (event.target === this.importModal) this.closeImportModal();
        if (event.target === this.settingsModal) this.closeSettingsModal();
    }
    
    adjustNumber(event) {
        const button = event.target.closest('.number-btn');
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const isPlus = button.classList.contains('plus');
        
        let value = parseInt(input.value) || 0;
        value = isPlus ? value + 1 : Math.max(0, value - 1);
        input.value = value;
        
        this.updateSaveButton();
    }
    
    updateSaveButton() {
        const cravings = parseInt(this.cravingsInput.value) || 0;
        const smoked = parseInt(this.smokedInput.value) || 0;
        const date = this.formatDate(this.entryDate.value).full;
        
        // Check if date already exists (excluding current entry being edited)
        const dateExists = this.entries.some((entry, index) => 
            entry.date === date && index !== this.editingIndex
        );
        
        if (dateExists) {
            this.dateError.style.display = 'block';
            this.saveEntryBtn.disabled = true;
        } else {
            this.dateError.style.display = 'none';
            this.saveEntryBtn.disabled = false;
        }
    }
    
    updateSettingsInputs() {
        this.cigarettePriceInput.value = this.settings.cigarettePrice;
        this.defaultProductInput.value = this.settings.defaultProduct;
    }
    
    updatePriceDisplay() {
        if (this.currentPriceDisplay) {
            this.currentPriceDisplay.textContent = this.settings.cigarettePrice;
        }
    }
    
    saveSettings() {
        const price = parseFloat(this.cigarettePriceInput.value);
        if (isNaN(price) || price < 1) {
            alert('Please enter a valid price (minimum ₹1)');
            return;
        }
        
        this.settings.cigarettePrice = price;
        this.settings.defaultProduct = this.defaultProductInput.value;
        
        localStorage.setItem('ashless_settings', JSON.stringify(this.settings));
        this.updatePriceDisplay();
        this.closeSettingsModal();
        
        // Reload entries to update money calculations
        this.loadEntries();
        
        // If chart is open, update it
        if (this.chart) {
            this.updateChart();
        }
        
        alert('Settings saved successfully!');
    }
    
    saveEntry(event) {
        event.preventDefault();
        
        const date = this.formatDate(this.entryDate.value).full;
        const cravings = parseInt(this.cravingsInput.value) || 0;
        const smoked = parseInt(this.smokedInput.value) || 0;
        const notes = this.notesInput.value.trim();
        
        // Use settings price for calculation
        const entry = {
            date,
            cravings,
            smoked,
            notes,
            money: smoked * this.settings.cigarettePrice
        };
        
        if (this.editingIndex !== null) {
            // Update existing entry
            this.entries[this.editingIndex] = entry;
        } else {
            // Add new entry
            this.entries.push(entry);
        }
        
        // Sort by date (newest first)
        this.entries.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('-').map(Number);
            const [dayB, monthB, yearB] = b.date.split('-').map(Number);
            const dateA = new Date(2000 + yearA, monthA - 1, dayA);
            const dateB = new Date(2000 + yearB, monthB - 1, dayB);
            return dateB - dateA;
        });
        
        // Save to localStorage
        localStorage.setItem('ashless_entries', JSON.stringify(this.entries));
        
        // Update display
        this.loadEntries();
        
        // Close modal
        this.closeEntryModal();
    }
    
    deleteEntry(index) {
        this.entries.splice(index, 1);
        localStorage.setItem('ashless_entries', JSON.stringify(this.entries));
        this.loadEntries();
    }
    
    loadEntries() {
        this.entriesTable.innerHTML = '';
        
        if (this.entries.length === 0) {
            this.entriesTable.innerHTML = `
                <div class="empty-state">
                    <p>No entries yet. Tap the + button to add your first entry!</p>
                    <p class="price-info">💡 Each cigarette costs ₹${this.settings.cigarettePrice}. Track your savings!</p>
                </div>
            `;
            return;
        }
        
        this.entries.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = 'entry-row';
            
            // Parse the date into components
            const [day, month, year] = entry.date.split('-');
            
            // Format money with Indian Rupee symbol
            const moneyFormatted = `₹${entry.money}`;
            
            // Escape notes for HTML display
            const escapedNotes = entry.notes ? entry.notes.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n') : '';
            
            row.innerHTML = `
                <div class="entry-cell date-cell">
                    <div class="date-day">${day}</div>
                    <div class="date-month">${month}</div>
                    <div class="date-year">${year}</div>
                </div>
                <div class="entry-cell ${entry.cravings === 0 ? 'value-zero' : 'value-positive'}">
                    ${entry.cravings}
                </div>
                <div class="entry-cell ${entry.smoked === 0 ? 'value-zero' : 'value-positive'}">
                    ${entry.smoked}
                </div>
                <div class="entry-cell ${entry.smoked === 0 ? 'value-zero' : 'value-positive'}">
                    ${moneyFormatted}
                </div>
                <div class="entry-cell">
                    ${entry.notes ? `<button class="notes-btn" onclick="tracker.openNotesModal('${escapedNotes}')">🔎︎</button>` : ''}
                </div>
                <div class="entry-cell">
                    <button class="actions-btn" onclick="tracker.openActionsModal(${index})">⋮</button>
                </div>
            `;
            
            this.entriesTable.appendChild(row);
        });
    }
    
    exportCSV() {
        if (this.entries.length === 0) {
            alert('No data to export!');
            return;
        }
        
        const headers = ['Date', 'Cravings', 'Cigarettes Smoked', 'Money Spent (₹)', 'Notes'];
        const csvRows = [headers.join(',')];
        
        this.entries.forEach(entry => {
            const row = [
                entry.date,
                entry.cravings,
                entry.smoked,
                entry.money,
                `"${(entry.notes || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `ashless_export_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.closeMenuFunc();
    }
    
    importCSV() {
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a CSV file to import.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const rows = content.split('\n').filter(row => row.trim());
                
                if (rows.length < 2) {
                    alert('CSV file is empty or invalid.');
                    return;
                }
                
                const importedEntries = [];
                
                for (let i = 1; i < rows.length; i++) {
                    const cols = rows[i].split(',').map(col => col.trim());
                    
                    // Handle quoted notes with commas
                    if (cols.length > 5) {
                        const lastCols = cols.slice(4).join(',');
                        cols.splice(4, cols.length - 4, lastCols);
                    }
                    
                    if (cols.length >= 4) {
                        const date = cols[0];
                        const cravings = parseInt(cols[1]) || 0;
                        const smoked = parseInt(cols[2]) || 0;
                        const money = parseInt(cols[3]) || smoked * this.settings.cigarettePrice;
                        const notes = cols[4] ? cols[4].replace(/^"|"$/g, '') : '';
                        
                        // Validate date format (DD-MM-YY)
                        if (!/^\d{2}-\d{2}-\d{2}$/.test(date)) {
                            console.warn(`Skipping row ${i+1}: Invalid date format`);
                            continue;
                        }
                        
                        importedEntries.push({
                            date,
                            cravings,
                            smoked,
                            money,
                            notes
                        });
                    }
                }
                
                if (confirm(`Import ${importedEntries.length} entries? This will replace your current data.`)) {
                    this.entries = importedEntries;
                    localStorage.setItem('ashless_entries', JSON.stringify(this.entries));
                    this.loadEntries();
                    this.closeImportModal();
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error reading CSV file. Please check the format.');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    }
    
    updateChart() {
        const days = parseInt(this.timeRange.value);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Filter entries within date range
        const filteredEntries = this.entries.filter(entry => {
            const [day, month, year] = entry.date.split('-').map(Number);
            const entryDate = new Date(2000 + year, month - 1, day);
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Sort by date ascending for chart
        filteredEntries.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('-').map(Number);
            const [dayB, monthB, yearB] = b.date.split('-').map(Number);
            const dateA = new Date(2000 + yearA, monthA - 1, dayA);
            const dateB = new Date(2000 + yearB, monthB - 1, dayB);
            return dateA - dateB;
        });
        
        const labels = filteredEntries.map(entry => entry.date);
        const smokedData = filteredEntries.map(entry => entry.smoked);
        const cravingsData = filteredEntries.map(entry => entry.cravings);
        
        // Calculate stats with current price
        const totalSmoked = smokedData.reduce((sum, val) => sum + val, 0);
        const totalMoney = totalSmoked * this.settings.cigarettePrice;
        
        this.totalSmoked.textContent = totalSmoked;
        this.moneySpent.textContent = `₹${totalMoney}`;
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        // Prepare datasets
        const datasets = [];
        
        if (this.toggleSmoked.classList.contains('active')) {
            datasets.push({
                label: 'Cigarettes Smoked',
                data: smokedData,
                borderColor: '#ff9900',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: smokedData.map(val => val === 0 ? '#4caf50' : '#f44336'),
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 5,
                fill: true
            });
        }
        
        if (this.toggleCravings.classList.contains('active')) {
            datasets.push({
                label: 'Cravings',
                data: cravingsData,
                borderColor: '#00bcd4',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.3,
                pointBackgroundColor: cravingsData.map(val => val === 0 ? '#4caf50' : '#f44336'),
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 5
            });
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Consolas, Monaco, monospace'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        titleColor: '#ff9900',
                        bodyColor: '#e0e0e0',
                        borderColor: '#ff9900',
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            maxRotation: 45,
                            font: {
                                family: 'Consolas, Monaco, monospace'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                family: 'Consolas, Monaco, monospace'
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    toggleChartData(type) {
        const button = type === 'smoked' ? this.toggleSmoked : this.toggleCravings;
        button.classList.toggle('active');
        this.updateChart();
    }
    
    // Make updateSaveButton available to HTML
    setupInputListeners() {
        this.entryDate.addEventListener('change', () => this.updateSaveButton());
        this.cravingsInput.addEventListener('input', () => this.updateSaveButton());
        this.smokedInput.addEventListener('input', () => this.updateSaveButton());
    }
}

// Initialize the tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new AshlessTracker();
    tracker.setupInputListeners();
});