# 📊 Parameter Range Analysis Guide

## Overview

Parameter Range Analysis shows **how LCOE changes across realistic parameter ranges**. Instead of showing sensitivity at one point (like ±20%), it plots the full curve showing LCOE at every value between min and max.

---

## 📈 What You Get

### **1. Combined Parameters Chart**
Shows 3 key parameters on the same chart for quick comparison:
- **X-axis**: Range progression (Min → Max)
- **Y-axis**: LCOE (₹/kWh)
- **3 lines**: CAPEX, Energy, Discount Rate

**Use case**: "Which parameter has the steepest impact on LCOE?"

---

### **2. Individual Parameter Charts**
Three detailed charts showing each parameter separately:

#### **💰 CAPEX per MW Range**
- X-axis: ₹30M to ₹70M
- Shows: How LCOE increases with capital costs
- **Key insight**: Linear relationship (higher CAPEX = higher LCOE)

#### **⚡ Annual Energy Generation Range**
- X-axis: 1,200 to 2,600 MWh/year
- Shows: Inverse relationship (higher energy = lower LCOE)
- **Key insight**: Non-linear, steeper at lower energy values

#### **📊 Discount Rate Range**
- X-axis: 4% to 16%
- Shows: How financing costs impact LCOE
- **Key insight**: Exponential impact at high discount rates

---

### **3. Range Summary Table**
Quick reference table with:
- **Min Value**: LCOE at minimum parameter value
- **Current Value**: LCOE at your current input
- **Max Value**: LCOE at maximum parameter value
- **LCOE Range**: Total swing in ₹ and %

---

## 🎯 How to Use

### **Step 1: Understand Individual Parameters**
Look at each parameter chart:
- **Steep curve** = Parameter is critical
- **Flat curve** = Parameter has little impact
- **Linear curve** = Predictable changes
- **Curved line** = Non-linear sensitivity

### **Step 2: Compare Parameters**
Use the Combined chart to see which parameter matters most.

**Example**: If CAPEX curve is much steeper than others → Focus on cost negotiation

### **Step 3: Check Your Position**
In the Summary table, find your current LCOE and how much it could change:
- "My LCOE is ₹1.5, but could be ₹1.1 to ₹1.9" → High uncertainty
- "My LCOE is ₹1.5, could be ₹1.4 to ₹1.6" → Low risk

### **Step 4: Make Decisions**
- **Wide range?** → Negotiate better terms or gather more data
- **Narrow range?** → Project is stable, move forward
- **Bad at current value?** → Parameters need improvement before financing

---

## 📐 Parameter Ranges Used

| Parameter | Min | Max | Step |
|-----------|-----|-----|------|
| CAPEX per MW | ₹30M | ₹70M | ₹10M |
| Annual Energy | 1,200 MWh | 2,600 MWh | 200 MWh |
| Discount Rate | 4% | 16% | 1% |
| OPEX % | 1% | 3% | 0.5% |
| Interest Rate | 7% | 12% | 1% |

---

## 💡 Interpretation Examples

### **Example 1: CAPEX Range Analysis**

```
CAPEX: ₹30M → LCOE: ₹1.1/kWh (optimal)
CAPEX: ₹50M → LCOE: ₹1.5/kWh (current)
CAPEX: ₹70M → LCOE: ₹2.0/kWh (worst case)

Range: ₹0.9/kWh (82% impact!)
```

**Decision**: 
- ✅ If you can negotiate ₹40M → LCOE drops to ₹1.25 (save ₹0.25/kWh)
- ❌ Don't accept >₹60M (LCOE crosses viability threshold)

---

### **Example 2: Energy Generation Range**

```
Energy: 1,200 MWh/year → LCOE: ₹2.3/kWh (risky)
Energy: 1,700 MWh/year → LCOE: ₹1.5/kWh (current)
Energy: 2,400 MWh/year → LCOE: ₹1.1/kWh (optimal)

Range: ₹1.2/kWh (109% impact!)
```

**Decision**:
- ⚠️ Energy estimates are critical (biggest impact!)
- 📊 Invest in better solar resource assessment
- 🎯 Project IRR highly sensitive to actual generation

---

### **Example 3: Discount Rate Range**

```
Discount Rate: 4% → LCOE: ₹1.2/kWh (best financing)
Discount Rate: 8% → LCOE: ₹1.5/kWh (current)
Discount Rate: 12% → LCOE: ₹1.8/kWh (expensive money)

Range: ₹0.6/kWh (40% impact)
```

**Decision**:
- 💰 Every 1% increase in discount rate = +₹0.15/kWh impact
- 🏦 Negotiate hardest for lower interest rates
- 📈 Current cost of debt is reasonable if <10%

---

## 🔄 Use Cases

### **Use Case 1: Bid Evaluation**
Compare across all suppliers:
- Supplier A: CAPEX ₹40M
- Supplier B: CAPEX ₹45M
- Supplier C: CAPEX ₹50M

Range chart shows exact LCOE impact of each choice.

---

### **Use Case 2: Financing Strategy**
Compare debt options:
- Option 1: 8% for 10 years
- Option 2: 9% for 15 years
- Option 3: 10% for 12 years

Use discount rate range chart to compare impact.

---

### **Use Case 3: Feasibility Assessment**
- "Can we build at ₹1.5/kWh?"
- "What if energy production is 10% lower?"
- "How sensitive is project to interest rate changes?"

Range analysis answers all these instantly.

---

### **Use Case 4: Risk Management**
- Identify which parameters need monitoring (steep curves)
- Set acceptable ranges for each parameter
- Create contingency plans if ranges widen

---

## 📊 Reading the Summary Table

```
Parameter           Min     LCOE@Min   Current  LCOE@Current   Max     LCOE@Max   Range
─────────────────────────────────────────────────────────────────────────────────────────
CAPEX per MW        ₹30M    ₹1.1       ₹50M     ₹1.5           ₹70M    ₹2.0      ₹0.90 (82%)
Annual Energy       1200    ₹2.3       1700     ₹1.5           2400    ₹1.1      ₹1.20 (109%)
Discount Rate       5%      ₹1.2       8%       ₹1.5           15%     ₹1.8      ₹0.60 (40%)
OPEX %              1%      ₹1.45      2%       ₹1.50          3%      ₹1.55     ₹0.10 (7%)
Interest Rate       7%      ₹1.48      10%      ₹1.50          12%     ₹1.52     ₹0.04 (3%)
```

**Ranking by Impact:**
1. **Annual Energy** (109%) – Most critical!
2. **CAPEX per MW** (82%) – Second priority
3. **Discount Rate** (40%) – Moderate importance
4. **OPEX %** (7%) – Minor impact
5. **Interest Rate** (3%) – Least important

---

## 🎨 Chart Interpretation Tips

### **Steep Curve = High Sensitivity**
Parameter changes significantly affect LCOE
→ Needs careful attention and monitoring

### **Flat Curve = Low Sensitivity**
Parameter changes barely affect LCOE
→ Use market standard terms, don't negotiate hard

### **Linear Curve = Predictable**
Equal parameter changes = equal LCOE changes
→ Easy to model and forecast

### **Exponential/Curved = Non-linear**
Small changes at extremes have huge impact
→ Avoid extreme values

---

## 🔧 API Reference

### `RangeCharts.plotCapexRange(base_inputs)`
Plot CAPEX parameter range (₹30M to ₹70M)

### `RangeCharts.plotEnergyRange(base_inputs)`
Plot Annual Energy range (1,200 to 2,600 MWh)

### `RangeCharts.plotDiscountRange(base_inputs)`
Plot Discount Rate range (4% to 16%)

### `RangeCharts.plotAllParametersCombo(base_inputs)`
Plot all three parameters on same chart

### `RangeCharts.generateRangeSummaryTable(base_inputs)`
Generate HTML table with min/current/max analysis

**Returns:** HTML string ready to insert into DOM

### `RangeCharts.generateParameterRange(base_inputs, param_key, param_range)`
Get LCOE values for custom parameter range

**Parameters:**
- `base_inputs`: Current form inputs
- `param_key`: Parameter to vary (e.g., 'capex_per_mw')
- `param_range`: Array of values to test

**Returns:** Array of {value, lcoe_kwh, lcoe_mwh} objects

---

## 💾 Exporting Data

### Export to Excel
1. Right-click summary table
2. "Copy table"
3. Paste into Excel
4. Add your analysis/comments

### Create a Report
Combine charts + table:
1. Screenshot each chart
2. Export summary table to CSV
3. Create PowerPoint/PDF presentation
4. Add business commentary

---

## 🚀 Advanced Usage

### Customizing Ranges

Edit in `range-charts.js`:

```javascript
// Change CAPEX range
const capex_range = [25e6, 30e6, 35e6, 40e6, 45e6];  // Custom min/max/step

// Add more data points for smoother curves
const energy_range = [1200, 1300, 1400, ..., 2600];  // Finer granularity
```

### Creating Custom Parameter Range

```javascript
// Add new parameter to summary table
{
    name: 'Salvage Value (%)',
    key: 'salvage_value',
    min: 0,
    max: 20,
    current: base_inputs.salvage_value
}
```

### Comparing Multiple Scenarios

```javascript
// Store range analysis for different scenarios
const scenario_base = RangeCharts.generateRangeSummaryTable(inputs_base);
const scenario_optimistic = RangeCharts.generateRangeSummaryTable(inputs_optimistic);

// Compare: How much does each scenario improve?
```

---

## 🐛 Debugging

### Check Individual Chart Data

```javascript
// In browser console:
const data = RangeCharts.generateParameterRange(
    UI.getInputs(), 
    'capex_per_mw', 
    [30e6, 40e6, 50e6, 60e6, 70e6]
);
console.table(data);
```

### Verify Summary Table

```javascript
const html = RangeCharts.generateRangeSummaryTable(UI.getInputs());
console.log(html);  // View HTML in console
```

---

## 📚 Decision Framework

**After reviewing range analysis, ask yourself:**

1. ✅ **Is my project in the green zone?** (LCOE < grid price)
2. ⚠️ **How wide is my LCOE range?** (Stability/risk)
3. 📊 **Which parameters have biggest impact?** (Focus areas)
4. 💰 **Can I improve critical parameters?** (Mitigation options)
5. 🎯 **What's my contingency plan if ranges widen?** (Risk management)

---

**Master these ranges and you'll make smarter project decisions! 📈**