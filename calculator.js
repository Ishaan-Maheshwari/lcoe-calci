// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CONSTANTS = {
    hours_in_year: 8760,            // Standard hours per year
    opex_escalation_rate: 0.05,     // 5% annual OPEX increase
    degradation_rate: 0.005,        // 0.5% annual panel degradation
};

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate total CAPEX (Capital Expenditure)
 * Formula: Capex_turnkey = capacity × CAPEX_per_MW
 * 
 * @param {number} capacity - Installed capacity in MW
 * @param {number} capex_per_mw - CAPEX per MW in ₹
 * @returns {number} Total CAPEX in ₹
 */
function calculateCAPEX(capacity, capex_per_mw) {
    // return capacity * capex_per_mw;
    return capex_per_mw / capacity ;
}

/**
 * Calculate annual EMI (Equated Monthly Installment) converted to annual
 * Uses standard loan amortization formula:
 * EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
 * where P = principal, r = monthly rate, n = number of months
 * 
 * @param {number} principal - Total loan amount in ₹
 * @param {number} annual_rate - Annual interest rate (%)
 * @param {number} years - Loan tenure in years
 * @returns {number} Annual EMI in ₹
 */
function calculateEMI(principal, annual_rate, years) {
    // Handle edge cases
    if (years === 0 || principal === 0) return 0;
    
    const monthly_rate = annual_rate / 12;
    const num_months = years * 12;
    
    // If no interest, simple division
    if (monthly_rate === 0) {
        return principal / (num_months * 12); // Annual repayment
    }
    
    // Standard amortization formula
    const numerator = monthly_rate * Math.pow(1 + monthly_rate, num_months);
    const denominator = Math.pow(1 + monthly_rate, num_months) - 1;
    const monthly_emi = principal * (numerator / denominator);

    console.log("EMI :" + monthly_emi);
    
    return monthly_emi * 12; // Convert to annual
}

function calculateEMI_likeExcel(principal, annual_rate, years) {
  const r = annual_rate / 100;       // Use directly, same as Excel's formula input
//   const n = years * 12;
//   const numerator = r * Math.pow(1 + r, n);
//   const denominator = Math.pow(1 + r, n) - 1;
  const ann_emi = principal * r;
  return ann_emi
}


/**
 * Calculate total O&M costs with annual escalation
 * Formula: O&M[i] = OPEX × (1.05)^i summed for all years
 * 
 * @param {number} annual_opex - Annual OPEX in Year 0 (₹)
 * @param {number} years - Number of years to project
 * @returns {number} Total O&M cost over period (₹)
 */
function calculateTotalOM(annual_opex, years) {
    let total = 0;
    
    for (let i = 0; i < years; i++) {
        const escalated_opex = annual_opex * Math.pow(1 + CONSTANTS.opex_escalation_rate, i);
        total += escalated_opex;
    }
    
    return total;
}

/**
 * Calculate total energy generation with annual degradation
 * Formula: total_energy = Σ(annual_energy × (0.995)^i) for all years
 * 
 * @param {number} annual_energy - Annual energy generation in Year 0 (MWh)
 * @param {number} years - Project lifetime (years)
 * @returns {number} Total energy generated over project life (MWh)
 */
function calculateTotalEnergy(annual_energy, years) {
    let total = 0;
    
    for (let i = 0; i < years; i++) {
        const degraded_energy = annual_energy * Math.pow(1 - CONSTANTS.degradation_rate, i);
        total += degraded_energy;
    }
    
    return total;
}

/**
 * Calculate NPV (Net Present Value) of cash flows
 * Formula: NPV = Σ(CF_t / (1 + r)^t) for all periods t
 * 
 * @param {number} discount_rate - Discount rate (%)
 * @param {array} cash_flows - Array of annual cash flows (₹)
 * @returns {number} NPV (₹)
 */
function calculateNPV(discount_rate, cash_flows) {
    const rate = discount_rate / 100;
    // console.log("Rate :" + rate);
    // console.log("Cash Flows :" + cash_flows);
    let npv = 0;
    
    for (let t = 0; t < cash_flows.length; t++) {
        const pv = cash_flows[t] / Math.pow(1 + rate, t+1);
        npv += pv;
    }
    
    return npv;
}

function calculateNPVlikeExcel(discount_rate, cash_flows) {
    const rate = discount_rate / 100;
    // console.log("Rate :" + rate);
    cash_flows.unshift(0.0);
    // console.log("Cash Flows :" + cash_flows);
    let npv = 0;
    
    for (let t = 0; t < cash_flows.length; t++) {
        const pv = cash_flows[t] / Math.pow(1 + rate, t+1);
        npv += pv;
    }
    
    return npv;
}

/**
 * Calculate Capacity Utilization Efficiency (CUE)
 * Formula: CUE = Annual_Energy / (Capacity × 8760 hours)
 * 
 * @param {number} annual_energy - Annual energy generation (MWh)
 * @param {number} capacity - Installed capacity (MW)
 * @returns {number} CUE as fraction (0-1)
 */
function calculateCUE(annual_energy, capacity) {
    if (capacity === 0) return 0;
    return annual_energy / (capacity * CONSTANTS.hours_in_year);
}

/**
 * Main LCOE calculation orchestrator
 * Combines all sub-calculations and returns comprehensive results object
 * 
 * @param {object} inputs - Input parameters object containing:
 *   - capacity: Installed capacity (MW)
 *   - energy_generation: Annual energy generation (MWh)
 *   - capex_per_mw: CAPEX per MW (₹)
 *   - opex_percent: Annual OPEX as % of CAPEX
 *   - interest_rate: Loan interest rate (%)
 *   - loan_tenure: Loan tenure (years)
 *   - project_lifetime: Total project lifetime (years)
 *   - discount_rate: Discount rate for NPV (%)
 * 
 * @returns {object} Results object containing:
 *   - capex: Total CAPEX (₹)
 *   - annual_opex: Annual OPEX in Year 0 (₹)
 *   - annual_emi: Annual EMI (₹)
 *   - total_om: Total O&M over project life (₹)
 *   - total_loan: Total loan repayment (₹)
 *   - npv_opex: NPV of OPEX (₹)
 *   - total_energy: Total energy generated (MWh)
 *   - lcoe_mwh: LCOE per MWh (₹/MWh)
 *   - lcoe_kwh: LCOE per kWh (₹/kWh)
 *   - cue: Capacity Utilization Efficiency (fraction)
 *   - cash_flows: Array of annual cash flows for debugging
 */
function calculateLCOE(inputs) {
    // Extract and validate inputs
    const {
        capacity,
        energy_generation,
        capex_per_mw,
        opex_percent,
        interest_rate,
        loan_tenure,
        project_lifetime,
        discount_rate
    } = inputs;

    // Step 1: Calculate total CAPEX
    console.log("Capacity :" + capacity);
    console.log("Energy Generation :" + energy_generation);
    console.log("CAPEX per MW :" + capex_per_mw);
    const capex = calculateCAPEX(capacity, capex_per_mw);
    const energy_generation_per_year = energy_generation / capacity;
    console.log("-----------------")
    console.log("Capacity :" + capacity);
    console.log("Energy Generation :" + energy_generation_per_year);
    console.log("CAPEX per MW :" + capex);

    // Step 2: Calculate annual OPEX and annual EMI
    const annual_opex = (capex * opex_percent) / 100;
    // const annual_emi = calculateEMI(capex, interest_rate, loan_tenure);
    const annual_emi = calculateEMI_likeExcel(capex, interest_rate, loan_tenure);

    // Step 3: Calculate total O&M over project lifetime
    const total_om = calculateTotalOM(annual_opex, project_lifetime);

    // Step 4: Total loan repayment over project lifetime
    // Note: EMI only paid during loan_tenure, then becomes 0
    const total_loan = annual_emi * loan_tenure;

    const total_opex = total_om + total_loan;

    // Step 5: Create annual cash flows for NPV
    // Each year includes: escalated O&M + EMI (if within loan tenure)
    const cash_flows = [];
    for (let year = 0; year < project_lifetime; year++) {
        const om_year = annual_opex * Math.pow(1 + CONSTANTS.opex_escalation_rate, year);
        const emi_year = year < loan_tenure ? annual_emi : 0;
        cash_flows.push(om_year + emi_year);
        console.log('Cash flow for year', year + 1, ':', cash_flows[year]);
    }

    // Step 6: Calculate NPV of OPEX (cash flows discounted to present)
    // const npv_opex = calculateNPV(discount_rate, cash_flows);
    const npv_opex = calculateNPVlikeExcel(discount_rate, cash_flows);

    // Step 7: Calculate total energy generated with degradation
    const total_energy = calculateTotalEnergy(energy_generation_per_year, project_lifetime);

    // Step 8: Calculate LCOE
    // LCOE = (CAPEX + NPV of OPEX) / Total Energy Generated
    const lcoe_mwh = total_energy > 0 
        ? (capex + npv_opex) / total_energy 
        : 0;
    const lcoe_kwh = lcoe_mwh / 1000;

    // Step 9: Calculate CUE
    const cue = calculateCUE(energy_generation, capacity);

    // Return comprehensive results object
    return {
        capex,
        annual_opex,
        annual_emi,
        total_om,
        total_loan,
        total_opex,
        npv_opex,
        total_energy,
        lcoe_mwh,
        lcoe_kwh,
        cue,
        cash_flows  // Include for debugging/analysis
    };
}

/**
 * Generate sensitivity analysis for LCOE vs discount rate
 * Useful for understanding how discount rate affects LCOE
 * 
 * @param {object} base_inputs - Base input parameters
 * @param {number} min_rate - Minimum discount rate (%)
 * @param {number} max_rate - Maximum discount rate (%)
 * @param {number} step - Step size (%)
 * @returns {array} Array of {rate, lcoe_kwh, lcoe_mwh} objects
 */
function generateSensitivityAnalysis(base_inputs, min_rate = 5, max_rate = 15, step = 0.5) {
    const results = [];
    
    for (let rate = min_rate; rate <= max_rate; rate += step) {
        const inputs = { ...base_inputs, discount_rate: rate };
        const calc = calculateLCOE(inputs);
        results.push({
            rate: rate,
            lcoe_kwh: calc.lcoe_kwh,
            lcoe_mwh: calc.lcoe_mwh
        });
    }
    
    return results;
}