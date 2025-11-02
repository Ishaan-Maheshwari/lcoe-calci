# ☀️ Solar LCOE Calculator - Modular Architecture

## 📁 Project Structure

```
solar-lcoe-calculator/
├── index.html          # HTML structure and layout
├── styles.css          # All styling and responsive design
├── calculator.js       # Core LCOE calculation logic
├── ui.js              # UI management and event handling
└── README.md          # This file
```

---

## 📄 File Descriptions

### **1. index.html**
**Purpose:** Define the DOM structure and page layout

**Contains:**
- Header with title and description
- Two-panel layout (left: inputs, right: results)
- All input form fields with IDs for JS targeting
- Result cards and breakdown table
- Script imports for `calculator.js` and `ui.js`

**Key Design Decisions:**
- Minimal styling attributes (all in CSS)
- Element IDs used for JavaScript targeting
- Semantic HTML structure
- Tooltip icons with `data-tooltip` attributes
- Buttons with `onclick` handlers (can be migrated to event listeners in `ui.js` if preferred)

**To Modify:**
- Change input fields, labels, or form layout here
- Add new input sections by copying `.input-group` divs
- Update result cards or add new display areas
- New elements must have unique `id` attributes for JS to reference

---

### **2. styles.css**
**Purpose:** Manage all visual styling and responsive design

**Sections:**
- **Global Styles:** Reset, fonts, body styling
- **Layout:** Container, grid, flexbox structure
- **Input Styles:** Form elements, focus states, tooltips
- **Result Cards & Tables:** Display formatting
- **Buttons & Sections:** Interactive elements
- **Responsive Design:** Media queries for mobile/tablet

**Key Features:**
- Color scheme: Purple gradient (#667eea, #764ba2)
- Responsive grid that switches to single column on tablets
- Hover effects and transitions
- Indian currency formatting styling
- Tooltip positioning with `:hover::after`

**To Modify:**
- Change colors: Update hex values in color properties
- Adjust spacing: Modify `gap`, `padding`, `margin` values
- Add animations: Create new `@keyframes` rules
- Responsive breakpoints: Edit `@media` queries
- Font sizes: Adjust `font-size` properties globally

---

### **3. calculator.js**
**Purpose:** Pure calculation logic (NO UI interaction)

**Key Functions:**
- `calculateCAPEX(capacity, capex_per_mw)` → Total CAPEX
- `calculateEMI(principal, annual_rate, years)` → Annual loan repayment
- `calculateTotalOM(annual_opex, years)` → Total O&M with escalation
- `calculateTotalEnergy(annual_energy, years)` → Total energy with degradation
- `calculateNPV(discount_rate, cash_flows)` → Net present value
- `calculateCUE(annual_energy, capacity)` → Capacity utilization
- `calculateLCOE(inputs)` → Main orchestrator function
- `generateSensitivityAnalysis(base_inputs, min, max, step)` → Sensitivity curves

**Module Characteristics:**
- **No DOM dependencies** – Can run standalone or in Node.js
- **Pure functions** – Same inputs always produce same outputs
- **Well documented** – Each function has JSDoc comments
- **Extensible** – Easy to add new calculations
- **CONSTANTS object** – Centralized tuning of parameters

**To Extend:**
1. Add new calculation function following the same pattern
2. Add constants to `CONSTANTS` object
3. Call new function from `calculateLCOE()` if needed
4. Return new value in results object
5. Update `ui.js` to display the result

---

### **4. ui.js**
**Purpose:** Handle all UI updates and event management

**Key Components:**

#### **UI Namespace Object**
```javascript
const UI = {
    lastResults: null,        // Cache for CSV export
    inputIds: [...]           // Array of form field IDs
    outputIds: {...}          // Mapping of output element IDs
    defaults: {...}           // Default values for reset
}
```

#### **Main Functions**
- `getInputs()` → Extract form values
- `updateResults()` → Recalculate and update all UI elements
- `resetForm()` → Reset to defaults
- `formatIndianCurrency(num)` → Format with ₹ and commas
- `formatNumber(num)` → Format with commas
- `formatPercent(value, decimals)` → Format as percentage
- `generateCSVContent()` → Build CSV string
- `downloadCSV()` → Trigger CSV download
- `initializeEventListeners()` → Set up all listeners
- `initializeApp()` → Run on page load

**Event Flow:**
1. User types in input field
2. `input` event triggered
3. `UI.updateResults()` called
4. `calculateLCOE()` executes (from calculator.js)
5. Results object returned
6. DOM elements updated with formatted values
7. Results cached for export

**To Extend:**
1. Add new input field ID to `UI.inputIds`
2. Add output element ID to `UI.outputIds`
3. Update `UI.updateResults()` to display new value
4. New listeners automatically added in `initializeEventListeners()`

---

## 🔄 Data Flow Diagram

```
HTML (index.html)
    ↓
    └→ User inputs values in form fields
        ↓
        └→ 'input' event triggered
            ↓
            └→ UI.updateResults() called (ui.js)
                ↓
                └→ UI.getInputs() extracts form values
                    ↓
                    └→ calculateLCOE(inputs) executes (calculator.js)
                        ↓
                        ├→ calculateCAPEX()
                        ├→ calculateEMI()
                        ├→ calculateTotalOM()
                        ├→ calculateTotalEnergy()
                        ├→ calculateNPV()
                        └→ Returns results object
                            ↓
                            └→ UI.updateResults() receives results
                                ↓
                                ├→ Cache in UI.lastResults
                                ├→ Format values
                                └→ Update DOM elements
                                    ↓
                                    └→ CSS displays styled content
```

---

## ✅ Modification Checklist

### **To Add a New Input Field:**
1. ✅ Add `<input>` element to `index.html` with unique `id`
2. ✅ Add styling to `styles.css` (usually inherits from `.input-group`)
3. ✅ Add ID to `UI.inputIds` array in `ui.js`
4. ✅ Listener automatically attached in `initializeEventListeners()`

### **To Add a New Calculation:**
1. ✅ Create function in `calculator.js`
2. ✅ Add any new constants to `CONSTANTS` object
3. ✅ Call function from `calculateLCOE()`
4. ✅ Add result to returned object
5. ✅ Add display element to `index.html`
6. ✅ Update `UI.updateResults()` in `ui.js` to show result
7. ✅ Add to CSV export in `generateCSVContent()`

### **To Change Colors:**
1. ✅ Open `styles.css`
2. ✅ Find hex values (e.g., `#667eea`, `#764ba2`)
3. ✅ Replace with new colors
4. ✅ Test responsive design in browser DevTools

### **To Migrate to Vue.js:**
1. ✅ Keep `calculator.js` unchanged (pure logic)
2. ✅ Replace `ui.js` with Vue component
3. ✅ Use `v-model` for input binding
4. ✅ Use `@input` for event handling
5. ✅ Replace `updateResults()` with Vue `watch` or `computed`

### **To Migrate to Flask Backend:**
1. ✅ Move `calculator.js` logic to Python
2. ✅ Create Flask route: `POST /api/calculate`
3. ✅ Replace `calculateLCOE()` call with `fetch()` AJAX request
4. ✅ Keep `ui.js` for frontend updates
5. ✅ Keep `styles.css` unchanged

---

## 🚀 Quick Start

### **1. Set Up Files**
Download the 4 files:
- `index.html`
- `styles.css`
- `calculator.js`
- `ui.js`

Place them in the same directory.

### **2. Run Locally**
```bash
# Option A: Using Python 3
python -m http.server 8000

# Option B: Using Node.js
npx http-server

# Option C: Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### **3. Open in Browser**
Navigate to `http://localhost:8000`

---

## 📚 Constants & Tuning

Edit these in `calculator.js` to change calculation behavior:

```javascript
const CONSTANTS = {
    hours_in_year: 8760,           // Standard value, don't change
    opex_escalation_rate: 0.05,    // Change to 0.03 for 3% annual increase
    degradation_rate: 0.005,       // Change to 0.01 for 1% annual degradation
};
```

---

## 🔧 Future Enhancement Guide

### **Tax Benefits Module**
Add to `calculator.js`:
```javascript
function calculateTaxBenefit(capex, tax_rate, depreciation_years) {
    // Implement accelerated depreciation logic
}
```

### **Inflation Module**
Modify `calculateTotalOM()` to use separate inflation rate:
```javascript
const inflation_rate = 0.03; // 3% annually
const om_year = annual_opex * Math.pow(1 + inflation_rate, year);
```

### **Sensitivity Analysis UI**
In `ui.js`, add:
```javascript
UI.showSensitivityChart = function() {
    const sensitivity = generateSensitivityAnalysis(UI.getInputs());
    // Use Chart.js to plot sensitivity data
}
```

### **Multiple Scenarios**
Create new UI module `scenarios.js`:
- Store scenario data in memory (or localStorage for persistence)
- Allow save/load/compare functionality
- Extend CSV export to include all scenarios

### **Advanced Charting**
Add `chart.js` library:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
```
Create `charts.js` module with visualization functions.

---

## 📝 Testing & Debugging

### **Console Logging**
Add to `calculator.js` for debug output:
```javascript
console.log('CAPEX:', capex);
console.log('Annual EMI:', annual_emi);
console.log('Cash flows:', cash_flows);
```

### **Browser DevTools**
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Type: `Solar.UI.lastResults` to see cached results
4. Type: `calculateLCOE(Solar.UI.getInputs())` to test calculation

### **Unit Testing (Future)**
Create `calculator.test.js` using Jest:
```javascript
test('calculateCAPEX', () => {
    expect(calculateCAPEX(1.0, 50000000)).toBe(50000000);
});
```

---

## 📞 Support & Resources

- **MDN Web Docs:** https://developer.mozilla.org/
- **JavaScript Math:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- **CSS Grid:** https://css-tricks.com/snippets/css/complete-guide-grid/
- **NPV Formula:** https://en.wikipedia.org/wiki/Net_present_value
- **LCOE Formula:** https://www.irena.org/

---

## 📄 License

Open source. Use, modify, and distribute freely.

---

**Last Updated:** November 2025  
**Version:** 1.0 (Modular Architecture)  
**Status:** Ready for Extension ✅