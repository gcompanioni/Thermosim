import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Slider } from "../components/Slider";
import { Badge } from "../components/Badge";
import { Info, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./simulations.gibbs-free-energy.module.css";

type Spontaneity = "spontaneous" | "non-spontaneous" | "equilibrium";

const GibbsFreeEnergyPage = () => {
  const [deltaH, setDeltaH] = useState(-50); // Enthalpy Change (kJ/mol)
  const [deltaS, setDeltaS] = useState(100); // Entropy Change (J/mol·K)
  const [temperature, setTemperature] = useState(298); // Temperature (K)

  const deltaG = useMemo(() => {
    // Convert deltaS from J to kJ
    return deltaH - temperature * (deltaS / 1000);
  }, [deltaH, deltaS, temperature]);

  const spontaneity: Spontaneity = useMemo(() => {
    if (deltaG < -0.1) return "spontaneous";
    if (deltaG > 0.1) return "non-spontaneous";
    return "equilibrium";
  }, [deltaG]);

  const getScenario = (h: number, s: number): string => {
    if (h < 0 && s > 0) return "Always Spontaneous";
    if (h > 0 && s < 0) return "Never Spontaneous";
    if (h < 0 && s < 0) return "Spontaneous at Low T";
    if (h > 0 && s > 0) return "Spontaneous at High T";
    return "";
  };

  const currentScenario = getScenario(deltaH, deltaS);

  return (
    <>
      <Helmet>
        <title>Gibbs Free Energy Simulation | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive calculator to understand reaction spontaneity using Gibbs Free Energy (ΔG = ΔH - TΔS)."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Gibbs Free Energy & Spontaneity</h1>
            <div className={styles.formula}>ΔG = ΔH - TΔS</div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.calculator}>
              <div className={styles.sliderGroup}>
                <label>Enthalpy Change (ΔH): {deltaH.toFixed(0)} kJ/mol</label>
                <Slider
                  min={-100} max={100} step={1}
                  value={[deltaH]} onValueChange={(v) => setDeltaH(v[0])}
                />
              </div>
              <div className={styles.sliderGroup}>
                <label>Entropy Change (ΔS): {deltaS.toFixed(0)} J/mol·K</label>
                <Slider
                  min={-200} max={200} step={1}
                  value={[deltaS]} onValueChange={(v) => setDeltaS(v[0])}
                />
              </div>
              <div className={styles.sliderGroup}>
                <label>Temperature (T): {temperature.toFixed(0)} K</label>
                <Slider
                  min={1} max={600} step={1}
                  value={[temperature]} onValueChange={(v) => setTemperature(v[0])}
                />
              </div>
            </div>
            <div className={styles.results}>
              <div className={styles.deltaGDisplay}>
                <span className={styles.deltaGLabel}>ΔG</span>
                <span className={styles.deltaGValue}>{deltaG.toFixed(2)}</span>
                <span className={styles.deltaGUnit}>kJ/mol</span>
              </div>
              <Badge
                className={styles.spontaneityBadge}
                variant={
                  spontaneity === "spontaneous" ? "success"
                  : spontaneity === "non-spontaneous" ? "destructive"
                  : "warning"
                }
              >
                {spontaneity.replace("-", " ")}
              </Badge>
            </div>
          </div>

          <div className={styles.scenarioGrid}>
            <div className={`${styles.scenarioCard} ${currentScenario === 'Always Spontaneous' ? styles.active : ''}`}>
              <h4>ΔH &lt; 0, ΔS &gt; 0</h4>
              <p>Always Spontaneous</p>
            </div>
            <div className={`${styles.scenarioCard} ${currentScenario === 'Never Spontaneous' ? styles.active : ''}`}>
              <h4>ΔH &gt; 0, ΔS &lt; 0</h4>
              <p>Never Spontaneous</p>
            </div>
            <div className={`${styles.scenarioCard} ${currentScenario === 'Spontaneous at Low T' ? styles.active : ''}`}>
              <h4>ΔH &lt; 0, ΔS &lt; 0</h4>
              <p>Spontaneous at Low T</p>
            </div>
            <div className={`${styles.scenarioCard} ${currentScenario === 'Spontaneous at High T' ? styles.active : ''}`}>
              <h4>ΔH &gt; 0, ΔS &gt; 0</h4>
              <p>Spontaneous at High T</p>
            </div>
          </div>
          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/enthalpy">
                <ArrowLeft size={16} /> Previous: Enthalpy & Heat
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/reversible-processes">
                Next: Reversible Processes <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            About Gibbs Free Energy
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              <strong>Gibbs Free Energy (G)</strong> is a thermodynamic potential that measures the maximum amount of non-expansion work that can be extracted from a closed system at constant temperature and pressure. It is the primary indicator of whether a chemical reaction will occur spontaneously.
            </p>
            <h3>Predicting Spontaneity</h3>
            <ul>
              <li><strong>ΔG &lt; 0:</strong> The reaction is <strong>spontaneous</strong> in the forward direction.</li>
              <li><strong>ΔG &gt; 0:</strong> The reaction is <strong>non-spontaneous</strong>. The reverse reaction is spontaneous.</li>
              <li><strong>ΔG = 0:</strong> The system is at <strong>equilibrium</strong>.</li>
            </ul>
            <h3>The Four Scenarios</h3>
            <ul>
                <li><strong>Exothermic (ΔH &lt; 0), Increasing Disorder (ΔS &gt; 0):</strong> The reaction is always spontaneous, regardless of temperature.</li>
                <li><strong>Endothermic (ΔH &gt; 0), Decreasing Disorder (ΔS &lt; 0):</strong> The reaction is never spontaneous.</li>
                <li><strong>Exothermic (ΔH &lt; 0), Decreasing Disorder (ΔS &lt; 0):</strong> Spontaneous only at low temperatures where the enthalpy term dominates.</li>
                <li><strong>Endothermic (ΔH &gt; 0), Increasing Disorder (ΔS &gt; 0):</strong> Spontaneous only at high temperatures where the entropy term dominates.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
};

export default GibbsFreeEnergyPage;