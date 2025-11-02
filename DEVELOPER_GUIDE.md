# 🔧 Developer Quick Reference Guide

## 📊 Adding a New Input Field (Step-by-Step)

### Example: Add "WACC (Weighted Average Cost of Capital)" input

**Step 1: Add HTML element** (`index.html`)
```html
<div class="input-group">
    <label>
        WACC (%)
        <span class="tooltip-icon" data-tooltip="Weighted average cost of capital">?</span>
    </label>
    <input type="number" id="wacc" value="8.0" step="0.1" min="0">
</div>
```

**Step 2: Register in UI module** (`ui.js`)
```javascript
// Add to UI.inputIds array:
UI.inputIds = [
    'capacity',
    'energy_generation',
    // ... existing fields ...
    'wacc'  // NEW
];

// Add to UI.defaults object:
UI.defaults = {
    // ... existing defaults ...
    wacc: 8.0  // NEW
};
```

**Step 3: Add calculation logic** (`calculator.js`)
```javascript
// Add parameter to calculateLCOE function:
function calculateLCOE(inputs) {
    const { wacc, /* ... other params ... */ } = inputs;
    
    // Use WACC in NPV calculation instead of discount_rate
    const npv_opex = calculateNPV(wacc, cash_flows);
    
    // ... rest of calculation ...
}
```

**Step 4: Update UI display** (`ui.js`)
```javascript
// In UI.updateResults(), add:
document.getElementById('wacc_display').textContent = 
    inputs.wacc.toFixed(1) + '%';
```

**Step 5: Test**
- Open browser, new input should appear
- Should auto-update on input change
- Should export to CSV

---

## 🧮 Adding a New Calculation (Detailed Example)

### Example: Add "Salvage Value" calculation

**Step 1: Add calculation function** (`calculator.js`)
```javascript
/**
 * Calculate salvage value at end of project life
 * Assumes residual value as % of initial CAPEX
 * 
 * @param {number} capex - Original CAPEX (₹)
 * @param {number} residual_percent - Residual value (%)
 * @param {number} discount_rate - For present value calculation (%)
 * @param {number} project_lifetime - Years
 * @returns {number} Present value of salvage (₹)
 */
function calculateSalvageValue(capex, residual_percent, discount_rate, project_lifetime) {
    const residual_value = capex * (residual_percent / 100);
    const pv = residual_value / Math.pow(1 + discount_rate / 100, project_lifetime);
    return pv;
}
```

**Step 2: Call from main calculator** (`calculator.js`)
```javascript
function calculateLCOE(inputs) {
    // ... existing code ...
    
    // NEW: Calculate salvage value
    const salvage_pv = calculateSalvageValue(
        capex,
        inputs.residual_percent,
        discount_rate,
        project_lifetime
    );
    
    // Adjust NPV by subtracting salvage value benefit
    const npv_opex_adjusted = npv_opex - salvage_pv;
    
    // Recalculate LCOE with salvage benefit
    const lcoe_mwh_with_salvage = (capex + npv_opex_adjusted) / total_energy;
    
    // Return adjusted results
    return {
        // ... existing returns ...
        salvage_value: residual_value,
        salvage_pv: salvage_pv,
        lcoe_mwh_with_salvage: lcoe_mwh_with_salvage,
        lcoe_kwh_with_salvage: lcoe_mwh_with_salvage / 1000
    };
}
```

**Step 3: Add UI elements** (`index.html`)
```html
<div class="input-group">
    <label>
        Residual Value (% of CAPEX)
        <span class="tooltip-icon" data-tooltip="Equipment worth at end of project">?</span>
    </label>
    <input type="number" id="residual_percent" value="5.0" step="0.5" min="0" max="100">
</div>

<!-- Add to results table: -->
<tr>
    <td class="label">Salvage Value Present Value (₹)</td>
    <td class="value" id="breakdown-salvage">0.00</td>
</tr>
```

**Step 4: Register and display** (`ui.js`)
```javascript
// Register new input
UI.inputIds.push('residual_percent');
UI.defaults.residual_percent = 5.0;

// Register new output
UI.outputIds.salvage_pv = 'breakdown-salvage';

// Update display in UI.updateResults():
document.getElementById(UI.outputIds.salvage_pv).textContent = 
    UI.formatIndianCurrency(results.salvage_pv);
```

---

## 💾 Adding CSV Export Fields

In `ui.js`, modify `generateCSVContent()`:

```javascript
UI.generateCSVContent = function() {
    if (!UI.lastResults) return null;
    const { inputs, results } = UI.lastResults;
    
    let csv = 'Solar LCOE Calculator - Export Report\n';
    // ... existing header ...
    
    // Add new section:
    csv += '=== SALVAGE VALUE ANALYSIS ===\n';
    csv += `Residual Value (%),${inputs.residual_percent}\n`;
    csv += `Salvage Value (₹),${results.salvage_value.toFixed(2)}\n`;
    csv += `Salvage Value PV (₹),${results.salvage_pv.toFixed(2)}\n`;
    csv += `LCOE with Salvage (₹/MWh),${results.lcoe_mwh_with_salvage.toFixed(2)}\n\n`;
    
    return csv;
};
```

---

## 🎨 Styling New Elements

### Add a new colored section in `styles.css`:

```css
/* Add to styles.css */
.section-salvage {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 12px;
    border-radius: 4px;
    margin-top: 12px;
}

.section-salvage h4 {
    color: #856404;
    margin-bottom: 8px;
}
```

Use in HTML:
```html
<div class="section-salvage">
    <h4>💰 Salvage Value</h4>
    <p>Equipment residual value: ₹1,234,567</p>
</div>
```

---

## 🔄 Sensitivity Analysis Integration

Add to `calculator.js`:

```javascript
/**
 * Generate 2D sensitivity table (e.g., LCOE vs Discount Rate vs CAPEX)
 */
function generateSensitivity2D(base_inputs, param1_name, param1_values, param2_name, param2_values) {
    const results = [];
    
    for (let val1 of param1_values) {
        const row = [];
        for (let val2 of param2_values) {
            const inputs = {
                ...base_inputs,
                [param1_name]: val1,
                [param2_name]: val2
            };
            const calc = calculateLCOE(inputs);
            row.push(calc.lcoe_kwh);
        }
        results.push(row);
    }
    
    return {
        data: results,
        param1: param1_name,
        param1_values: param1_values,
        param2: param2_name,
        param2_values: param2_values
    };
}
```

Call from `ui.js`:
```javascript
UI.showSensitivityTable = function() {
    const inputs = UI.getInputs();
    const sensitivity = generateSensitivity2D(
        inputs,
        'discount_rate',
        [5, 7.5, 10, 12.5, 15],
        'capex_per_mw',
        [40000000, 50000000, 60000000]
    );
    console.table(sensitivity.data);
};
```

---

## 📈 Chart.js Integration Example

Create `charts.js`:

```javascript
const Charts = {
    sensitivityChart: null
};

/**
 * Display LCOE vs Discount Rate chart
 */
Charts.plotLCOESensitivity = function(base_inputs) {
    const sensitivity = generateSensitivityAnalysis(base_inputs, 5, 15, 0.5);
    
    const ctx = document.getElementById('sensitivity-chart').getContext('2d');
    
    Charts.sensitivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sensitivity.map(s => s.rate.toFixed(1) + '%'),
            datasets: [{
                label: 'LCOE (₹/kWh)',
                data: sensitivity.map(s => s.lcoe_kwh.toFixed(2)),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'LCOE Sensitivity to Discount Rate'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'LCOE (₹/kWh)'
                    }
                }
            }
        }
    });
};
```

Add to `index.html`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
<canvas id="sensitivity-chart" style="margin-top: 20px;"></canvas>

<script src="charts.js"></script>
<!-- Call in ui.js: Charts.plotLCOESensitivity(UI.getInputs()); -->
```

---

## 🚀 Converting to Vue.js Component

Create `LcoeCalculator.vue`:

```vue
<template>
  <div class="lcoe-calculator">
    <div class="input-panel">
      <input v-model.number="inputs.capacity" @input="calculate" placeholder="Capacity (MW)">
      <input v-model.number="inputs.energy_generation" @input="calculate" placeholder="Energy (MWh)">
      <!-- ... more inputs ... -->
    </div>
    
    <div class="results-panel">
      <h3>LCOE: {{ formatCurrency(results.lcoe_kwh) }}/kWh</h3>
      <table>
        <tr>
          <td>CAPEX</td>
          <td>{{ formatCurrency(results.capex) }}</td>
        </tr>
        <!-- ... more results ... -->
      </table>
    </div>
  </div>
</template>

<script>
import { calculateLCOE } from './calculator.js';

export default {
  data() {
    return {
      inputs: {
        capacity: 1.0,
        energy_generation: 1700,
        capex_per_mw: 50000000,
        // ... other fields ...
      },
      results: {}
    };
  },
  methods: {
    calculate() {
      this.results = calculateLCOE(this.inputs);
    },
    formatCurrency(num) {
      return '₹' + num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  },
  mounted() {
    this.calculate();
  }
};
</script>
```

---

## 🔌 Flask Backend Integration

Create `app.py`:

```python
from flask import Flask, request, jsonify
from calculator import calculate_lcoe

app = Flask(__name__)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    results = calculate_lcoe(
        capacity=data['capacity'],
        energy_generation=data['energy_generation'],
        capex_per_mw=data['capex_per_mw'],
        opex_percent=data['opex_percent'],
        interest_rate=data['interest_rate'],
        loan_tenure=data['loan_tenure'],
        project_lifetime=data['project_lifetime'],
        discount_rate=data['discount_rate']
    )
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
```

Modify `ui.js`:

```javascript
UI.updateResults = async function() {
    const inputs = UI.getInputs();
    
    // Call backend instead of local function
    const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
    });
    
    const results = await response.json();
    UI.lastResults = { inputs, results };
    
    // Update DOM as before...
};
```

---

## 🧪 Debugging Checklist

- [ ] Open DevTools (F12)
- [ ] Check **Console** for errors
- [ ] Type `Solar.UI.lastResults` to see cached data
- [ ] Type `UI.getInputs()` to verify form values
- [ ] Type `calculateLCOE(UI.getInputs())` to test calculation
- [ ] Check **Network** tab if using backend
- [ ] Verify element IDs match between HTML and JS

---

## 📋 Common Patterns

### Pattern 1: Add optional feature flag
```javascript
const FEATURES = {
    enable_salvage_value: true,
    enable_tax_benefits: false,
    enable_sensitivity_charts: true
};

function calculateLCOE(inputs) {
    // ... existing code ...
    if (FEATURES.enable_salvage_value) {
        // Include salvage value logic
    }
}
```

### Pattern 2: Add validation
```javascript
function validateInputs(inputs) {
    if (inputs.capacity <= 0) throw new Error('Capacity must be > 0');
    if (inputs.project_lifetime <= inputs.loan_tenure) 
        throw new Error('Project life must be > loan tenure');
    return true;
}

// In calculateLCOE:
if (!validateInputs(inputs)) return null;
```

### Pattern 3: Add caching
```javascript
const calculationCache = new Map();

function calculateLCOECached(inputs) {
    const key = JSON.stringify(inputs);
    if (calculationCache.has(key)) {
        return calculationCache.get(key);
    }
    const result = calculateLCOE(inputs);
    calculationCache.set(key, result);
    return result;
}
```

---

**Happy coding! 🚀**