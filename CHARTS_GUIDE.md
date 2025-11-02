# 📊 Charts Module - Complete Guide

## Overview

The charting module adds powerful visualization capabilities to the Solar LCOE Calculator using **Chart.js 3.9.1**. All charts update automatically as you change input parameters.

---

## 🎯 Available Charts

### 1. **Sensitivity Analysis: LCOE vs Discount Rate**
- **Type:** Line chart with dual axes
- **X-Axis:** Discount rate (%)
- **Y-Axis Left:** LCOE (₹/kWh)
- **Y-Axis Right:** LCOE (₹/MWh)
- **What it shows:** How LCOE changes with different discount rates
- **Use case:** Understand financial sensitivity to WACC/discount assumptions

### 2. **Cost Breakdown: Doughnut Chart**
- **Components:** CAPEX, O&M (NPV), Loan Repayment (NPV)
- **What it shows:** Proportion of total project cost
- **Use case:** Understand cost drivers at a glance

### 3. **Energy Degradation: Bar Chart**
- **X-Axis:** Project year (1-25)
- **Y-Axis:** Annual energy generation (MWh)
- **What it shows:** Year-by-year energy output with 0.5% annual degradation
- **Use case:** Validate energy production assumptions

### 4. **Cash Flows: Combined Bar + Line Chart**
- **Bars:** Annual nominal cash flows (₹)
- **Line:** Present value of cash flows (₹)
- **What it shows:** OPEX and EMI flows over project life
- **Use case:** Understand when cash outflows occur

---

## 📁 Files & Structure

| File | Purpose |
|------|---------|
| **charts.js** | All chart generation logic |
| **ui.js** | Chart updates integrated with UI |
| **index.html** | Canvas elements + sensitivity controls |
| **styles.css** | Chart container styling |

---

## 🚀 Quick Start

### 1. **Automatic Chart Updates**
Charts auto-update every time you change an input:
```javascript
// When user changes "Discount Rate" input
// → UI.updateResults() called
// → UI.updateAllCharts() called
// → All 4 charts regenerated
```

### 2. **Manual Sensitivity Update**
Adjust sensitivity parameters and click "Update Sensitivity Chart":
```
Min Discount Rate: 5%
Max Discount Rate: 15%
Step Size: 0.5%
→ Chart shows LCOE at 21 different discount rates
```

### 3. **Export Charts**
Right-click any chart → "Save image as..." → Downloads PNG

---

## 🔧 API Reference

### Charts Module Functions

#### `Charts.plotSensitivityToDiscountRate(base_inputs, min_rate, max_rate, step)`
Generate sensitivity analysis chart.

**Parameters:**
- `base_inputs` (object): Current form inputs
- `min_rate` (number): Minimum discount rate (default: 5)
- `max_rate` (number): Maximum discount rate (default: 15)
- `step` (number): Increment between rates (default: 0.5)

**Example:**
```javascript
const inputs = UI.getInputs();
Charts.plotSensitivityToDiscountRate(inputs, 3, 20, 1);
```

---

#### `Charts.plotCostBreakdown(results)`
Display cost component pie chart.

**Parameters:**
- `results` (object): Results from `calculateLCOE()`

**Example:**
```javascript
Charts.plotCostBreakdown(UI.lastResults.results);
```

---

#### `Charts.plotEnergyDegradation(base_inputs, results)`
Show annual energy generation with degradation.

**Parameters:**
- `base_inputs` (object): Input parameters
- `results` (object): Calculation results

**Example:**
```javascript
Charts.plotEnergyDegradation(UI.getInputs(), UI.lastResults.results);
```

---

#### `Charts.plotCashFlows(cash_flows, discount_rate)`
Visualize annual OPEX and PV of cash flows.

**Parameters:**
- `cash_flows` (array): Annual cash flows from results
- `discount_rate` (number): Discount rate for PV calculation

**Example:**
```javascript
const { cash_flows, discount_rate } = UI.lastResults.inputs;
Charts.plotCashFlows(results.cash_flows, inputs.discount_rate);
```

---

#### `Charts.generateSensitivity2D(base_inputs, param1, param1_range, param2, param2_range)`
Create 2D sensitivity matrix.

**Parameters:**
- `base_inputs` (object): Base inputs
- `param1` (string): First parameter name (e.g., 'discount_rate')
- `param1_range` (array): Values for param1
- `param2` (string): Second parameter name
- `param2_range` (array): Values for param2

**Returns:**
- Object with `data` (2D array), `param1`, `param1_range`, `param2`, `param2_range`

**Example:**
```javascript
const sensitivity2D = Charts.generateSensitivity2D(
    inputs,
    'discount_rate',
    [5, 7.5, 10, 12.5, 15],
    'capex_per_mw',
    [40e6, 50e6, 60e6]
);
console.table(sensitivity2D.data);
```

---

#### `Charts.displaySensitivity2DTable(sensitivity2D)`
Render 2D sensitivity as heatmap table.

**Parameters:**
- `sensitivity2D` (object): Output from `generateSensitivity2D()`

**Returns:** HTML string with colored table

**Example:**
```javascript
const html = Charts.displaySensitivity2DTable(sensitivity2D);
document.getElementById('table-container').innerHTML = html;
```

---

### UI Integration Functions

#### `UI.updateSensitivityChart()`
Update sensitivity chart based on current controls.

**What it does:**
- Reads min/max/step from sensitivity controls
- Calls `Charts.plotSensitivityToDiscountRate()`

**Example:**
```javascript
UI.updateSensitivityChart(); // Called by "Update Chart" button
```

---

#### `UI.updateAllCharts()`
Regenerate all 4 charts with current data.

**What it does:**
1. Reads sensitivity control values
2. Calls all 4 chart functions
3. Wraps in try-catch to handle missing canvases

**Called automatically on:**
- Input change (if `UI.autoUpdateCharts` is true)
- Page load (initial display)

**Example:**
```javascript
// Manually refresh all charts
UI.updateAllCharts();

// Disable auto-update for performance
UI.autoUpdateCharts = false;
UI.updateResults(); // Now only updates results, not charts
```

---

## 📊 Chart Customization

### Change Chart Colors

Edit in `charts.js`:
```javascript
const Charts = {
    colors: {
        primary: '#667eea',      // Change to custom color
        secondary: '#764ba2',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        accent: '#2196f3'
    }
};
```

### Modify Chart Options

Edit `Charts.defaultOptions`:
```javascript
defaultOptions: {
    responsive: true,
    maintainAspectRatio: true,  // Set to false for square charts
    plugins: {
        legend: {
            position: 'top',  // Change to 'bottom' or 'right'
            // ...
        }
    }
}
```

### Customize Font Sizes

In individual chart functions, e.g., `plotSensitivityToDiscountRate()`:
```javascript
plugins: {
    title: {
        font: { size: 18, weight: 'bold' }  // Increase title size
    }
}
```

---

## 🎨 Advanced Usage

### Add a New Chart Type

**Step 1: Create function in `charts.js`**
```javascript
Charts.plotMyCustomChart = function(inputs, results) {
    const ctx = document.getElementById('chart-custom')?.getContext('2d');
    if (!ctx) return;

    if (Charts.charts.custom) Charts.charts.custom.destroy();

    Charts.charts.custom = new Chart(ctx, {
        type: 'scatter',  // or 'radar', 'bubble', etc.
        data: { /* ... */ },
        options: { /* ... */ }
    });
};
```

**Step 2: Add canvas to `index.html`**
```html
<div class="chart-container">
    <canvas id="chart-custom"></canvas>
</div>
```

**Step 3: Call from `ui.js`**
```javascript
UI.updateAllCharts = function() {
    // ... existing charts ...
    Charts.plotMyCustomChart(inputs, results);
};
```

---

### Create Tornado Chart (Parameter Sensitivity)

```javascript
Charts.plotTornadoChart = function(base_inputs, base_results) {
    const parameters = [
        { name: 'capex_per_mw', range: [-20, 20] },
        { name: 'discount_rate', range: [-2, 2] },
        { name: 'opex_percent', range: [-1, 1] }
    ];

    const impacts = [];

    for (const param of parameters) {
        const [min_delta, max_delta] = param.range;
        const base_value = base_inputs[param.name];

        // Calculate LCOE at min and max
        const inputs_low = { ...base_inputs, [param.name]: base_value + min_delta };
        const inputs_high = { ...base_inputs, [param.name]: base_value + max_delta };

        const lcoe_low = calculateLCOE(inputs_low).lcoe_kwh;
        const lcoe_high = calculateLCOE(inputs_high).lcoe_kwh;

        impacts.push({
            name: param.name,
            impact_low: lcoe_low - base_results.lcoe_kwh,
            impact_high: lcoe_high - base_results.lcoe_kwh
        });
    }

    // Plot as horizontal bar chart
    // impacts sorted by magnitude
};
```

---

### Scenario Comparison Chart

```javascript
// Store multiple scenarios
const scenarios = [
    {
        name: 'Base Case',
        results: calculateLCOE(UI.getInputs())
    },
    {
        name: 'Optimistic',
        results: calculateLCOE({
            ...UI.getInputs(),
            capex_per_mw: 45000000,
            discount_rate: 7
        })
    },
    {
        name: 'Conservative',
        results: calculateLCOE({
            ...UI.getInputs(),
            capex_per_mw: 55000000,
            discount_rate: 10
        })
    }
];

// Plot comparison
Charts.plotScenarioComparison(scenarios);
```

---

## 🐛 Debugging

### Check if Chart Rendered
```javascript
// In browser console:
console.log(Charts.charts.sensibilityDiscount);
// Should show Chart object, not null
```

### View Chart Data
```javascript
// Access chart data
const chartData = Charts.charts.sensibilityDiscount.data;
console.table(chartData);
```

### Test Chart Function Directly
```javascript
// Call chart function manually
Charts.plotCostBreakdown(UI.lastResults.results);
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Canvas not found | Verify canvas `id` matches in `index.html` |
| Chart not updating | Check `UI.autoUpdateCharts` flag |
| Old chart visible | Previous chart not destroyed; check `destroy()` call |
| Performance slow | Reduce sensitivity range or increase step size |

---

## 📈 Performance Considerations

### Auto-Update Performance
```javascript
// Disable auto-update for heavy calculations
UI.autoUpdateCharts = false;
// Change many inputs...
UI.updateAllCharts(); // Update once at end
UI.autoUpdateCharts = true;
```

### Large Sensitivity Ranges
```javascript
// Don't use:
Charts.plotSensitivityToDiscountRate(inputs, 0, 50, 0.1);  // 500 points!

// Better:
Charts.plotSensitivityToDiscountRate(inputs, 5, 15, 1);    // 11 points
```

---

## 🔌 Integration with Other Modules

### Example: Export Chart + Data
```javascript
function exportChartAndData() {
    // Download CSV with data
    UI.downloadCSV();
    
    // Alert user about manual chart download
    alert('Charts can be saved by right-clicking on them');
}
```

### Example: Use Chart Data for Further Analysis
```javascript
const sensitivity = generateSensitivityAnalysis(UI.getInputs(), 5, 15, 0.5);

// Find optimal discount rate
const optimal = sensitivity.reduce((min, curr) => 
    curr.lcoe_kwh < min.lcoe_kwh ? curr : min
);

console.log(`Optimal discount rate: ${optimal.rate}%`);
```

---

## 📚 Resources

- **Chart.js Documentation:** https://www.chartjs.org/docs/latest/
- **Chart.js CDN:** https://cdnjs.cloudflare.com/ajax/libs/Chart.js/
- **Color Tools:** https://chir.cat/projects/tinter (for heatmap colors)

---

## ✅ Checklist for Chart Implementation

- [ ] Chart.js library loaded from CDN
- [ ] Canvas elements added to HTML
- [ ] charts.js functions defined and tested
- [ ] UI functions calling chart functions
- [ ] Sensitivity controls added to HTML
- [ ] CSS styling applied
- [ ] Mobile responsiveness tested
- [ ] Charts update on input change
- [ ] Charts destroy old instances before creating new

---

**Happy charting! 📊🚀**