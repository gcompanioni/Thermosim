import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Info, Droplets, Wind, Mountain, ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./simulations.spontaneous-reactions.module.css";

type Scenario = "ice-melting" | "gas-expansion" | "waterfall" | "rusting";

const scenarios = {
  "ice-melting": {
    title: "Ice Melting",
    icon: Droplets,
    description: "An ice cube melts at room temperature.",
    deltaH: 6.01, // > 0 (Endothermic)
    deltaS: 22.0, // > 0 (Increases disorder)
    deltaG: -0.5, // < 0 (Spontaneous at T > 0°C)
    timescale: "Minutes to Hours",
    animationClass: styles.meltAnimation,
  },
  "gas-expansion": {
    title: "Gas Expansion",
    icon: Wind,
    description: "A gas expands to fill a vacuum.",
    deltaH: 0, // ~ 0 (No heat change)
    deltaS: 5.76, // > 0 (Increases disorder)
    deltaG: -1.7, // < 0 (Spontaneous)
    timescale: "Milliseconds",
    animationClass: styles.expandAnimation,
  },
  "waterfall": {
    title: "Water Flowing Downhill",
    icon: Mountain,
    description: "Water flows from a higher to a lower potential energy state.",
    deltaH: -9.8, // < 0 (Exothermic, potential to kinetic)
    deltaS: 0.1, // > 0 (Slight increase in disorder)
    deltaG: -9.83, // < 0 (Spontaneous)
    timescale: "Seconds",
    animationClass: styles.flowAnimation,
  },
  "rusting": {
    title: "Iron Rusting",
    icon: ShieldAlert,
    description: "Iron slowly reacts with oxygen to form rust.",
    deltaH: -824.2, // < 0 (Exothermic)
    deltaS: -272, // < 0 (Decreases disorder)
    deltaG: -742.2, // < 0 (Spontaneous)
    timescale: "Days to Years",
    animationClass: styles.rustAnimation,
  },
};

const SpontaneousReactionsPage = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("ice-melting");
  const scenario = scenarios[activeScenario];

  return (
    <>
      <Helmet>
        <title>Spontaneous Reactions | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive examples of spontaneous reactions, illustrating the roles of enthalpy, entropy, and Gibbs free energy."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Spontaneous Reactions Predictor</h1>
          </div>
          <div className={styles.mainContent}>
            <div className={styles.scenarioSelector}>
              {Object.entries(scenarios).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.selectorButton} ${activeScenario === key ? styles.active : ""}`}
                  onClick={() => setActiveScenario(key as Scenario)}
                >
                  <value.icon size={24} />
                  <span>{value.title}</span>
                </button>
              ))}
            </div>
            <div className={styles.scenarioDetails}>
              <div className={styles.visualization}>
                <div className={scenario.animationClass}>
                  {activeScenario === 'ice-melting' && <div className={styles.iceCube}><div className={styles.puddle}></div></div>}
                  {activeScenario === 'gas-expansion' && (
                    <div className={styles.gasParticles}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={styles.particle} />
                      ))}
                    </div>
                  )}
                  {activeScenario === 'waterfall' && (
                    <div className={styles.waterContainer}>
                      <div className={styles.waterDrop} style={{ animationDelay: '0s' }} />
                      <div className={styles.waterDrop} style={{ animationDelay: '0.3s' }} />
                      <div className={styles.waterDrop} style={{ animationDelay: '0.6s' }} />
                    </div>
                  )}
                  {activeScenario === 'rusting' && <div className={styles.rustPatch}></div>}
                </div>
              </div>
              <div className={styles.infoPanel}>
                <h2>{scenario.title}</h2>
                <p>{scenario.description}</p>
                <div className={styles.dataGrid}>
                  <div>
                    <label>ΔH</label>
                    <span>{scenario.deltaH > 0 ? "+" : ""}{scenario.deltaH} kJ/mol</span>
                  </div>
                  <div>
                    <label>ΔS</label>
                    <span>{scenario.deltaS > 0 ? "+" : ""}{scenario.deltaS} J/mol·K</span>
                  </div>
                  <div>
                    <label>ΔG</label>
                    <span>{scenario.deltaG} kJ/mol</span>
                  </div>
                </div>
                <div className={styles.prediction}>
                  <label>Prediction</label>
                  <Badge variant={scenario.deltaG < 0 ? "success" : "destructive"}>
                    {scenario.deltaG < 0 ? "Spontaneous" : "Non-Spontaneous"}
                  </Badge>
                </div>
                <div className={styles.timescale}>
                  <label>Typical Timescale</label>
                  <Badge variant="secondary">{scenario.timescale}</Badge>
                </div>
              </div>
            </div>
          </div>
          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/reversible-processes">
                <ArrowLeft size={16} /> Previous: Reversible Processes
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/work">
                Next: Work & Energy <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            About Spontaneity
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              A <strong>spontaneous process</strong> is one that occurs without any continuous external intervention. It will proceed on its own, though it may be very fast or incredibly slow.
            </p>
            <h3>Spontaneous ≠ Instantaneous</h3>
            <p>
              This is a critical distinction. A reaction's spontaneity (predicted by ΔG) tells us if it *can* happen, not how *fast* it will happen. The speed of a reaction is determined by its kinetics and activation energy.
            </p>
            <ul>
              <li><strong>Diamond to Graphite:</strong> The conversion of diamond to graphite is spontaneous (ΔG is negative), but it's so slow it's unobservable on a human timescale.</li>
              <li><strong>Rusting:</strong> Iron rusting is spontaneous but can take years.</li>
            </ul>
            <h3>Role of Activation Energy</h3>
            <p>
              Many spontaneous reactions require an initial input of energy, called activation energy, to get started. For example, burning wood is spontaneous, but you need a match to overcome the activation energy barrier.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SpontaneousReactionsPage;