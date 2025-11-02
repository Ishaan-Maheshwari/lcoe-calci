/**
 * ============================================
 * SOLAR LCOE CALCULATOR - UI MANAGEMENT
 * ============================================
 * 
 * This module handles all UI updates, DOM interactions,
 * event listeners, and chart generation.
 * 
 * Author: Energy Economics Team
 * Version: 2.0 (With Charts Support)
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

        // capacity: 1.0,
        // energy_generation: 1700,
        // capex_per_mw: 50000000,
        // opex_percent: 2.0,
        // interest_rate: 10.0,
        // loan_tenure: 10,
        // project_lifetime: 25,
        // discount_rate: 8.0
    },

    // Charts auto-update flag
    autoUpdateCharts: true
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
    
    document.getElementById(UI.outputIds.npv).textContent = 
        UI.formatIndianCurrency(results.npv_opex);
    
    document.getElementById(UI.outputIds.energy).textContent = 
        UI.formatNumber(results.total_energy);
    
    document.getElementById(UI.outputIds.cue_percent).textContent = 
        UI.formatPercent(results.cue);

    // ===== AUTO-UPDATE CHARTS IF ENABLED =====
    if (UI.autoUpdateCharts) {
        UI.updateAllCharts();
    }
};

// ============================================
// CHART UPDATE FUNCTIONS
// ============================================

/**
 * Update sensitivity chart based on user inputs
 */
UI.updateSensitivityChart = function() {
    const inputs = UI.getInputs();
    const min_rate = parseFloat(document.getElementById('sensitivity-min-rate').value) || 5;
    const max_rate = parseFloat(document.getElementById('sensitivity-max-rate').value) || 15;
    const step = parseFloat(document.getElementById('sensitivity-step').value) || 0.5;

    try {
        Charts.plotSensitivityToDiscountRate(inputs, min_rate, max_rate, step);
        console.log('✅ Sensitivity chart updated');
    } catch (error) {
        console.error('❌ Error updating sensitivity chart:', error);
    }
};

/**
 * Update Tornado Diagram
 */
UI.updateTornadoChart = function() {
    if (!UI.lastResults) return;

    const inputs = UI.lastResults.inputs;
    const variance = parseFloat(document.getElementById('tornado-variance').value) || 20;

    try {
        AdvancedCharts.plotTornado(inputs, variance);
        console.log('✅ Tornado chart updated');
    } catch (error) {
        console.error('❌ Error updating tornado chart:', error);
    }
};

/**
 * Update Range Analysis charts and tables
 */
UI.updateRangeAnalysis = function() {
    if (!UI.lastResults) return;

    const inputs = UI.lastResults.inputs;

    try {
        // Plot all parameter ranges combined
        RangeCharts.plotAllParametersCombo(inputs);
        
        // Plot individual parameter ranges
        RangeCharts.plotCapexRange(inputs);
        RangeCharts.plotEnergyRange(inputs);
        RangeCharts.plotDiscountRange(inputs);
        
        // Generate and display summary table
        const summary_html = RangeCharts.generateRangeSummaryTable(inputs);
        const container = document.getElementById('range-summary-container');
        if (container) {
            container.innerHTML = summary_html;
        }
        
        console.log('✅ Range analysis updated');
    } catch (error) {
        console.error('❌ Error updating range analysis:', error);
    }
};

/**
 * Update Dual Parameter Heatmap with Grid Style
 */
UI.updateHeatmap = function() {
    if (!UI.lastResults) return;

    const inputs = UI.lastResults.inputs;

    // Get selected parameters
    const param1_key = document.getElementById('heatmap-param1')?.value || 'capex_per_mw';
    const param2_key = document.getElementById('heatmap-param2')?.value || 'discount_rate';

    // Define parameter ranges and labels
    const param_config = {
        capex_per_mw: {
            label: 'CAPEX per MW (₹)',
            range: [30e6, 40e6, 50e6, 60e6, 70e6]
        },
        energy_generation: {
            label: 'Annual Energy (MWh)',
            range: [1000, 1300, 1700, 2100, 2500]
        },
        discount_rate: {
            label: 'Discount Rate (%)',
            range: [5, 7, 9, 11, 13]
        },
        opex_percent: {
            label: 'OPEX (% of CAPEX)',
            range: [1, 1.5, 2.0, 2.5, 3.0]
        },
        interest_rate: {
            label: 'Interest Rate (%)',
            range: [7, 8, 9, 10, 11]
        }
    };

    const param1_config = param_config[param1_key];
    const param2_config = param_config[param2_key];

    if (!param1_config || !param2_config) {
        console.error('Invalid parameter selection');
        return;
    }

    try {
        // Use Grid Heatmap instead of bubble chart
        HeatmapAlternatives.plotGridHeatmap(
            inputs,
            param1_key,
            param1_config.label,
            param1_config.range,
            param2_key,
            param2_config.label,
            param2_config.range
        );

        console.log('✅ Grid heatmap updated');
    } catch (error) {
        console.error('❌ Error updating heatmap:', error);
    }
};

/**
 * Update all charts based on current calculation results
 */
UI.updateAllCharts = function() {
    if (!UI.lastResults) return;

    const { inputs, results } = UI.lastResults;

    // Update Tornado Chart
    try {
        const variance = parseFloat(document.getElementById('tornado-variance')?.value || 20);
        AdvancedCharts.plotTornado(inputs, variance);
    } catch (error) {
        console.warn('⚠️ Could not update tornado chart:', error.message);
    }

    // Update Heatmap
    try {
        UI.updateHeatmap();
    } catch (error) {
        console.warn('⚠️ Could not update heatmap:', error.message);
    }

    // Update Range Analysis
    try {
        UI.updateRangeAnalysis();
    } catch (error) {
        console.warn('⚠️ Could not update range analysis:', error.message);
    }
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
    csv += `Total OPEX,${results.total_opex.toFixed(2)}\n`;
    csv += `NPV of OPEX (₹),${results.npv_opex.toFixed(2)}\n`;
    csv += `Total Energy Generated (MWh),${results.total_energy.toFixed(2)}\n\n`;

    // ===== ANNUAL CASH FLOWS =====
    csv += '=== ANNUAL CASH FLOWS ===\n';
    csv += 'Year,Cash Flow (₹)\n';
    results.cash_flows.forEach((cf, index) => {
        csv += `${index + 1},${cf.toFixed(2)}\n`;
    });

    csv += '\n=== CALCULATION NOTES ===\n';
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

/**
 * Download charts as images (placeholder - requires html2canvas)
 */
UI.downloadCharts = function() {
    alert('💡 To download charts, right-click on any chart and select "Save image as..."');
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

    // Attach sensitivity control listeners
    const sensitivityInputs = ['sensitivity-min-rate', 'sensitivity-max-rate', 'sensitivity-step'];
    sensitivityInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => UI.updateSensitivityChart());
        }
    });
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
    console.log('📊 Charts module loaded and ready');
}

/**
 * Switch between analysis tabs
 */
UI.switchTab = function(tab_name) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selected_tab = document.getElementById(`tab-${tab_name}`);
    if (selected_tab) {
        selected_tab.classList.add('active');
    }

    // Mark button as active
    event.target.classList.add('active');

    // Generate charts when tab is activated
    if (tab_name === 'sensitivity') {
        UI.updateTornadoChart();
    } else if (tab_name === 'heatmap') {
        UI.updateHeatmap();
    } else if (tab_name === 'ranges') {
        UI.generateRangeAnalysis();
    }
};

/**
 * Generate all range analysis charts at once
 */
UI.generateRangeAnalysis = function() {
    if (!UI.lastResults) return;

    const inputs = UI.lastResults.inputs;

    try {
        RangeCharts.plotAllParametersCombo(inputs);
        RangeCharts.plotCapexRange(inputs);
        RangeCharts.plotEnergyRange(inputs);
        RangeCharts.plotDiscountRange(inputs);
        
        const summary_html = RangeCharts.generateRangeSummaryTable(inputs);
        const container = document.getElementById('range-summary-container');
        if (container) {
            container.innerHTML = summary_html;
        }
        
        console.log('✅ Range analysis generated');
    } catch (error) {
        console.error('❌ Error generating range analysis:', error);
    }
};

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Also allow manual initialization if needed
window.Solar = { UI, AdvancedCharts, RangeCharts, initializeApp };