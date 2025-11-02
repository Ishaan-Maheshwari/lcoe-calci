/**
 * ============================================
 * SOLAR LCOE CALCULATOR - ADVANCED CHARTS
 * ============================================
 * 
 * Tornado Diagram: Shows parameter sensitivity ranking
 * Dual Parameter Heatmap: Shows LCOE at different parameter combinations
 * 
 * Author: Energy Economics Team
 * Version: 1.0
 */

const AdvancedCharts = {
    // Store chart instances
    charts: {
        tornado: null,
        heatmap: null
    },

    // Color palette
    colors: {
        increase: '#ef5350',    // Red for parameter increase
        decrease: '#66bb6a',    // Green for parameter decrease
        neutral: '#42a5f5'      // Blue for baseline
    }
};

// ============================================
// TORNADO DIAGRAM
// ============================================

/**
 * Generate Tornado Diagram showing sensitivity ranking
 * Each parameter is varied ±% from base value
 * Wider bars = more sensitive parameter
 * 
 * @param {object} base_inputs - Base input parameters
 * @param {number} variance_percent - +/- variance to apply (e.g., 20 = ±20%)
 */
AdvancedCharts.plotTornado = function(base_inputs, variance_percent = 20) {
    const ctx = document.getElementById('chart-tornado')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-tornado not found');
        return;
    }

    if (AdvancedCharts.charts.tornado) {
        AdvancedCharts.charts.tornado.destroy();
    }

    // Get base LCOE
    const base_results = calculateLCOE(base_inputs);
    const base_lcoe = base_results.lcoe_kwh;

    // Parameters to analyze with their variance ranges
    const parameters = [
        {
            name: 'CAPEX per MW',
            key: 'capex_per_mw',
            base_value: base_inputs.capex_per_mw,
            variance: variance_percent
        },
        {
            name: 'Annual Energy',
            key: 'energy_generation',
            base_value: base_inputs.energy_generation,
            variance: variance_percent
        },
        {
            name: 'Discount Rate',
            key: 'discount_rate',
            base_value: base_inputs.discount_rate,
            variance: variance_percent
        },
        {
            name: 'OPEX %',
            key: 'opex_percent',
            base_value: base_inputs.opex_percent,
            variance: variance_percent
        },
        {
            name: 'Loan Tenure',
            key: 'loan_tenure',
            base_value: base_inputs.loan_tenure,
            variance: variance_percent
        },
        {
            name: 'Interest Rate',
            key: 'interest_rate',
            base_value: base_inputs.interest_rate,
            variance: variance_percent
        }
    ];

    // Calculate LCOE impacts
    const impacts = [];

    for (const param of parameters) {
        const variance_amount = (param.base_value * param.variance) / 100;

        // Calculate LCOE at -variance
        const inputs_low = {
            ...base_inputs,
            [param.key]: param.base_value - variance_amount
        };
        const lcoe_low = calculateLCOE(inputs_low).lcoe_kwh;

        // Calculate LCOE at +variance
        const inputs_high = {
            ...base_inputs,
            [param.key]: param.base_value + variance_amount
        };
        const lcoe_high = calculateLCOE(inputs_high).lcoe_kwh;

        // Calculate impact (negative = decrease, positive = increase)
        const impact_low = lcoe_low - base_lcoe;  // Change when decreased
        const impact_high = lcoe_high - base_lcoe; // Change when increased

        impacts.push({
            name: param.name,
            low: Math.min(impact_low, impact_high),    // More negative is lower
            high: Math.max(impact_low, impact_high),    // More positive is higher
            range: Math.abs(impact_high - impact_low)
        });
    }

    // Sort by impact range (descending)
    impacts.sort((a, b) => Math.abs(b.range) - Math.abs(a.range));

    // Prepare chart data - create stacked effect
    const labels = impacts.map(i => i.name);
    const negative_data = impacts.map(i => i.low);  // Negative values (left bars)
    const positive_data = impacts.map(i => i.high); // Positive values (right bars)

    AdvancedCharts.charts.tornado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `LCOE Decrease [-${variance_percent}%]`,
                    data: negative_data,
                    backgroundColor: AdvancedCharts.colors.decrease,
                    borderColor: AdvancedCharts.colors.decrease,
                    borderWidth: 1,
                    barThickness: 35
                },
                {
                    label: `LCOE Increase [+${variance_percent}%]`,
                    data: positive_data,
                    backgroundColor: AdvancedCharts.colors.increase,
                    borderColor: AdvancedCharts.colors.increase,
                    borderWidth: 1,
                    barThickness: 35
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: '600' }
                    }
                },
                title: {
                    display: true,
                    text: `🌪️ Tornado Diagram: LCOE Sensitivity Ranking (Base: ₹${base_lcoe.toFixed(2)}/kWh)`,
                    font: { size: 14, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x.toFixed(4);
                            const sign = context.parsed.x > 0 ? '+' : '';
                            return `Impact: ${sign}₹${value}/kWh`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'LCOE Impact (₹/kWh)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    stacked: false,
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Log rankings to console
    console.log('🌪️ Tornado Sensitivity Rankings:');
    impacts.forEach((impact, idx) => {
        console.log(`${idx + 1}. ${impact.name}: ±₹${(impact.range / 2).toFixed(4)}/kWh range (impact: ₹${impact.low.toFixed(4)} to ₹${impact.high.toFixed(4)})`);
    });
};

// ============================================
// DUAL PARAMETER HEATMAP
// ============================================

/**
 * Generate interactive heatmap showing LCOE for two parameters
 * 
 * @param {object} base_inputs - Base input parameters
 * @param {string} param1_key - First parameter key (e.g., 'capex_per_mw')
 * @param {string} param1_label - Display label for param1
 * @param {array} param1_range - Array of values for param1
 * @param {string} param2_key - Second parameter key (e.g., 'discount_rate')
 * @param {string} param2_label - Display label for param2
 * @param {array} param2_range - Array of values for param2
 */
AdvancedCharts.plotDualParameterHeatmap = function(
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    const ctx = document.getElementById('chart-heatmap')?.getContext('2d');
    if (!ctx) {
        console.warn('Chart canvas #chart-heatmap not found');
        return;
    }

    if (AdvancedCharts.charts.heatmap) {
        AdvancedCharts.charts.heatmap.destroy();
    }

    // Generate 2D matrix of LCOE values
    const matrix = [];
    const all_lcoe_values = [];

    for (let val1 of param1_range) {
        for (let val2 of param2_range) {
            const inputs = {
                ...base_inputs,
                [param1_key]: val1,
                [param2_key]: val2
            };
            const lcoe = calculateLCOE(inputs).lcoe_kwh;
            matrix.push({
                x: param2_range.indexOf(val2),
                y: param1_range.indexOf(val1),
                v: lcoe
            });
            all_lcoe_values.push(lcoe);
        }
    }

    // Find min and max for color scaling
    const min_lcoe = Math.min(...all_lcoe_values);
    const max_lcoe = Math.max(...all_lcoe_values);
    const range = max_lcoe - min_lcoe;

    // Normalize values to 0-1 for color mapping
    const normalized_matrix = matrix.map(point => ({
        ...point,
        normalized: (point.v - min_lcoe) / range
    }));

    // Map to colors (green = low LCOE, red = high LCOE)
    const colors_data = normalized_matrix.map(point => {
        const hue = (1 - point.normalized) * 120; // 0° red to 120° green
        return `hsl(${hue}, 100%, 50%)`;
    });

    // Create bubble chart (best for 2D heatmap in Chart.js)
    const bubble_data = normalized_matrix.map((point, idx) => ({
        x: param2_range[point.x],
        y: param1_range[point.y],
        r: 25,
        value: point.v,
        color: colors_data[idx]
    }));

    AdvancedCharts.charts.heatmap = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'LCOE (₹/kWh)',
                data: bubble_data.map(d => ({
                    x: d.x,
                    y: d.y,
                    r: d.r
                })),
                backgroundColor: colors_data,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `🔥 Dual Parameter Heatmap: LCOE Sensitivity\n${param1_label} vs ${param2_label}`,
                    font: { size: 14, weight: 'bold' },
                    padding: 20,
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 15,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const lcoe = bubble_data[idx].value;
                            return `LCOE: ₹${lcoe.toFixed(4)}/kWh`;
                        },
                        label: function(context) {
                            const idx = context.dataIndex;
                            return `${param1_label}: ${context.parsed.y}\n${param2_label}: ${context.parsed.x}`;
                        },
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            const normalized = bubble_data[idx].value;
                            const percent = ((normalized - min_lcoe) / range * 100).toFixed(0);
                            return `Range: ${percent}% (${min_lcoe.toFixed(4)} - ${max_lcoe.toFixed(4)})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: param2_label,
                        font: { size: 12, weight: 'bold' }
                    },
                    min: Math.min(...param2_range) * 0.95,
                    max: Math.max(...param2_range) * 1.05
                },
                y: {
                    title: {
                        display: true,
                        text: param1_label,
                        font: { size: 12, weight: 'bold' }
                    },
                    min: Math.min(...param1_range) * 0.95,
                    max: Math.max(...param1_range) * 1.05
                }
            }
        }
    });

    // Log heatmap data summary
    console.log(`🔥 Heatmap: ${param1_label} vs ${param2_label}`);
    console.log(`LCOE Range: ₹${min_lcoe.toFixed(4)} - ₹${max_lcoe.toFixed(4)}/kWh`);
    console.log(`Min LCOE (₹${min_lcoe.toFixed(4)}) at: ${param1_label}=${param1_range[0]}, ${param2_label}=${param2_range[0]}`);
    console.log(`Max LCOE (₹${max_lcoe.toFixed(4)}) at: ${param1_label}=${param1_range[param1_range.length-1]}, ${param2_label}=${param2_range[param2_range.length-1]}`);
};

/**
 * Display heatmap data as an interactive HTML table
 * Better for detailed analysis than chart
 */
AdvancedCharts.displayHeatmapTable = function(
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    // Generate 2D matrix
    const matrix = [];
    for (let val1 of param1_range) {
        const row = [];
        for (let val2 of param2_range) {
            const inputs = {
                ...base_inputs,
                [param1_key]: val1,
                [param2_key]: val2
            };
            const lcoe = calculateLCOE(inputs).lcoe_kwh;
            row.push(lcoe);
        }
        matrix.push(row);
    }

    // Find min and max
    const flat = matrix.flat();
    const min_val = Math.min(...flat);
    const max_val = Math.max(...flat);

    // Build HTML table
    let html = `<table class="heatmap-table">`;
    html += `<caption>${param1_label} vs ${param2_label} - LCOE (₹/kWh)</caption>`;

    // Header row
    html += `<tr><th>${param1_label}</th>`;
    for (let val2 of param2_range) {
        const display_val = typeof val2 === 'number' && val2 > 100 ? 
            (val2 / 1e6).toFixed(0) + 'M' : val2;
        html += `<th>${param2_label}: ${display_val}</th>`;
    }
    html += `</tr>`;

    // Data rows
    for (let i = 0; i < param1_range.length; i++) {
        const display_val1 = typeof param1_range[i] === 'number' && param1_range[i] > 100 ? 
            (param1_range[i] / 1e6).toFixed(0) + 'M' : param1_range[i];
        html += `<tr><td class="row-header">${display_val1}</td>`;
        for (let j = 0; j < param2_range.length; j++) {
            const value = matrix[i][j];
            const normalized = (value - min_val) / (max_val - min_val);
            const hue = (1 - normalized) * 120;
            const bg_color = `hsl(${hue}, 100%, 50%)`;
            const text_color = normalized > 0.5 ? '#fff' : '#000';

            html += `<td style="background-color: ${bg_color}; color: ${text_color}; font-weight: bold; text-align: center; padding: 10px;">₹${value.toFixed(3)}</td>`;
        }
        html += `</tr>`;
    }

    html += `</table>`;
    return html;
};

/**
 * Destroy all advanced charts
 */
AdvancedCharts.destroyAllCharts = function() {
    Object.keys(AdvancedCharts.charts).forEach(key => {
        if (AdvancedCharts.charts[key]) {
            AdvancedCharts.charts[key].destroy();
            AdvancedCharts.charts[key] = null;
        }
    });
};