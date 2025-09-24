import { useState, useMemo } from 'react';

// --- Data & Constants ---
const VEHICLE_DATA = {
    'Gasoline Truck': {
        unloaded_efficiency: 20, // MPG
        loaded_efficiency: 14, // MPG
        emission_factor: 8.89, // kg CO2e/gallon
        fuel_type: 'gasoline'
    },
    'Electric Van': {
        unloaded_efficiency: 2.2, // mi/kWh
        loaded_efficiency: 1.7, // mi/kWh
        emission_factor: 0.583, // kg CO2e/kWh
        fuel_type: 'electric'
    },
};
const CARBON_MASS_FRACTION_IN_CO2 = 0.2729;

// --- Main Calculator Component ---
export default function CarbonCalculator() {
    // --- State Management for Inputs from YAML ---
    const [vehicleType, setVehicleType] = useState('Gasoline Truck');
    const [maxVehiclePayload, setMaxVehiclePayload] = useState(1814); // kg
    const [recoveryTruckLoad, setRecoveryTruckLoad] = useState(0.75); // 75%
    const [avgCartridgeSaturation, setAvgCartridgeSaturation] = useState(0.85); // 85%
    const [sorbentToCarbonRatio, setSorbentToCarbonRatio] = useState(3.3);
    const [packagingFraction, setPackagingFraction] = useState(0.10); // 10%
    const [fullCartridgeWeight, setFullCartridgeWeight] = useState(10); // kg
    const [baseCartridgeWeight, setBaseCartridgeWeight] = useState(1.0); // kg
    const [maxCarbonRatio, setMaxCarbonRatio] = useState(0.14);
    const [recoveryDistance, setRecoveryDistance] = useState(50); // miles
    const [distributionDistance, setDistributionDistance] = useState(50); // miles

    // --- Core Calculation Logic based on YAML ---
    const calculations = useMemo(() => {
        const vehicle = VEHICLE_DATA[vehicleType];

        // 1. Compute values from YAML
        const maxPossibleCartridges = Math.floor(maxVehiclePayload / fullCartridgeWeight);
        const actualNumberOfCartridges = Math.floor(maxPossibleCartridges * recoveryTruckLoad);

        const maxContentsWeight = fullCartridgeWeight - baseCartridgeWeight;
        const maxCarbonPerCartridge = maxContentsWeight * maxCarbonRatio;
        const actualCarbonPerCartridge = maxCarbonPerCartridge * avgCartridgeSaturation;
        const totalCarbonCaptured = actualNumberOfCartridges * actualCarbonPerCartridge;

        const actualContentsWeight = maxContentsWeight * avgCartridgeSaturation;
        const actualReclaimedCartridgeWeight = baseCartridgeWeight + actualContentsWeight;
        const totalRecoveryPayload = actualNumberOfCartridges * actualReclaimedCartridgeWeight;
        
        const totalDistributionPayload = (totalCarbonCaptured * sorbentToCarbonRatio) * (1 + packagingFraction);
        
        // 2. Emissions Calculation
        const calculateTripEmissions = (payload_kg, distance_miles) => {
            const avgPayload = payload_kg / 2;
            const payloadFraction = Math.min(avgPayload / maxVehiclePayload, 1);
            
            const efficiencyRange = vehicle.loaded_efficiency - vehicle.unloaded_efficiency;
            const efficiencyChange = efficiencyRange * payloadFraction;
            const avgEfficiency = vehicle.unloaded_efficiency + efficiencyChange;

            let co2Emitted = 0;
            if (vehicle.fuel_type === 'gasoline') {
                const gallons = distance_miles / avgEfficiency;
                co2Emitted = gallons * vehicle.emission_factor;
            } else { // electric
                const kwh = distance_miles / avgEfficiency;
                co2Emitted = kwh * vehicle.emission_factor;
            }
            const carbonEmitted = co2Emitted * CARBON_MASS_FRACTION_IN_CO2;
            return { carbonEmitted };
        };

        const recoveryEmissions = calculateTripEmissions(totalRecoveryPayload, recoveryDistance);
        const distributionEmissions = calculateTripEmissions(totalDistributionPayload, distributionDistance);
        
        const totalCarbonEmissions = recoveryEmissions.carbonEmitted + distributionEmissions.carbonEmitted;

        // 3. Final Output
        const roiRatio = totalCarbonEmissions > 0 ? totalCarbonCaptured / totalCarbonEmissions : Infinity;

        return {
            maxPossibleCartridges,
            actualNumberOfCartridges,
            totalRecoveryPayload,
            totalDistributionPayload,
            totalCarbonCaptured,
            totalCarbonEmissions,
            roiRatio,
        };
    }, [vehicleType, maxVehiclePayload, recoveryTruckLoad, avgCartridgeSaturation, sorbentToCarbonRatio, packagingFraction, fullCartridgeWeight, baseCartridgeWeight, maxCarbonRatio, recoveryDistance, distributionDistance]);

    return (
        <>
            <div className="controls">
                <InputControl label="Vehicle Type" tooltipText="Defines the vehicle used for transport. This sets the unloaded/loaded fuel economy and the CO2 emission factor.">
                    <RadioButtons options={['Gasoline Truck', 'Electric Van']} selected={vehicleType} onChange={setVehicleType} />
                </InputControl>
                <InputControl label="Maximum Vehicle Payload" tooltipText="The maximum weight (in kg) the vehicle can legally and safely carry. This is a key constraint for all calculations.">
                    <RadioButtons options={[1700, 1814, 2500]} selected={maxVehiclePayload} onChange={setMaxVehiclePayload} />
                </InputControl>
                <InputControl label="Recovery Truck Load Percentage" tooltipText="How full the recovery truck is, expressed as a percentage of the maximum number of cartridges it can physically carry.">
                    <RadioButtons options={[0.50, 0.75, 1.0]} selected={recoveryTruckLoad} onChange={setRecoveryTruckLoad} displayAs="percent" />
                </InputControl>
                <InputControl label="Average Cartridge Saturation Percentage" tooltipText="The average fullness of the reclaimed cartridges, as a percentage of their maximum possible sorbent and carbon capacity.">
                    <RadioButtons options={[0.70, 0.85, 1.0]} selected={avgCartridgeSaturation} onChange={setAvgCartridgeSaturation} displayAs="percent" />
                </InputControl>
                <InputControl label="Sorbent-to-Carbon Mass Ratio (X)" tooltipText="The 'X factor' scaling the distribution payload. It's the mass of fresh sorbent required to capture one unit mass of carbon (e.g., a value of 3.3 means 3.3 kg of sorbent is needed per kg of captured carbon).">
                    <RadioButtons options={[1.0, 2.8, 3.3, 4.0, 5.0, 6.7]} selected={sorbentToCarbonRatio} onChange={setSorbentToCarbonRatio} />
                </InputControl>
                <InputControl label="Distribution Packaging Fraction" tooltipText="The weight of packaging for the fresh sorbent, as a percentage of the sorbent's weight.">
                    <RadioButtons options={[0.05, 0.10, 0.20]} selected={packagingFraction} onChange={setPackagingFraction} displayAs="percent" />
                </InputControl>
                <InputControl label="Fully Saturated Cartridge Weight" tooltipText="The 'design weight' (in kg) of a single cartridge when it is 100% saturated with captured material.">
                    <RadioButtons options={[5, 10, 15, 20]} selected={fullCartridgeWeight} onChange={setFullCartridgeWeight} />
                </InputControl>
                <InputControl label="Base Cartridge Weight" tooltipText="The inert weight of a single, empty cartridge container (in kg).">
                    <RadioButtons options={[0.5, 1.0, 2.0]} selected={baseCartridgeWeight} onChange={setBaseCartridgeWeight} />
                </InputControl>
                <InputControl label="Max Carbon Ratio in Contents" tooltipText="The theoretical best-case ratio (0 to 1) of a fully saturated cartridge's contents that is pure elemental carbon.">
                    <RadioButtons options={[0.05, 0.08, 0.11, 0.14, 0.17]} selected={maxCarbonRatio} onChange={setMaxCarbonRatio} />
                </InputControl>
                <InputControl label="Recovery Trip Distance" tooltipText="The total round-trip distance for the reclamation trip (in miles).">
                    <RadioButtons options={[10, 25, 50, 100]} selected={recoveryDistance} onChange={setRecoveryDistance} />
                </InputControl>
                <InputControl label="Distribution Trip Distance" tooltipText="The total round-trip distance for the distribution trip (in miles).">
                    <RadioButtons options={[10, 25, 50, 100]} selected={distributionDistance} onChange={setDistributionDistance} />
                </InputControl>
            </div>
            <div className="outputs">
                <section>
                    <h3>Intermediate Calculations</h3>
                    <DisplayValue label="Maximum Possible Cartridges" value={calculations.maxPossibleCartridges} unit="units" tooltipText="The absolute maximum number of cartridges the truck can carry, calculated as: (Maximum Vehicle Payload / Fully Saturated Cartridge Weight)." />
                    <DisplayValue label="Actual Number of Cartridges" value={calculations.actualNumberOfCartridges} unit="units" tooltipText="The number of cartridges on the current recovery trip, calculated as: (Maximum Possible Cartridges * Recovery Truck Load %)." />
                    <DisplayValue label="Total Recovery Payload" value={calculations.totalRecoveryPayload.toFixed(1)} unit="kg" tooltipText="The actual total weight of the recovery payload. This value is dynamic, changing based on the number of cartridges and their average saturation level." />
                    <DisplayValue label="Total Distribution Payload" value={calculations.totalDistributionPayload.toFixed(1)} unit="kg" tooltipText="The actual total weight of the distribution payload, calculated as: (Total Carbon Captured * Sorbent-to-Carbon Mass Ratio) * (1 + Distribution Packaging Fraction)." />
                </section>
                <section>
                    <h3>Final Outputs</h3>
                    <DisplayValue label="Total Carbon Captured" value={calculations.totalCarbonCaptured.toFixed(1)} unit="kg" tooltipText="The total mass of elemental carbon successfully reclaimed and returned to the hub by the recovery trip." />
                    <DisplayValue label="Total Carbon Emissions" value={calculations.totalCarbonEmissions.toFixed(1)} unit="kg" tooltipText="The total mass of elemental carbon emitted by the transport vehicle across both the distribution and recovery trips." />
                    <FinalRatioDisplay ratio={calculations.roiRatio} tooltipText="The final efficiency score, calculated as (Total Carbon Captured / Total Carbon Emissions). A value greater than 1 indicates the transport process is carbon-positive." />
                </section>
            </div>
            <style jsx>{`
                /* General Layout & Styles */
                .controls, .outputs { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
                .outputs section { margin-bottom: 2rem; }
                .outputs section:last-child { margin-bottom: 0; }
                h3 { margin-top: 0; font-size: 1.25rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
                /* Helper Component Styles */
                .tooltip { position: relative; display: inline-block; margin-left: 8px; cursor: help; }
                .tooltip .icon { font-style: normal; color: #94a3b8; border: 1px solid #cbd5e1; width: 16px; height: 16px; border-radius: 50%; font-size: 12px; display: grid; place-content: center; }
                .tooltip .tooltip-text { visibility: hidden; width: 220px; background-color: #1e293b; color: #fff; text-align: center; border-radius: 6px; padding: 8px; position: absolute; z-index: 1; bottom: 125%; left: 50%; margin-left: -110px; opacity: 0; transition: opacity 0.3s; font-size: 0.8rem; font-weight: 400; }
                .tooltip:hover .tooltip-text { visibility: visible; opacity: 1; }
                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: flex; align-items: center; font-weight: 500; margin-bottom: 0.5rem; color: #334155; }
                .radio-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .radio-options button { background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
                .radio-options button.selected { background-color: #0ea5e9; color: white; border-color: #0ea5e9; font-weight: 600; }
                .display-value { margin-bottom: 1rem; }
                .display-value .label { display: flex; align-items: center; font-size: 0.9rem; color: #64748b; margin-bottom: 0.25rem; }
                .display-value .value { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
                .final-ratio-display { text-align: center; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; }
                .final-ratio-display .value { font-size: 2.5rem; font-weight: 700; }
                .final-ratio-display.bad { background-color: #fee2e2; color: #b91c1c; }
                .final-ratio-display.okay { background-color: #ffedd5; color: #c2410c; }
                .final-ratio-display.good { background-color: #dbeafe; color: #1d4ed8; }
                .final-ratio-display.great { background-color: #dcfce7; color: #166534; }
            `}</style>
        </>
    );
}

// --- Helper Components ---
function Tooltip({ text }) { return <div className="tooltip"><i className="icon">i</i><span className="tooltip-text">{text}</span></div>; }
function InputControl({ label, tooltipText, children }) { return <div className="input-group"><label>{label} <Tooltip text={tooltipText} /></label>{children}</div>; }
function DisplayValue({ label, value, unit, tooltipText }) { return <div className="display-value"><div className="label">{label} <Tooltip text={tooltipText} /></div><div className="value">{value} {unit}</div></div>; }

function RadioButtons({ options, selected, onChange, displayAs }) {
    return (
        <div className="radio-options">
            {options.map(option => (
                <button 
                    key={option} 
                    className={selected === option ? 'selected' : ''}
                    onClick={() => onChange(option)}>
                    {displayAs === 'percent' ? `${option * 100}%` : option}
                </button>
            ))}
        </div>
    );
}

function FinalRatioDisplay({ ratio, tooltipText }) {
    let status = 'bad';
    if (ratio >= 20) status = 'great';
    else if (ratio >= 5) status = 'good';
    else if (ratio >= 1) status = 'okay';

    return (
        <div className="display-value">
            <div className="label">Carbon ROI Ratio <Tooltip text={tooltipText} /></div>
            <div className={`final-ratio-display ${status}`}>
                <div className="value">{ratio.toFixed(1)}</div>
            </div>
        </div>
    );
}
