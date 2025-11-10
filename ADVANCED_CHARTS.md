# 🌪️ Advanced Charts Guide: Tornado Diagram & Dual Parameter Heatmap

## Overview

Two professional sensitivity analysis tools for making data-driven decisions:

1. **🌪️ Tornado Diagram** – Ranks parameters by their impact on LCOE
2. **🔥 Dual Parameter Heatmap** – Shows LCOE across two parameters simultaneously

---

## 🌪️ Tornado Diagram

### What It Shows

A horizontal bar chart showing how each parameter impacts LCOE when varied by ±20% (or custom %).

**Left side (GREEN)**: LCOE improvement when parameter decreases  
**Right side (RED)**: LCOE increase when parameter increases  
**Bar width**: Impact magnitude (wider = more sensitive)

### Why It Matters

- **Identifies risk drivers** – Which parameters need most attention?
- **Guides sensitivity** – Where should you invest in better data?
- **Investment priority** – Should you negotiate on CAPEX or focus on efficiency?

### Example Interpretation

```
CAPEX per MW:       |←———— ₹0.30 ————|←———— ₹0.35 ————| (±20% = ±₹0.33 impact)
Annual Energy:      |←— ₹0.25 —|←— ₹0.30 —| (±20% = ±₹0.27 impact)
Discount Rate:      |← ₹0.18 →|← ₹0.22 →| (±20% = ±₹0.20 impact)
```

**Conclusion**: CAPEX is the most critical parameter. A 20% cost reduction saves ₹0.30/kWh!

### How to Use

1. **See current sensitivity**: Default ±20% variance
2. **Adjust variance**: Change "±%" slider for custom sensitivity
3. **Click "Update"**: Recalculate rankings
4. **Read rankings**: Console shows sorted list

```javascript
// Console output example:
// 🌪️ Tornado Sensitivity Rankings:
// 1. CAPEX per MW: ±₹0.33/kWh range
// 2. Annual Energy: ±₹0.27/kWh range
// 3. Discount Rate: ±₹0.20/kWh range
// ...
```

### API Reference

#### `AdvancedCharts.plotTornado(base_inputs, variance_percent)`

**Parameters:**
- `base_inputs` (object): Current form inputs
- `variance_percent` (number): ±% to vary each parameter (default: 20)

**Example:**
```javascript
// Tornado with ±25% variance
AdvancedCharts.plotTornado(UI.getInputs(), 25);
```

**What it calculates:**
1. Base LCOE from current inputs
2. For each parameter:
   - Calculate LCOE at value - (value × variance%)
   - Calculate LCOE at value + (value × variance%)
   - Record impact on LCOE
3. Sort by impact magnitude
4. Display as horizontal bar chart

---

## 🔥 Dual Parameter Heatmap

### What It Shows

A 2D grid showing LCOE values for all combinations of two parameters.

**Colors:**
- 🟢 **Green**: Low LCOE (better/cheaper)
- 🟡 **Yellow**: Mid LCOE (acceptable)
- 🔴 **Red**: High LCOE (worse/expensive)

### Why It Matters

- **Find sweet spots** – Which combinations work best?
- **Explore tradeoffs** – Lower CAPEX vs higher discount rate?
- **Risk assessment** – What if multiple parameters shift?
- **Investment decisions** – Can we afford a ±10% change in both?

### Example: CAPEX vs Discount Rate

```
Discount Rate: 5%      8%      11%     14%
────────────────────────────────────────────
CAPEX: ₹40M   🟢 ₹0.8  🟢 ₹0.9  🟡 ₹1.0  🔴 ₹1.2
CAPEX: ₹50M   🟡 ₹1.0  🟡 ₹1.1  🟡 ₹1.2  🔴 ₹1.4
CAPEX: ₹60M   🟡 ₹1.2  🟡 ₹1.3  🔴 ₹1.5  🔴 ₹1.6
```

**Insight**: Project is viable (🟢/🟡) if CAPEX ≤ ₹50M OR discount rate ≤ 11%

### Two Views

#### 1. **Bubble Chart** (Interactive)
- Click points to see exact LCOE values
- Zoom to explore clusters
- Professional, easy to share

#### 2. **HTML Table** (Detailed)
- Exact values with 3 decimals
- Better for precision analysis
- Easy copy-paste to Excel

### How to Use

1. **Select parameters**: Choose 2 different parameters to compare
2. **Click "Generate Heatmap"**: Computes 25 scenarios (5×5 grid)
3. **Interpret colors**: Green = good, Red = bad
4. **Check table**: See exact LCOE values
5. **Hover on chart**: Shows coordinates and LCOE

### Available Parameter Ranges

```javascript
capex_per_mw:        [₹30M, ₹40M, ₹50M, ₹60M, ₹70M]
energy_generation:   [1000, 1300, 1700, 2100, 2500] MWh
discount_rate:       [5%, 7%, 9%, 11%, 13%]
opex_percent:        [1%, 1.5%, 2.0%, 2.5%, 3.0%]
interest_rate:       [7%, 8%, 9%, 10%, 11%]
```

### API Reference

#### `AdvancedCharts.plotDualParameterHeatmap(...)`

**Parameters:**
```javascript
AdvancedCharts.plotDualParameterHeatmap(
    base_inputs,              // Current form inputs
    param1_key,               // e.g., 'capex_per_mw'
    param1_label,             // e.g., 'CAPEX per MW (₹)'
    param1_range,             // e.g., [30e6, 40e6, ..., 70e6]
    param2_key,               // e.g., 'discount_rate'
    param2_label,             // e.g., 'Discount Rate (%)'
    param2_range              // e.g., [5, 7, 9, 11, 13]
)
```

**Example:**
```javascript
AdvancedCharts.plotDualParameterHeatmap(
    UI.getInputs(),
    'capex_per_mw',
    'CAPEX per MW (₹)',
    [30e6, 40e6, 50e6, 60e6, 70e6],
    'discount_rate',
    'Discount Rate (%)',
    [5, 7, 9, 11, 13]
);
```

#### `AdvancedCharts.displayHeatmapTable(...)`

Returns HTML table with exact LCOE values and color-coded cells.

**Returns:** HTML string ready to insert into DOM

**Example:**
```javascript
const html = AdvancedCharts.displayHeatmapTable(
    UI.getInputs(),
    'capex_per_mw',
    'CAPEX per MW (₹)',
    [30e6, 40e6, 50e6, 60e6, 70e6],
    'discount_rate',
    'Discount Rate (%)',
    [5, 7, 9, 11, 13]
);

document.getElementById('heatmap-table-container').innerHTML = html;
```

---

## 📊 Real-World Usage Scenarios

### Scenario 1: "What if CAPEX increases?"

**Setup:**
- First parameter: CAPEX per MW
- Second parameter: Discount Rate
- **Interpretation**: Find minimum discount rate needed to keep LCOE viable at higher CAPEX

**Decision**: "If CAPEX goes ±10%, what discount rate can we afford?"

---

### Scenario 2: "Energy vs Finance Tradeoff"

**Setup:**
- First parameter: Annual Energy (MWh)
- Second parameter: Discount Rate (%)
- **Interpretation**: Can efficiency gains offset higher borrowing costs?

**Decision**: "Should we invest in better panels or negotiate lower interest?"

---

### Scenario 3: "CAPEX vs Operations"

**Setup:**
- First parameter: CAPEX per MW
- Second parameter: OPEX % of CAPEX
- **Interpretation**: Cheap equipment + high maintenance vs premium equipment + low maintenance

**Decision**: "Invest in quality equipment upfront or save on CAPEX?"

---

### Scenario 4: "Debt Management"

**Setup:**
- First parameter: Interest Rate (%)
- Second parameter: Loan Tenure (Years)
- **Interpretation**: Impact of financing terms on project economics

**Decision**: "Is a longer tenure loan worth the interest cost?"

---

## 🎨 Customization

### Modify Parameter Ranges

Edit in `index.html` → `heatmap_config` or directly in `ui.js`:

```javascript
const param_config = {
    capex_per_mw: {
        label: 'CAPEX per MW (₹)',
        range: [30e6, 40e6, 50e6, 60e6, 70e6]  // Add more values
    },
    // ... other parameters ...
};
```

### Change Color Scheme

Edit in `advanced-charts.js`:

```javascript
AdvancedCharts.colors = {
    increase: '#ef5350',    // Red
    decrease: '#66bb6a',    // Green
    neutral: '#42a5f5'      // Blue
};
```

### Add Custom Parameter

In `advanced-charts.js` + `ui.js`:

```javascript
// 1. Define in param_config
salvage_value: {
    label: 'Salvage Value (%)',
    range: [0, 5, 10, 15, 20]
}

// 2. Add to select dropdown in index.html
<option value="salvage_value">Salvage Value (%)</option>

// 3. Update calculateLCOE() if needed
```

---

## 🐛 Debugging

### Check Tornado Output

```javascript
// In browser console:
AdvancedCharts.plotTornado(UI.getInputs(), 20);
// Check console logs for sensitivity rankings
```

### Verify Heatmap Data

```javascript
// Generate heatmap data and inspect
const result = AdvancedCharts.generateSensitivity2D(
    UI.getInputs(),
    'capex_per_mw',
    [30e6, 40e6, 50e6, 60e6, 70e6],
    'discount_rate',
    [5, 7, 9, 11, 13]
);
console.table(result.data);  // View 2D array
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Chart not rendering | Verify canvas IDs in HTML match function calls |
| Wrong color scale | Check heatmap color calculation (hue 0-120 = red-green) |
| Slow heatmap | Reduce number of points in range |
| Missing parameter | Add to dropdown + param_config object |

---

## 📈 Decision Framework

### Using Tornado to Set Priorities

**High Impact (bar width > ₹0.25/kWh):**
- Negotiate aggressively on this parameter
- Invest in better modeling/forecasting
- Include in risk management plan

**Medium Impact (₹0.10-0.25/kWh):**
- Standard commercial terms acceptable
- Sensitivity analysis important
- Monitor during execution

**Low Impact (< ₹0.10/kWh):**
- Not a deal-breaker
- Use market standard terms
- Brief mention in risk section

---

### Using Heatmap for Investment Decisions

**Green Zone** (LCOE < threshold):
- ✅ Project is bankable
- Can move to financing/construction

**Yellow Zone** (LCOE = marginal):
- ⚠️ Renegotiate terms
- Invest in efficiency improvements
- Consider alternative financing

**Red Zone** (LCOE > threshold):
- ❌ Project not viable
- High risk of cost overruns
- Recommend not to proceed

---

## 💡 Tips & Tricks

### Tip 1: Create a "Risk Dashboard"
Export both charts for a decision memo:
- Tornado shows "what could go wrong"
- Heatmap shows "how bad could it get"

### Tip 2: Benchmark Against Grid Price
Mark grid electricity price on tornado/heatmap:
- "Project is viable if LCOE < Grid Price"
- Visual assessment of margin

### Tip 3: Scenario Planning
Run three versions:
- **Optimistic**: Lower ranges
- **Base Case**: Current ranges
- **Pessimistic**: Higher ranges

Compare tornado rankings across scenarios.

### Tip 4: Parameter Correlation
If parameters are correlated (e.g., CAPEX↑ → quality↑ → efficiency↑):
- Run heatmap with both
- Shows net effect on LCOE
- Better than independent sensitivity

---

## 🔌 Integration Examples

### Export Charts to PDF

```javascript
// Install html2pdf: npm install html2pdf.js
// Then:
function exportAdvancedCharts() {
    const element = document.querySelector('.charts-section');
    html2pdf().set({ margin: 10 }).fromElement(element).save('LCOE_Analysis.pdf');
}
```

### Compare With Energy Price

```javascript
UI.updateTornadoChart = function() {
    // ... existing code ...
    
    // Add price benchmark line
    const grid_price = 5.50; // ₹/kWh
    const chart = AdvancedCharts.charts.tornado;
    chart.options.plugins.annotation = {
        annotations: {
            grid_price: {
                type: 'line',
                xMin: grid_price,
                xMax: grid_price,
                borderColor: 'black',
                borderWidth: 2
            }
        }
    };
};
```

### Auto-Generate Report

```javascript
function generateReport() {
    // 1. Get current LCOE
    // 2. Run tornado (±20%)
    // 3. Run heatmap (CAPEX vs Discount)
    // 4. Create summary table
    // 5. Export to CSV/PDF
}
```

---

## 📚 Further Reading

- **Sensitivity Analysis**: https://en.wikipedia.org/wiki/Sensitivity_analysis
- **Tornado Diagrams**: https://www.investopedia.com/terms/t/tornado-chart.asp
- **Levelized Cost of Energy**: https://www.irena.org/

---

**Master these two charts and you'll make better energy investment decisions! 🚀**