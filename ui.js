/**
 * ============================================
 * SOLAR LCOE CALCULATOR - UI MANAGEMENT
 * ============================================
 * 
 * This module handles all UI updates, DOM interactions,
 * and event listeners. It consumes the calculator.js module.
 * 
 * Author: Energy Economics Team
 * Version: 1.0
 */

// ============================================
// UI MODULE NAMESPACE
// ============================================

const UI = {
    // Store for caching last calculation results
    lastResults: null,

    // Input field IDs for easy reference
    inputIds: [
        'capacity',
        'energy_generation',
        'capex_per_mw',
        'opex_percent',
        'interest_rate',
        'loan_tenure',
        'project_lifetime',
        'discount_rate'
    ],

    // Output element IDs
    outputIds: {
        lcoe_mwh: 'lcoe_mwh',
        lcoe_kwh: 'lcoe_kwh',
        capex: 'breakdown-capex',
        om: 'breakdown-om',
        loan: 'breakdown-loan',
        total_opex: 'breakdown-total-opex',
        npv: 'breakdown-npv',
        energy: 'breakdown-energy',
        cue_percent: 'breakdown-cue-percent'
    },

    // Default values for inputs
    defaults: {
        capacity: 1.0,
        energy_generation: 1627.53,
        capex_per_mw: 34400000,
        opex_percent: 1.0,
        interest_rate: 8.25,
        loan_tenure: 20,
        project_lifetime: 20,
        discount_rate: 9.0
    }
};

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format number with Indian numbering system (comma separators)
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
UI.formatIndianCurrency = function(num) {
    return '₹' + num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Format number with commas (Indian style)
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
UI.formatNumber = function(num) {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Format percentage value
 * @param {number} value - Decimal value (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
UI.formatPercent = function(value, decimals = 2) {
    return (value * 100).toFixed(decimals) + '%';
};

// ============================================
// FORM INTERACTION FUNCTIONS
// ============================================

/**
 * Get all input values from form fields
 * @returns {object} Input parameters object
 */
UI.getInputs = function() {
    return {
        capacity: parseFloat(document.getElementById('capacity').value) || 0,
        energy_generation: parseFloat(document.getElementById('energy_generation').value) || 0,
        capex_per_mw: parseFloat(document.getElementById('capex_per_mw').value) || 0,
        opex_percent: parseFloat(document.getElementById('opex_percent').value) || 0,
        interest_rate: parseFloat(document.getElementById('interest_rate').value) || 0,
        loan_tenure: parseInt(document.getElementById('loan_tenure').value) || 1,
        project_lifetime: parseInt(document.getElementById('project_lifetime').value) || 1,
        discount_rate: parseFloat(document.getElementById('discount_rate').value) || 0
    };
};

/**
 * Reset all form inputs to default values
 */
UI.resetForm = function() {
    document.getElementById('capacity').value = UI.defaults.capacity;
    document.getElementById('energy_generation').value = UI.defaults.energy_generation;
    document.getElementById('capex_per_mw').value = UI.defaults.capex_per_mw;
    document.getElementById('opex_percent').value = UI.defaults.opex_percent;
    document.getElementById('interest_rate').value = UI.defaults.interest_rate;
    document.getElementById('loan_tenure').value = UI.defaults.loan_tenure;
    document.getElementById('project_lifetime').value = UI.defaults.project_lifetime;
    document.getElementById('discount_rate').value = UI.defaults.discount_rate;
    
    UI.updateResults();
};

// ============================================
// CALCULATION & UPDATE FUNCTIONS
// ============================================

/**
 * Main function to recalculate and update all UI elements
 * Called whenever an input changes
 */
UI.updateResults = function() {
    // Get current inputs
    const inputs = UI.getInputs();
    
    // Calculate LCOE and all intermediate values
    const results = calculateLCOE(inputs);
    
    // Cache results for export
    UI.lastResults = { inputs, results };

    // ===== UPDATE CALCULATED INPUT FIELDS =====
    document.getElementById('opex_calculated').value = 
        UI.formatIndianCurrency(results.annual_opex);
    
    document.getElementById('emi_calculated').value = 
        UI.formatIndianCurrency(results.annual_emi);
    
    document.getElementById('cue_calculated').value = 
        UI.formatPercent(results.cue);

    // ===== UPDATE MAIN RESULT CARDS =====
    document.getElementById(UI.outputIds.lcoe_mwh).textContent = 
        UI.formatIndianCurrency(results.lcoe_mwh);
    
    document.getElementById(UI.outputIds.lcoe_kwh).textContent = 
        UI.formatIndianCurrency(results.lcoe_kwh);

    // ===== UPDATE BREAKDOWN TABLE =====
    document.getElementById(UI.outputIds.capex).textContent = 
        UI.formatIndianCurrency(results.capex);
    
    document.getElementById(UI.outputIds.om).textContent = 
        UI.formatIndianCurrency(results.total_om);
    
    document.getElementById(UI.outputIds.loan).textContent = 
        UI.formatIndianCurrency(results.total_loan);

    document.getElementById(UI.outputIds.total_opex).textContent = 
        UI.formatIndianCurrency(results.total_opex);
    
    document.getElementById(UI.outputIds.npv).textContent = 
        UI.formatIndianCurrency(results.npv_opex);
    
    document.getElementById(UI.outputIds.energy).textContent = 
        UI.formatNumber(results.total_energy);
    
    document.getElementById(UI.outputIds.cue_percent).textContent = 
        UI.formatPercent(results.cue);
};

// ============================================
// EXPORT & DOWNLOAD FUNCTIONS
// ============================================

/**
 * Generate CSV content from current results
 * @returns {string} CSV formatted string
 */
UI.generateCSVContent = function() {
    if (!UI.lastResults) return null;

    const { inputs, results } = UI.lastResults;
    const timestamp = new Date().toLocaleString('en-IN');

    let csv = 'Solar LCOE Calculator - Export Report\n';
    csv += `Generated: ${timestamp}\n`;
    csv += `URL: ${window.location.href}\n\n`;

    // ===== INPUT SECTION =====
    csv += '=== INPUT PARAMETERS ===\n';
    csv += `Capacity (MW),${inputs.capacity}\n`;
    csv += `Annual Energy Generation (MWh),${inputs.energy_generation}\n`;
    csv += `CAPEX per MW (₹),${inputs.capex_per_mw}\n`;
    csv += `Annual OPEX (% of CAPEX),${inputs.opex_percent}\n`;
    csv += `Loan Interest Rate (%),${inputs.interest_rate}\n`;
    csv += `Loan Tenure (Years),${inputs.loan_tenure}\n`;
    csv += `Project Lifetime (Years),${inputs.project_lifetime}\n`;
    csv += `Discount Rate (%),${inputs.discount_rate}\n\n`;

    // ===== RESULTS SECTION =====
    csv += '=== MAIN RESULTS ===\n';
    csv += `LCOE (₹/MWh),${results.lcoe_mwh.toFixed(2)}\n`;
    csv += `LCOE (₹/kWh),${results.lcoe_kwh.toFixed(4)}\n`;
    csv += `Capacity Utilization (%),${(results.cue * 100).toFixed(2)}\n\n`;

    // ===== DETAILED BREAKDOWN =====
    csv += '=== DETAILED BREAKDOWN ===\n';
    csv += `Total CAPEX (₹),${results.capex.toFixed(2)}\n`;
    csv += `Annual OPEX Year 0 (₹),${results.annual_opex.toFixed(2)}\n`;
    csv += `Annual EMI (₹),${results.annual_emi.toFixed(2)}\n`;
    csv += `Total O&M Cost (₹),${results.total_om.toFixed(2)}\n`;
    csv += `Total Loan Repayment (₹),${results.total_loan.toFixed(2)}\n`;
    csv += `NPV of OPEX (₹),${results.npv_opex.toFixed(2)}\n`;
    csv += `Total Energy Generated (MWh),${results.total_energy.toFixed(2)}\n\n`;

    // ===== CALCULATION NOTES =====
    csv += '=== CALCULATION NOTES ===\n';
    csv += 'OPEX Escalation Rate,5% per year\n';
    csv += 'Panel Degradation Rate,0.5% per year\n';
    csv += 'LCOE Formula,(CAPEX + NPV of OPEX) / Total Energy Generated\n';

    return csv;
};

/**
 * Download results as CSV file
 */
UI.downloadCSV = function() {
    if (!UI.lastResults) {
        alert('❌ Please ensure calculations are complete before exporting');
        return;
    }

    const csvContent = UI.generateCSVContent();
    if (!csvContent) {
        alert('❌ Error generating CSV content');
        return;
    }

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LCOE_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ============================================
// EVENT LISTENER SETUP
// ============================================

/**
 * Initialize all event listeners
 * Called once on page load
 */
UI.initializeEventListeners = function() {
    // Attach input change listeners
    UI.inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => UI.updateResults());
        }
    });
};

/**
 * Alternative: Set up using addEventListener instead of inline onclick
 */
UI.initializeButtonListeners = function() {
    const resetBtn = document.querySelector('button:contains("Reset")');
    const exportBtn = document.querySelector('button:contains("Export")');
    
    // Note: This approach is optional if using inline onclick in HTML
    // Keep HTML onclick for simplicity, but this could be used instead
};

// ============================================
// PAGE INITIALIZATION
// ============================================

/**
 * Initialize the entire application
 * Called when DOM is loaded
 */
function initializeApp() {
    // Set up all event listeners
    UI.initializeEventListeners();
    
    // Perform initial calculation
    UI.updateResults();
    
    console.log('✅ Solar LCOE Calculator initialized successfully');
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Also allow manual initialization if needed
window.Solar = { UI, initializeApp };