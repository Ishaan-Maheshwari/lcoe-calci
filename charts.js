/**
 * ============================================
 * SOLAR LCOE CALCULATOR - CHARTING MODULE
 * ============================================
 * 
 * This module handles all chart generation and visualization
 * using Chart.js library for sensitivity analysis and data visualization.
 * 
 * Requires: Chart.js 3.9.1 (loaded from CDN)
 * Author: Energy Economics Team
 * Version: 1.0
 */

// ============================================
// CHARTS NAMESPACE
// ============================================

const Charts = {
    // Store chart instances
    charts: {
        sensibilityDiscount: null,
        sensibilityCapex: null,
        sensibilityEnergy: null,
        waterfall: null
    },

    // Chart color palette
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        accent: '#2196f3'
    },

    // Chart options defaults
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 }
            }
        }
    }
};

// ============================================
// SENSITIVITY ANALYSIS CHARTS
// ============================================

/**
 * Generate and display LCOE sensitivity to discount rate
 * @param {object} base_inputs - Base input parameters
 * @param {number} min_rate - Minimum discount rate (%)
 * @param {number} max_rate - Maximum discount rate (%)
 * @param {number} step - Step size (%)
 */
Charts.plotSensitivityToDiscountRate = function(base_inputs, min_rate = 5, max_rate = 15, step = 0.5) {
    // Generate sensitivity data
    const sensitivity = generateSensitivityAnalysis(base_inputs, min_rate, max_rate, step);

    const ctx = document.getElementById('chart-sensitivity-discount')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-sensitivity-discount not found');
        return;
    }

    // Destroy previous chart if exists
    if (Charts.charts.sensibilityDiscount) {
        Charts.charts.sensibilityDiscount.destroy();
    }

    const rates = sensitivity.map(s => s.rate.toFixed(1) + '%');
    const lcoe_kwh_data = sensitivity.map(s => parseFloat(s.lcoe_kwh.toFixed(4)));
    const lcoe_mwh_data = sensitivity.map(s => parseFloat(s.lcoe_mwh.toFixed(2)));

    Charts.charts.sensibilityDiscount = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rates,
            datasets: [
                {
                    label: 'LCOE (₹/kWh)',
                    data: lcoe_kwh_data,
                    borderColor: Charts.colors.primary,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: Charts.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    yAxisID: 'y'
                },
                {
                    label: 'LCOE (₹/MWh)',
                    data: lcoe_mwh_data,
                    borderColor: Charts.colors.secondary,
                    backgroundColor: 'rgba(118, 75, 162, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: Charts.colors.secondary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...Charts.defaultOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                ...Charts.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '📊 LCOE Sensitivity to Discount Rate',
                    font: { size: 16, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'LCOE (₹/MWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
};

/**
 * Generate 2D sensitivity table (LCOE vs two parameters)
 * @param {object} base_inputs - Base input parameters
 * @param {string} param1 - Parameter name (e.g., 'discount_rate')
 * @param {array} param1_range - Array of values for param1
 * @param {string} param2 - Parameter name (e.g., 'capex_per_mw')
 * @param {array} param2_range - Array of values for param2
 * @returns {array} 2D array of LCOE values
 */
Charts.generateSensitivity2D = function(base_inputs, param1, param1_range, param2, param2_range) {
    const matrix = [];

    for (let val1 of param1_range) {
        const row = [];
        for (let val2 of param2_range) {
            const inputs = {
                ...base_inputs,
                [param1]: val1,
                [param2]: val2
            };
            const calc = calculateLCOE(inputs);
            row.push(parseFloat(calc.lcoe_kwh.toFixed(4)));
        }
        matrix.push(row);
    }

    return {
        data: matrix,
        param1: param1,
        param1_range: param1_range,
        param2: param2,
        param2_range: param2_range
    };
};

/**
 * Plot 2D sensitivity as heatmap (requires special handling)
 * For now, returns data that can be displayed as table or bubble chart
 */
Charts.displaySensitivity2DTable = function(sensitivity2D) {
    const { data, param1, param1_range, param2, param2_range } = sensitivity2D;

    let html = `<table class="sensitivity-table" style="width: 100%; border-collapse: collapse; margin-top: 20px;">`;
    html += `<caption style="text-align: left; padding: 10px; font-weight: bold;">2D Sensitivity: LCOE (₹/kWh)</caption>`;

    // Header row
    html += `<tr><th style="border: 1px solid #ccc; padding: 8px;">${param1}</th>`;
    for (let val2 of param2_range) {
        html += `<th style="border: 1px solid #ccc; padding: 8px;">${param2}: ${val2}</th>`;
    }
    html += `</tr>`;

    // Data rows
    for (let i = 0; i < param1_range.length; i++) {
        html += `<tr><td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${param1}: ${param1_range[i]}</td>`;
        for (let j = 0; j < param2_range.length; j++) {
            const value = data[i][j];
            const color = Charts.getHeatmapColor(value, data);
            html += `<td style="border: 1px solid #ccc; padding: 8px; background-color: ${color}; color: #fff; text-align: center; font-weight: bold;">${value.toFixed(3)}</td>`;
        }
        html += `</tr>`;
    }

    html += `</table>`;
    return html;
};

/**
 * Get color for heatmap based on value (red = high LCOE, green = low LCOE)
 */
Charts.getHeatmapColor = function(value, allValues) {
    const min = Math.min(...allValues.flat());
    const max = Math.max(...allValues.flat());
    const normalized = (value - min) / (max - min);

    // Green (low) to Red (high)
    const hue = (1 - normalized) * 120; // HSL hue: 120 (green) to 0 (red)
    return `hsl(${hue}, 100%, 50%)`;
};

// ============================================
// COST BREAKDOWN CHARTS
// ============================================

/**
 * Display pie chart of cost components
 * @param {object} results - Results object from calculateLCOE
 */
Charts.plotCostBreakdown = function(results) {
    const ctx = document.getElementById('chart-cost-breakdown')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-cost-breakdown not found');
        return;
    }

    // Destroy previous chart if exists
    if (Charts.charts.costBreakdown) {
        Charts.charts.costBreakdown.destroy();
    }

    const capex = results.capex;
    const npv_om = results.npv_opex - (results.annual_emi * results.loan_tenure); // O&M portion
    const npv_loan = results.annual_emi * results.loan_tenure; // Loan portion

    Charts.charts.costBreakdown = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['CAPEX', 'O&M (NPV)', 'Loan Repayment (NPV)'],
            datasets: [{
                data: [capex, npv_om, npv_loan],
                backgroundColor: [
                    Charts.colors.primary,
                    Charts.colors.accent,
                    Charts.colors.warning
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            ...Charts.defaultOptions,
            plugins: {
                ...Charts.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '💰 Cost Component Breakdown',
                    font: { size: 16, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                },
                tooltip: {
                    ...Charts.defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = '₹' + context.parsed.toLocaleString('en-IN', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            });
                            const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
};

/**
 * Display bar chart comparing different scenarios
 * @param {array} scenarios - Array of scenario objects: { name, results }
 */
Charts.plotScenarioComparison = function(scenarios) {
    const ctx = document.getElementById('chart-scenario-comparison')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-scenario-comparison not found');
        return;
    }

    if (Charts.charts.scenarioComparison) {
        Charts.charts.scenarioComparison.destroy();
    }

    const labels = scenarios.map(s => s.name);
    const lcoe_kwh_data = scenarios.map(s => parseFloat(s.results.lcoe_kwh.toFixed(4)));
    const lcoe_mwh_data = scenarios.map(s => parseFloat(s.results.lcoe_mwh.toFixed(2)));

    Charts.charts.scenarioComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'LCOE (₹/kWh)',
                    data: lcoe_kwh_data,
                    backgroundColor: Charts.colors.primary,
                    borderColor: Charts.colors.primary,
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'LCOE (₹/MWh)',
                    data: lcoe_mwh_data,
                    backgroundColor: Charts.colors.secondary,
                    borderColor: Charts.colors.secondary,
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...Charts.defaultOptions,
            plugins: {
                ...Charts.defaultOptions.plugins,
                title: {
                    display: true,
                    text: '📊 Scenario Comparison',
                    font: { size: 16, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'LCOE (₹/MWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
};

// ============================================
// ENERGY GENERATION CHART
// ============================================

/**
 * Display energy generation over project lifetime with degradation
 * @param {object} base_inputs - Base input parameters
 * @param {object} results - Results from calculateLCOE
 */
Charts.plotEnergyDegradation = function(base_inputs, results) {
    const ctx = document.getElementById('chart-energy-degradation')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-energy-degradation not found');
        return;
    }

    if (Charts.charts.energyDegradation) {
        Charts.charts.energyDegradation.destroy();
    }

    const project_lifetime = base_inputs.project_lifetime;
    const annual_energy = base_inputs.energy_generation;
    const degradation_rate = CONSTANTS.degradation_rate;

    // Generate annual energy data
    const years = [];
    const energies = [];
    let cumulative = 0;

    for (let i = 0; i < project_lifetime; i++) {
        const energy_year = annual_energy * Math.pow(1 - degradation_rate, i);
        energies.push(parseFloat(energy_year.toFixed(2)));
        cumulative += energy_year;
        years.push((i + 1).toString());
    }

    Charts.charts.energyDegradation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Annual Energy Generation (MWh)',
                data: energies,
                backgroundColor: Charts.colors.success,
                borderColor: Charts.colors.success,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            ...Charts.defaultOptions,
            plugins: {
                ...Charts.defaultOptions.plugins,
                title: {
                    display: true,
                    text: `⚡ Energy Generation Over Project Life (${project_lifetime} years)`,
                    font: { size: 16, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                },
                tooltip: {
                    ...Charts.defaultOptions.plugins.tooltip,
                    callbacks: {
                        afterLabel: function(context) {
                            const year = parseInt(context.label);
                            const degradation = ((1 - Math.pow(1 - degradation_rate, year - 1)) * 100).toFixed(2);
                            return `Degradation: ${degradation}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (MWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });
};

// ============================================
// CASH FLOW CHART
// ============================================

/**
 * Display annual cash flows over project lifetime
 * @param {array} cash_flows - Annual cash flows from results
 * @param {number} discount_rate - Discount rate for PV calculation
 */
Charts.plotCashFlows = function(cash_flows, discount_rate) {
    const ctx = document.getElementById('chart-cash-flows')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-cash-flows not found');
        return;
    }

    if (Charts.charts.cashFlows) {
        Charts.charts.cashFlows.destroy();
    }

    const years = cash_flows.map((_, i) => (i + 1).toString());
    const cf_data = cash_flows.map(cf => parseFloat(cf.toFixed(0)));
    
    // Calculate present values
    const rate = discount_rate / 100;
    const pv_data = cash_flows.map((cf, i) => 
        parseFloat((cf / Math.pow(1 + rate, i + 1)).toFixed(0))
    );

    Charts.charts.cashFlows = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Annual Cash Flow (₹)',
                    data: cf_data,
                    backgroundColor: Charts.colors.warning,
                    borderColor: Charts.colors.warning,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Present Value (₹)',
                    data: pv_data,
                    type: 'line',
                    borderColor: Charts.colors.danger,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...Charts.defaultOptions,
            plugins: {
                ...Charts.defaultOptions.plugins,
                title: {
                    display: true,
                    text: `📈 Annual Cash Flows (Discount Rate: ${discount_rate}%)`,
                    font: { size: 16, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cash Flow (₹)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Present Value (₹)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
};

/**
 * Destroy all active charts
 */
Charts.destroyAllCharts = function() {
    Object.keys(Charts.charts).forEach(key => {
        if (Charts.charts[key]) {
            Charts.charts[key].destroy();
            Charts.charts[key] = null;
        }
    });
};