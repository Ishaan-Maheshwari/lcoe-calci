/**
 * ============================================
 * SOLAR LCOE CALCULATOR - PARAMETER RANGE ANALYSIS
 * ============================================
 * 
 * Shows how each parameter affects LCOE across its full range
 * Multiple line charts showing parameter sensitivity curves
 * 
 * Author: Energy Economics Team
 * Version: 1.0
 */

const RangeCharts = {
    // Store chart instances
    charts: {
        parametersCombo: null,
        capexRange: null,
        energyRange: null,
        discountRange: null
    },

    // Color palette
    colors: {
        capex: '#ef5350',           // Red
        energy: '#66bb6a',          // Green
        discount: '#42a5f5',        // Blue
        opex: '#ffa726',            // Orange
        interest: '#ab47bc',        // Purple
        tenure: '#29b6f6'           // Light Blue
    }
};

// ============================================
// PARAMETER RANGE ANALYSIS - INDIVIDUAL
// ============================================

/**
 * Generate parameter range data for a single parameter
 * Shows LCOE across the full practical range
 * 
 * @param {object} base_inputs - Base input parameters
 * @param {string} param_key - Parameter to vary (e.g., 'capex_per_mw')
 * @param {array} param_range - Array of values to test
 * @returns {object} Data with labels and LCOE values
 */
RangeCharts.generateParameterRange = function(base_inputs, param_key, param_range) {
    const lcoe_values = [];
    
    for (let value of param_range) {
        const inputs = {
            ...base_inputs,
            [param_key]: value
        };
        const result = calculateLCOE(inputs);
        lcoe_values.push({
            value: value,
            lcoe_kwh: result.lcoe_kwh,
            lcoe_mwh: result.lcoe_mwh
        });
    }
    
    return lcoe_values;
};

/**
 * Plot CAPEX per MW range analysis
 */
RangeCharts.plotCapexRange = function(base_inputs) {
    const ctx = document.getElementById('chart-capex-range')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-capex-range not found');
        return;
    }

    if (RangeCharts.charts.capexRange) {
        RangeCharts.charts.capexRange.destroy();
    }

    // Generate range data
    const range = [30e6, 35e6, 40e6, 45e6, 50e6, 55e6, 60e6, 65e6, 70e6];
    const data = RangeCharts.generateParameterRange(base_inputs, 'capex_per_mw', range);

    const labels = data.map(d => '₹' + (d.value / 1e6).toFixed(0) + 'M');
    const lcoe_kwh = data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));

    RangeCharts.charts.capexRange = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'LCOE (₹/kWh)',
                data: lcoe_kwh,
                borderColor: RangeCharts.colors.capex,
                backgroundColor: 'rgba(239, 83, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: RangeCharts.colors.capex,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '💰 CAPEX per MW Impact on LCOE',
                    font: { size: 14, weight: 'bold' },
                    padding: 15,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            return `CAPEX: ₹${(data[idx].value / 1e6).toFixed(0)}M`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'CAPEX per MW',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    console.log('💰 CAPEX Range Analysis:');
    console.log(`Range: ₹${(range[0]/1e6).toFixed(0)}M - ₹${(range[range.length-1]/1e6).toFixed(0)}M`);
    console.log(`LCOE Range: ₹${Math.min(...lcoe_kwh).toFixed(4)} - ₹${Math.max(...lcoe_kwh).toFixed(4)}/kWh`);
};

/**
 * Plot Annual Energy Generation range analysis
 */
RangeCharts.plotEnergyRange = function(base_inputs) {
    const ctx = document.getElementById('chart-energy-range')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-energy-range not found');
        return;
    }

    if (RangeCharts.charts.energyRange) {
        RangeCharts.charts.energyRange.destroy();
    }

    // Generate range data
    const range = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600];
    const data = RangeCharts.generateParameterRange(base_inputs, 'energy_generation', range);

    const labels = data.map(d => d.value + ' MWh');
    const lcoe_kwh = data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));

    RangeCharts.charts.energyRange = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'LCOE (₹/kWh)',
                data: lcoe_kwh,
                borderColor: RangeCharts.colors.energy,
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: RangeCharts.colors.energy,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '⚡ Annual Energy Generation Impact on LCOE',
                    font: { size: 14, weight: 'bold' },
                    padding: 15,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            return `Energy: ${data[idx].value} MWh/year`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Annual Energy Generation (MWh)',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    console.log('⚡ Energy Range Analysis:');
    console.log(`Range: ${range[0]} - ${range[range.length-1]} MWh/year`);
    console.log(`LCOE Range: ₹${Math.min(...lcoe_kwh).toFixed(4)} - ₹${Math.max(...lcoe_kwh).toFixed(4)}/kWh`);
};

/**
 * Plot Discount Rate range analysis
 */
RangeCharts.plotDiscountRange = function(base_inputs) {
    const ctx = document.getElementById('chart-discount-range')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-discount-range not found');
        return;
    }

    if (RangeCharts.charts.discountRange) {
        RangeCharts.charts.discountRange.destroy();
    }

    // Generate range data
    const range = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const data = RangeCharts.generateParameterRange(base_inputs, 'discount_rate', range);

    const labels = data.map(d => d.value + '%');
    const lcoe_kwh = data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));

    RangeCharts.charts.discountRange = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'LCOE (₹/kWh)',
                data: lcoe_kwh,
                borderColor: RangeCharts.colors.discount,
                backgroundColor: 'rgba(66, 165, 245, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: RangeCharts.colors.discount,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '📊 Discount Rate Impact on LCOE',
                    font: { size: 14, weight: 'bold' },
                    padding: 15,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            return `Discount Rate: ${data[idx].value}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Discount Rate (%)',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    console.log('📊 Discount Rate Range Analysis:');
    console.log(`Range: ${range[0]}% - ${range[range.length-1]}%`);
    console.log(`LCOE Range: ₹${Math.min(...lcoe_kwh).toFixed(4)} - ₹${Math.max(...lcoe_kwh).toFixed(4)}/kWh`);
};

// ============================================
// COMBINED PARAMETER RANGES
// ============================================

/**
 * Plot multiple parameters on same chart for comparison
 */
RangeCharts.plotAllParametersCombo = function(base_inputs) {
    const ctx = document.getElementById('chart-parameters-combo')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-parameters-combo not found');
        return;
    }

    if (RangeCharts.charts.parametersCombo) {
        RangeCharts.charts.parametersCombo.destroy();
    }

    // Define parameter ranges - normalized to show relative impact
    const capex_range = [30e6, 40e6, 50e6, 60e6, 70e6];
    const energy_range = [1200, 1500, 1800, 2100, 2400];
    const discount_range = [5, 7.5, 10, 12.5, 15];

    // Generate data
    const capex_data = RangeCharts.generateParameterRange(base_inputs, 'capex_per_mw', capex_range);
    const energy_data = RangeCharts.generateParameterRange(base_inputs, 'energy_generation', energy_range);
    const discount_data = RangeCharts.generateParameterRange(base_inputs, 'discount_rate', discount_range);

    // Normalize x-axis (0 to 100) for comparison
    const normalize = (arr) => arr.map((_, i) => (i / (arr.length - 1)) * 100);
    const x_normalized = normalize(capex_range);

    // Extract LCOE values
    const capex_lcoe = capex_data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));
    const energy_lcoe = energy_data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));
    const discount_lcoe = discount_data.map(d => parseFloat(d.lcoe_kwh.toFixed(4)));

    RangeCharts.charts.parametersCombo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Min', '25%', '50%', '75%', 'Max'],
            datasets: [
                {
                    label: 'CAPEX per MW',
                    data: capex_lcoe,
                    borderColor: RangeCharts.colors.capex,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: RangeCharts.colors.capex,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Annual Energy',
                    data: energy_lcoe,
                    borderColor: RangeCharts.colors.energy,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: RangeCharts.colors.energy,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Discount Rate',
                    data: discount_lcoe,
                    borderColor: RangeCharts.colors.discount,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: RangeCharts.colors.discount,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: '600' }
                    }
                },
                title: {
                    display: true,
                    text: '📈 Parameter Sensitivity Comparison: LCOE Across Ranges',
                    font: { size: 14, weight: 'bold' },
                    padding: 15,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const dataset_idx = context.datasetIndex;
                            if (dataset_idx === 0) {
                                return `CAPEX: ₹${(capex_range[context.dataIndex] / 1e6).toFixed(0)}M`;
                            } else if (dataset_idx === 1) {
                                return `Energy: ${energy_range[context.dataIndex]} MWh`;
                            } else {
                                return `Discount: ${discount_range[context.dataIndex]}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Parameter Range (Min → Max)',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    console.log('📈 Combined Parameter Range Analysis:');
    console.log(`CAPEX Range: ₹${Math.min(...capex_lcoe).toFixed(4)} - ₹${Math.max(...capex_lcoe).toFixed(4)}/kWh`);
    console.log(`Energy Range: ₹${Math.min(...energy_lcoe).toFixed(4)} - ₹${Math.max(...energy_lcoe).toFixed(4)}/kWh`);
    console.log(`Discount Range: ₹${Math.min(...discount_lcoe).toFixed(4)} - ₹${Math.max(...discount_lcoe).toFixed(4)}/kWh`);
};

// ============================================
// RANGE SUMMARY TABLE
// ============================================

/**
 * Generate summary table showing LCOE at min/max for each parameter
 */
RangeCharts.generateRangeSummaryTable = function(base_inputs) {
    const parameters = [
        {
            name: 'CAPEX per MW',
            key: 'capex_per_mw',
            min: 30e6,
            max: 70e6,
            current: base_inputs.capex_per_mw
        },
        {
            name: 'Annual Energy (MWh)',
            key: 'energy_generation',
            min: 1200,
            max: 2400,
            current: base_inputs.energy_generation
        },
        {
            name: 'Discount Rate (%)',
            key: 'discount_rate',
            min: 5,
            max: 15,
            current: base_inputs.discount_rate
        },
        {
            name: 'OPEX (% of CAPEX)',
            key: 'opex_percent',
            min: 1,
            max: 3,
            current: base_inputs.opex_percent
        },
        {
            name: 'Interest Rate (%)',
            key: 'interest_rate',
            min: 7,
            max: 12,
            current: base_inputs.interest_rate
        }
    ];

    let html = `<table class="range-summary-table">`;
    html += `<thead>`;
    html += `<tr>`;
    html += `<th>Parameter</th>`;
    html += `<th>Min </th>`;
    html += `<th>LCOE @ Min</th>`;
    html += `<th>Current </th>`;
    html += `<th>LCOE @ Current</th>`;
    html += `<th>Max</th>`;
    html += `<th>LCOE @ Max</th>`;
    html += `<th>LCOE Range</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;

    for (const param of parameters) {
        // Calculate LCOE at min
        const inputs_min = { ...base_inputs, [param.key]: param.min };
        const lcoe_min = calculateLCOE(inputs_min).lcoe_kwh;

        // Calculate LCOE at current
        const inputs_current = { ...base_inputs, [param.key]: param.current };
        const lcoe_current = calculateLCOE(inputs_current).lcoe_kwh;

        // Calculate LCOE at max
        const inputs_max = { ...base_inputs, [param.key]: param.max };
        const lcoe_max = calculateLCOE(inputs_max).lcoe_kwh;

        const range = Math.abs(lcoe_max - lcoe_min);
        const range_percent = (range / lcoe_current * 100).toFixed(1);

        // Format values based on type
        const format_value = (val) => {
            if (param.key === 'capex_per_mw') {
                return `₹${(val / 1e6).toFixed(1)}M`;
            } else if (param.key === 'discount_rate' || param.key === 'interest_rate' || param.key === 'opex_percent') {
                return `${val.toFixed(1)}%`;
            } else {
                return val.toLocaleString();
            }
        };

        html += `<tr>`;
        html += `<td class="param-name"><strong>${param.name}</strong></td>`;
        html += `<td>${format_value(param.min)}</td>`;
        html += `<td class="lcoe-value" style="color: green;">₹${lcoe_min.toFixed(4)}</td>`;
        html += `<td>${format_value(param.current)}</td>`;
        html += `<td class="lcoe-value" style="color: blue; font-weight: bold;">₹${lcoe_current.toFixed(4)}</td>`;
        html += `<td>${format_value(param.max)}</td>`;
        html += `<td class="lcoe-value" style="color: red;">₹${lcoe_max.toFixed(4)}</td>`;
        html += `<td style="font-weight: bold; background: #f0f0f0;">₹${range.toFixed(4)} (${range_percent}%)</td>`;
        html += `</tr>`;
    }

    html += `</tbody>`;
    html += `</table>`;
    return html;
};

/**
 * Destroy all range charts
 */
RangeCharts.destroyAllCharts = function() {
    Object.keys(RangeCharts.charts).forEach(key => {
        if (RangeCharts.charts[key]) {
            RangeCharts.charts[key].destroy();
            RangeCharts.charts[key] = null;
        }
    });
};