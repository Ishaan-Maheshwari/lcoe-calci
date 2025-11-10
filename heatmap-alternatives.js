/**
 * ============================================
 * SOLAR LCOE CALCULATOR - HEATMAP ALTERNATIVES
 * ============================================
 * 
 * Three beautiful heatmap representations:
 * 1. Grid Heatmap (SVG-based, cleaner than bubble)
 * 2. Smooth Gradient Heatmap (contour-style)
 * 3. Interactive Cell Heatmap (GitHub-style)
 * 
 * Author: Energy Economics Team
 * Version: 1.0
 */

const HeatmapAlternatives = {
    charts: {
        gridHeatmap: null,
        cellHeatmap: null
    }
};

// ============================================
// HEATMAP STYLE 1: GRID HEATMAP (HTML/CSS)
// Professional square grid with smooth colors
// ============================================

/**
 * Create beautiful grid heatmap using HTML canvas
 * Shows parameter combinations as colored grid
 */
HeatmapAlternatives.plotGridHeatmap = function(
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    const container = document.getElementById('heatmap-grid-container');
    if (!container) {
        console.warn('Container #heatmap-grid-container not found');
        return;
    }

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

    const flat = matrix.flat();
    const min_val = Math.min(...flat);
    const max_val = Math.max(...flat);
    const mid_val = (min_val + max_val) / 2;

    // Create HTML grid with flex layout for proper axis positioning
    let html = `<div class="heatmap-grid-wrapper">`;
    
    // Title with parameter labels
    html += `<div class="heatmap-title">`;
    html += `<p><strong>${param1_label}</strong> vs <strong>${param2_label}</strong></p>`;
    html += `</div>`;

    // Main grid container with Y-axis on left
    html += `<div class="heatmap-container">`;
    
    // Y-axis labels (parameters 1) - on the left side
    html += `<div class="heatmap-axis-y">`;
    for (let val1 of param1_range) {
        const display_val = typeof val1 === 'number' && val1 > 100 ? 
            (val1 / 1e6).toFixed(0) + 'M' : val1.toFixed(1);
        html += `<div class="heatmap-label-y">${display_val}</div>`;
    }
    html += `</div>`;

    // Grid wrapper for grid + x-axis
    html += `<div class="heatmap-grid-section">`;

    // Grid cells
    html += `<div class="heatmap-grid">`;
    for (let i = 0; i < matrix.length; i++) {
        html += `<div class="heatmap-row">`;
        for (let j = 0; j < matrix[i].length; j++) {
            const value = matrix[i][j];
            const normalized = (value - min_val) / (max_val - min_val);
            
            // Beautiful color scale: Green (low) → Yellow → Red (high)
            let color;
            if (normalized < 0.5) {
                // Green to Yellow
                const ratio = normalized * 2;
                const r = Math.round(255 * ratio);
                const g = 255;
                const b = 0;
                color = `rgb(${r}, ${g}, ${b})`;
            } else {
                // Yellow to Red
                const ratio = (normalized - 0.5) * 2;
                const r = 255;
                const g = Math.round(255 * (1 - ratio));
                const b = 0;
                color = `rgb(${r}, ${g}, ${b})`;
            }

            const text_color = normalized > 0.6 ? '#fff' : '#000';
            
            html += `
                <div class="heatmap-cell" 
                     style="background-color: ${color}; color: ${text_color};"
                     title="${param1_label}: ${param1_range[i]}, ${param2_label}: ${param2_range[j]}, LCOE: ₹${value.toFixed(4)}/kWh">
                    <span class="heatmap-cell-value">₹${value.toFixed(2)}</span>
                </div>
            `;
        }
        html += `</div>`;
    }
    html += `</div>`;

    // X-axis labels (parameters 2) - below grid
    html += `<div class="heatmap-labels-x">`;
    for (let val2 of param2_range) {
        const display_val = typeof val2 === 'number' && val2 > 100 ? 
            (val2 / 1e6).toFixed(0) + 'M' : val2.toFixed(1);
        html += `<div class="heatmap-label-x">${display_val}</div>`;
    }
    html += `</div>`;

    html += `</div>`; // Close heatmap-grid-section
    html += `</div>`; // Close heatmap-container

    // Legend
    html += `<div class="heatmap-legend">`;
    html += `<div class="legend-item"><span class="legend-color" style="background: #00ff00;"></span>Low LCOE (Best)</div>`;
    html += `<div class="legend-item"><span class="legend-color" style="background: #ffff00;"></span>Medium LCOE</div>`;
    html += `<div class="legend-item"><span class="legend-color" style="background: #ff0000;"></span>High LCOE (Worst)</div>`;
    html += `</div>`;

    html += `</div>`;

    container.innerHTML = html;

    console.log('✅ Grid heatmap generated');
    console.log(`Range: ₹${min_val.toFixed(4)} - ₹${max_val.toFixed(4)}/kWh`);
};

// ============================================
// HEATMAP STYLE 2: SMOOTH CONTOUR HEATMAP
// SVG-based with smooth color transitions
// ============================================

/**
 * Create smooth contour heatmap with SVG
 * Looks like weather maps or topographic maps
 */
HeatmapAlternatives.plotContourHeatmap = function(
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    const canvas_id = 'chart-heatmap-smooth';
    const ctx = document.getElementById(canvas_id)?.getContext('2d');
    if (!ctx) {
        console.warn(`Canvas #${canvas_id} not found`);
        return;
    }

    // Generate matrix with more granular data for smooth rendering
    const granular_range1 = [];
    const granular_range2 = [];
    
    // Create finer grid (interpolate between points)
    for (let i = 0; i < param1_range.length - 1; i++) {
        granular_range1.push(param1_range[i]);
        granular_range1.push((param1_range[i] + param1_range[i + 1]) / 2);
    }
    granular_range1.push(param1_range[param1_range.length - 1]);

    for (let i = 0; i < param2_range.length - 1; i++) {
        granular_range2.push(param2_range[i]);
        granular_range2.push((param2_range[i] + param2_range[i + 1]) / 2);
    }
    granular_range2.push(param2_range[param2_range.length - 1]);

    // Generate data for granular grid
    const matrix = [];
    const all_values = [];

    for (let val1 of granular_range1) {
        const row = [];
        for (let val2 of granular_range2) {
            const inputs = {
                ...base_inputs,
                [param1_key]: val1,
                [param2_key]: val2
            };
            const lcoe = calculateLCOE(inputs).lcoe_kwh;
            row.push(lcoe);
            all_values.push(lcoe);
        }
        matrix.push(row);
    }

    const min_val = Math.min(...all_values);
    const max_val = Math.max(...all_values);

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const cell_width = width / granular_range2.length;
    const cell_height = height / granular_range1.length;

    // Draw gradient cells
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const value = matrix[i][j];
            const normalized = (value - min_val) / (max_val - min_val);

            // Get color for this value
            let r, g, b;
            if (normalized < 0.33) {
                // Green to Cyan
                const ratio = normalized / 0.33;
                r = 0;
                g = 255;
                b = Math.round(255 * ratio);
            } else if (normalized < 0.67) {
                // Cyan to Yellow
                const ratio = (normalized - 0.33) / 0.34;
                r = Math.round(255 * ratio);
                g = 255;
                b = Math.round(255 * (1 - ratio));
            } else {
                // Yellow to Red
                const ratio = (normalized - 0.67) / 0.33;
                r = 255;
                g = Math.round(255 * (1 - ratio));
                b = 0;
            }

            // Fill cell
            const x = Math.round(j * cell_width);
            const y = Math.round(i * cell_height);
            const w = Math.round(cell_width);
            const h = Math.round(cell_height);

            for (let py = 0; py < h; py++) {
                for (let px = 0; px < w; px++) {
                    const idx = ((y + py) * width + (x + px)) * 4;
                    data[idx] = r;      // R
                    data[idx + 1] = g;  // G
                    data[idx + 2] = b;  // B
                    data[idx + 3] = 255; // A
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw axes and labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i < param2_range.length; i++) {
        const x = (i / (param2_range.length - 1)) * width;
        const label = typeof param2_range[i] > 100 ? 
            (param2_range[i] / 1e6).toFixed(0) + 'M' : param2_range[i].toFixed(1);
        ctx.fillText(label, x, height + 20);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i < param1_range.length; i++) {
        const y = (i / (param1_range.length - 1)) * height;
        const label = typeof param1_range[i] > 100 ? 
            (param1_range[i] / 1e6).toFixed(0) + 'M' : param1_range[i].toFixed(1);
        ctx.fillText(label, -10, y + 5);
    }

    console.log('✅ Contour heatmap generated');
};

// ============================================
// HEATMAP STYLE 3: INTERACTIVE CELL TABLE
// GitHub-style color grid
// ============================================

/**
 * Create interactive cell heatmap (GitHub-style)
 * Hoverable cells with tooltips
 */
HeatmapAlternatives.plotCellHeatmap = function(
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    const container = document.getElementById('heatmap-cell-container');
    if (!container) {
        console.warn('Container #heatmap-cell-container not found');
        return;
    }

    // Generate matrix
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

    const flat = matrix.flat();
    const min_val = Math.min(...flat);
    const max_val = Math.max(...flat);

    // Create interactive table
    let html = `<table class="heatmap-cell-table">`;
    html += `<thead><tr><th></th>`;
    
    for (let val2 of param2_range) {
        const display = typeof val2 > 100 ? (val2/1e6).toFixed(0) + 'M' : val2.toFixed(1);
        html += `<th>${display}</th>`;
    }
    html += `</tr></thead>`;

    html += `<tbody>`;
    for (let i = 0; i < matrix.length; i++) {
        html += `<tr>`;
        const display_y = typeof param1_range[i] > 100 ? 
            (param1_range[i]/1e6).toFixed(0) + 'M' : param1_range[i].toFixed(1);
        html += `<th>${display_y}</th>`;

        for (let j = 0; j < matrix[i].length; j++) {
            const value = matrix[i][j];
            const normalized = (value - min_val) / (max_val - min_val);
            
            // Beautiful gradient: Green → Yellow → Red
            let color;
            if (normalized < 0.5) {
                const ratio = normalized * 2;
                const r = Math.round(255 * ratio);
                const g = 255;
                const b = 0;
                color = `rgb(${r}, ${g}, ${b})`;
            } else {
                const ratio = (normalized - 0.5) * 2;
                const r = 255;
                const g = Math.round(255 * (1 - ratio));
                const b = 0;
                color = `rgb(${r}, ${g}, ${b})`;
            }

            const text_color = normalized > 0.6 ? '#fff' : '#000';
            const intensity = (normalized * 100).toFixed(0);

            html += `
                <td class="heatmap-cell-td" 
                    style="background-color: ${color}; color: ${text_color}; opacity: ${0.6 + normalized * 0.4};"
                    title="${param1_label}: ${param1_range[i]}, ${param2_label}: ${param2_range[j]}, LCOE: ₹${value.toFixed(4)}/kWh">
                    <span class="cell-value">₹${value.toFixed(2)}</span>
                    <span class="cell-intensity">${intensity}%</span>
                </td>
            `;
        }
        html += `</tr>`;
    }
    html += `</tbody></table>`;

    container.innerHTML = html;

    console.log('✅ Cell heatmap generated');
};

/**
 * Helper to determine which heatmap to show
 */
HeatmapAlternatives.generateHeatmap = function(
    style,
    base_inputs,
    param1_key,
    param1_label,
    param1_range,
    param2_key,
    param2_label,
    param2_range
) {
    if (style === 'grid') {
        HeatmapAlternatives.plotGridHeatmap(
            base_inputs, param1_key, param1_label, param1_range,
            param2_key, param2_label, param2_range
        );
    } else if (style === 'contour') {
        HeatmapAlternatives.plotContourHeatmap(
            base_inputs, param1_key, param1_label, param1_range,
            param2_key, param2_label, param2_range
        );
    } else if (style === 'cell') {
        HeatmapAlternatives.plotCellHeatmap(
            base_inputs, param1_key, param1_label, param1_range,
            param2_key, param2_label, param2_range
        );
    }
};