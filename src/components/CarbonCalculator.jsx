import { useState, useMemo } from 'react';

// --- Data & Constants ---
const VEHICLE_DATA = {
  'Gasoline Truck': {
    base_efficiency: 20, // MPG
    loaded_efficiency: 14, // MPG
    max_payload_kg: 1814,
    emission_factor: 8.89, // kg CO2e/gallon
    fuel_type: 'gasoline'
  },
  'Electric Van': {
    base_efficiency: 2.2, // mi/kWh
    loaded_efficiency: 1.7, // mi/kWh
    max_payload_kg: 1700,
    emission_factor: 0.583, // kg CO2e/kWh (Michigan Grid)
    fuel_type: 'electric'
  },
  'Hybrid Truck': {
    base_efficiency: 28, // MPG
    loaded_efficiency: 22, // MPG
    max_payload_kg: 1814,
    emission_factor: 8.89, // kg CO2e/gallon
    fuel_type: 'gasoline'
  },
};

const inputOptions = {
    vehicleType: Object.keys(VEHICLE_DATA),
    distance: [10, 40, 100],
    numCartridges: [25, 75, 150],
    materialWeight: [4, 8, 12],
    cartridgeWeight: [0.5, 1.0, 2.0],
    carbonMaterialRatio: [0.12, 0.17, 0.25],
    sorbentCarbonRatio: [2.8, 3.3, 4.0],
    packagingFraction: [0.05, 0.10, 0.20],
};

// --- Main Calculator Component ---
export default function CarbonCalculator() {
    // --- State Management for Inputs ---
    const [vehicleType, setVehicleType] = useState(inputOptions.vehicleType[0]);
    const [distance, setDistance] = useState(inputOptions.distance[1]);
    const [numCartridges, setNumCartridges] = useState(inputOptions.numCartridges[2]);
    const [materialWeight, setMaterialWeight] = useState(inputOptions.materialWeight[1]);
    const [cartridgeWeight, setCartridgeWeight] = useState(inputOptions.cartridgeWeight[1]);
    const [carbonMaterialRatio, setCarbonMaterialRatio] = useState(inputOptions.carbonMaterialRatio[1]);
    const [sorbentCarbonRatio, setSorbentCarbonRatio] = useState(inputOptions.sorbentCarbonRatio[1]);
    const [packagingFraction, setPackagingFraction] = useState(inputOptions.packagingFraction[1]);

    // --- Core Calculation Logic ---
    const calculations = useMemo(() => {
        const vehicle = VEHICLE_DATA[vehicleType];

        // 1. Payload Carbon Calculation
        const mass_carbon_per_cartridge_kg = materialWeight * (carbonMaterialRatio / (carbonMaterialRatio + 1));
        const total_captured_carbon_kg = numCartridges * mass_carbon_per_cartridge_kg;

        // 2. Reclamation Trip
        const average_cartridge_total_weight_kg = cartridgeWeight + materialWeight;
        const total_reclamation_payload_kg = numCartridges * average_cartridge_total_weight_kg;
        const average_reclamation_payload_kg = total_reclamation_payload_kg / 2;

        // 3. Distribution Trip
        const total_sorbent_mass_kg = total_captured_carbon_kg * sorbentCarbonRatio;
        const total_distribution_payload_kg = total_sorbent_mass_kg * (1 + packagingFraction);
        const average_distribution_payload_kg = total_distribution_payload_kg / 2;

        // Helper function for emissions
        const calculateEmissions = (payload_kg) => {
            const payload_fraction = Math.min(payload_kg / vehicle.max_payload_kg, 1);
            const efficiency_range = vehicle.loaded_efficiency - vehicle.base_efficiency;
            const efficiency_reduction = efficiency_range * payload_fraction;
            const adjusted_efficiency = vehicle.base_efficiency + efficiency_reduction;

            if (vehicle.fuel_type === 'gasoline') {
                const gallons = distance / adjusted_efficiency;
                return gallons * vehicle.emission_factor;
            } else { // electric
                const kwh = distance / adjusted_efficiency;
                return kwh * vehicle.emission_factor;
            }
        };
        
        const reclamationEmissions = calculateEmissions(average_reclamation_payload_kg);
        const distributionEmissions = calculateEmissions(average_distribution_payload_kg);

        // 4. Final Ratio
        const totalEmissions = reclamationEmissions + distributionEmissions;
        const totalCapturedCO2 = total_captured_carbon_kg / 0.2729;
        const finalRatio = totalEmissions > 0 ? totalCapturedCO2 / totalEmissions : Infinity;
        
        return {
            totalCapturedCO2,
            reclamationEmissions,
            distributionEmissions,
            totalEmissions,
            finalRatio
        };

    }, [vehicleType, distance, numCartridges, materialWeight, cartridgeWeight, carbonMaterialRatio, sorbentCarbonRatio, packagingFraction]);

    return (
        <>
            <div className="controls">
                <h3>Input Parameters</h3>
                <RadioInputGroup label="Vehicle Type" options={inputOptions.vehicleType} selectedValue={vehicleType} onChange={setVehicleType} />
                <RadioInputGroup label="Round Trip Distance (miles)" options={inputOptions.distance} selectedValue={distance} onChange={setDistance} />
                <RadioInputGroup label="Number of Cartridges" options={inputOptions.numCartridges} selectedValue={numCartridges} onChange={setNumCartridges} />
                <RadioInputGroup label="Sorbent & Carbon Weight (kg)" options={inputOptions.materialWeight} selectedValue={materialWeight} onChange={setMaterialWeight} />
                <RadioInputGroup label="Empty Cartridge Weight (kg)" options={inputOptions.cartridgeWeight} selectedValue={cartridgeWeight} onChange={setCartridgeWeight} />
                <RadioInputGroup label="Carbon-to-Material Ratio" options={inputOptions.carbonMaterialRatio} selectedValue={carbonMaterialRatio} onChange={setCarbonMaterialRatio} />
                <RadioInputGroup label="Sorbent-to-Carbon Mass Ratio" options={inputOptions.sorbentCarbonRatio} selectedValue={sorbentCarbonRatio} onChange={setSorbentCarbonRatio} />
                <RadioInputGroup label="Distribution Packaging Fraction" options={inputOptions.packagingFraction.map(p => `${p*100}%`)} selectedValue={`${packagingFraction*100}%`} onChange={(val) => setPackagingFraction(parseFloat(val)/100)} />
            </div>
            <div className="outputs">
                <h3>Calculated Outputs</h3>
                <div className="results-grid">
                    <DisplayValue label="Total Captured CO₂" value={`${calculations.totalCapturedCO2.toFixed(1)} kg`} isPrimary={true}/>
                    <DisplayValue label="Total Transport CO₂ Emissions" value={`${calculations.totalEmissions.toFixed(1)} kg`} isPrimary={true}/>
                    <DisplayValue label="Reclamation Trip Emissions" value={`${calculations.reclamationEmissions.toFixed(1)} kg`} />
                    <DisplayValue label="Distribution Trip Emissions" value={`${calculations.distributionEmissions.toFixed(1)} kg`} />
                </div>
                <div className="final-ratio">
                    <h4>Carbon Capture / Emission Ratio</h4>
                    <div className="ratio-value">{calculations.finalRatio.toFixed(1)}</div>
                    <p>For every 1 kg of CO₂ emitted by transport, <strong>{calculations.finalRatio.toFixed(1)} kg</strong> of CO₂ are captured.</p>
                </div>
            </div>
            <style jsx>{`
                .controls, .outputs { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
                h3 { margin-top: 0; font-size: 1.25rem; border-bottom: 1px solid var(--slate-200); padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
                h4 { margin-top: 0; font-size: 1rem; color: var(--slate-700); }
                .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .final-ratio { margin-top: 2rem; padding: 1.5rem; background-color: var(--slate-100); border-radius: 0.5rem; text-align: center; }
                .ratio-value { font-size: 3rem; font-weight: 700; color: var(--sky-500); line-height: 1; }
                .final-ratio p { margin: 0.5rem 0 0; color: var(--slate-700); }
            `}</style>
        </>
    );
}

// --- Helper Components ---
function RadioInputGroup({ label, options, selectedValue, onChange }) {
    return (
        <div className="input-group">
            <label>{label}</label>
            <div className="radio-options">
                {options.map(option => (
                    <button 
                        key={option} 
                        className={selectedValue === option ? 'selected' : ''}
                        onClick={() => onChange(option)}>
                        {option}
                    </button>
                ))}
            </div>
            <style jsx>{`
                .input-group { margin-bottom: 1.5rem; }
                label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--slate-700); font-size: 0.875rem; }
                .radio-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                button { background-color: var(--slate-100); border: 1px solid var(--slate-200); padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
                button:hover { background-color: var(--slate-200); }
                button.selected { background-color: var(--sky-500); color: white; border-color: var(--sky-500); font-weight: 600; }
            `}</style>
        </div>
    );
}

function DisplayValue({ label, value, isPrimary = false }) {
    return (
        <div>
            <span className={`label ${isPrimary ? 'primary-label' : ''}`}>{label}</span>
            <span className={`value ${isPrimary ? 'primary-value' : ''}`}>{value}</span>
            <style jsx>{`
                .label { display: block; font-size: 0.875rem; color: var(--slate-500); margin-bottom: 0.25rem; }
                .value { font-size: 1.25rem; font-weight: 600; color: var(--slate-800); }
                .primary-label { font-size: 1rem; }
                .primary-value { font-size: 1.75rem; color: var(--sky-500); }
            `}</style>
        </div>
    );
}
