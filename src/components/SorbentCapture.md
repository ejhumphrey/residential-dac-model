1.  The filter's physical dimensions are based on a standard residential HVAC filter size of **20 inches by 25 inches by 4 inches**.
2.  The filter's Frontal Area ($A$) available for airflow is 0.32 m².
    $$A = (20 \text{ in} \cdot 0.0254 \frac{\text{m}}{\text{in}}) \cdot (25 \text{ in} \cdot 0.0254 \frac{\text{m}}{\text{in}}) \approx 0.32 \text{ m}^2$$
3.  The filter's Depth ($L$) in the direction of airflow is 0.1 m.
4.  The system is designed to operate with a standard residential Airflow ($Q$) of 1200 CFM (0.57 m³/s).
    $$Q = 1200 \frac{\text{ft}^3}{\text{min}} \cdot 0.0004719 \frac{\text{m}^3/\text{s}}{\text{CFM}} \approx 0.57 \frac{\text{m}^3}{\text{s}}$$
5.  The Air Velocity ($v$) through the filter medium is approximately 1.8 m/s, as determined by the airflow and frontal area.
    $$v = \frac{Q}{A} = \frac{0.57 \text{ m}^3/\text{s}}{0.32 \text{ m}^2} \approx 1.8 \frac{\text{m}}{\text{s}}$$
6.  The system's average Daily Runtime is assumed to be 8 hours.
7.  The filter's internal geometry shall be designed to create a Static Pressure ($ΔP$) of no more than 100 Pascals at the specified airflow.
8.  To meet the static pressure and size constraints, the filter's internal honeycomb structure has an average Channel Diameter ($D_h$) of approximately 1.3 mm.
    $$D_h = \frac{k_p \cdot L \cdot v^2}{\Delta P_{max}} = \frac{0.4 \cdot 0.1 \text{ m} \cdot (1.8 \text{ m/s})^2}{100 \text{ Pa}} \approx 0.0013 \text{ m}$$
9.  The Residence Time ($\tau$), defined as the duration the air spends within the filter, is equal to approximately 0.056 seconds.
    $$\tau = \frac{L}{v} = \frac{0.1 \text{ m}}{1.8 \text{ m/s}} \approx 0.056 \text{ s}$$
10. The sorbent's Capture Efficiency ($\eta$), defined as the fraction of CO₂ removed from the air, is **2.2%**.
    $$\eta = 1 - e^{-k_m \cdot \tau} = 1 - e^{-0.4 \cdot 0.056} \approx 0.022 \text{ or } 2.2\%$$
11. The system's average Capture Rate ($Y$) is **0.036 kg of CO₂ per hour** of operation.
    $$Y = (Q \cdot C_{in} \cdot \eta) \cdot 3600 \frac{\text{s}}{\text{hr}} = (0.57 \cdot 0.0008 \cdot 0.022) \cdot 3600 \approx 0.036 \frac{\text{kg}}{\text{hr}}$$
12. The amine sorbent's Working Capacity ($C_w$) is defined as 10% of its mass (0.1 kg of CO₂ per 1 kg of sorbent).
13. The total Weekly CO₂ Capture under this model is then **2.0 kg**.
    $$\text{Weekly Capture} = Y \cdot \text{Daily Runtime} \cdot 7 = 0.036 \frac{\text{kg}}{\text{hr}} \cdot 8 \frac{\text{hr}}{\text{day}} \cdot 7 \text{ days} \approx 2.0 \text{ kg}$$
14. We assume that filters will be picked up once a week.
15. A single filter cartridge designed to operate for one full week (56 hours) would require **20 kg** of sorbent and have a total weight of approximately **27 kg** (or ~60 lbs).
    $$\text{Sorbent Mass} = \frac{\text{Weekly Capture}}{C_w} = \frac{2.0 \text{ kg}}{0.1} = 20 \text{ kg}$$ $$\text{Total Weight} = \frac{\text{Sorbent Mass}}{0.75} \approx 27 \text{ kg}$$
16. For practical user handling, the system shall use modular cartridges with a maximum weight of 10-15 kg.
17. The user will be required to swap between **2 and 3 cartridges weekly** to manage the captured CO₂.
    $$\text{Swaps} = \frac{\text{Total Weight}}{\text{Cartridge Weight}} = \frac{27 \text{ kg}}{15 \text{ kg}} \text{ to } \frac{27 \text{ kg}}{10 \text{ kg}} = 1.8 \text{ to } 2.7 \text{ cartridges}$$
