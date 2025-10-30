import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { CarEngineSimulation } from "../components/CarEngineSimulation";
import { LiftingWeightsSimulation } from "../components/LiftingWeightsSimulation";
import { Info, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./simulations.work.module.css";

const WorkPage = () => {
  const [activeTab, setActiveTab] = useState("engine");

  const sidebarContent = activeTab === "engine" ? (
    <>
      <p>
        A car engine converts the <strong>chemical energy</strong> in fuel into <strong>mechanical work</strong> through the 4-stroke Otto cycle. This is thermodynamics in action!
      </p>
      
      <h3>The 4-Stroke Cycle</h3>
      <ol>
        <li><strong style={{ color: 'hsl(204, 70%, 55%)' }}>Intake:</strong> Piston moves down, drawing in air-fuel mixture. Volume increases at constant pressure.</li>
        <li><strong style={{ color: 'hsl(35, 90%, 55%)' }}>Compression:</strong> Piston moves up, compressing the gas. Pressure increases as volume decreases (work done ON the gas).</li>
        <li><strong style={{ color: 'hsl(0, 80%, 55%)' }}>Power:</strong> Spark ignites fuel, causing rapid expansion. High-pressure gas pushes piston down (work done BY the gas). This is where mechanical work is extracted!</li>
        <li><strong style={{ color: 'hsl(0, 0%, 60%)' }}>Exhaust:</strong> Piston moves up, expelling burned gases. Volume decreases at low pressure.</li>
      </ol>

      <h3>Thermodynamic Work</h3>
      <div className={styles.formula}>W = -∫P dV</div>
      <p>
        The work done by the engine equals the area inside the P-V diagram loop. During the <strong>power stroke</strong>, the expanding gas does work on the piston. During <strong>compression</strong>, the piston does work on the gas.
      </p>
      <p>
        Net work per cycle = Work output (power stroke) - Work input (compression stroke). This net work is what propels your car!
      </p>

      <h3>Real-World Connection</h3>
      <p>
        <strong>Power</strong> is the rate of doing work: P = W/t. Higher RPM means more cycles per second, producing more power. More fuel means higher combustion pressure, also increasing power output.
      </p>
      <p>
        The compression ratio (max volume / min volume) is critical for efficiency. Higher compression ratios extract more work from the fuel, which is why diesel engines are more efficient!
      </p>
    </>
  ) : (
    <>
      <p>
        A piston-cylinder system is the fundamental way to understand <strong>thermodynamic work</strong>. When gas expands or compresses, it does work on its surroundings (or has work done on it).
      </p>
      
      <h3>Thermodynamic Work Formula</h3>
      <div className={styles.formula}>W = -∫P dV</div>
      <p>
        Work equals the <strong>negative integral of pressure over volume change</strong>. The negative sign is a convention: when gas expands (ΔV positive), it does work ON the surroundings, so W is positive for the system.
      </p>

      <h3>Sign Convention</h3>
      <p>
        <strong>Expansion (ΔV &gt; 0):</strong> Gas pushes piston up, does work BY the gas. From the gas's perspective, it loses energy doing work, so thermodynamically we consider this as positive work output.
      </p>
      <p>
        <strong>Compression (ΔV &lt; 0):</strong> External force pushes piston down, work done ON the gas. The gas gains energy, so work is negative (energy flows into the system).
      </p>
      <p>
        The negative sign in W = -∫P dV ensures this convention holds!
      </p>

      <h3>Pressure-Volume Relationship</h3>
      <p>
        Using the <strong>ideal gas law</strong> (PV = nRT), we can see how pressure, volume, and temperature relate:
      </p>
      <p>
        • Higher temperature → faster particles → more pressure at same volume<br/>
        • Larger volume → same particles spread out → lower pressure<br/>
        • Work depends on BOTH pressure and volume change
      </p>

      <h3>Real-World Applications</h3>
      <p>
        <strong>Internal Combustion Engines:</strong> Gas expansion in cylinders pushes pistons, converting heat to mechanical work - exactly this principle!
      </p>
      <p>
        <strong>Compressors:</strong> Air conditioners and refrigerators compress gas to increase its pressure and temperature, requiring work input.
      </p>
      <p>
        <strong>Pneumatic Systems:</strong> Compressed air tools store energy as high-pressure gas, which does work when released.
      </p>
      <p>
        <strong>Steam Engines:</strong> Historical steam locomotives used expanding steam in cylinders to drive pistons - the industrial revolution ran on this physics!
      </p>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Work & Energy Transfer | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive simulations demonstrating thermodynamic work through car engines (W = -PΔV) and weightlifting (W = mgh)."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Work & Energy Transfer</h1>
            <p className={styles.description}>
              Explore how energy is transferred through mechanical work in different systems
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="engine">Car Engine</TabsTrigger>
              <TabsTrigger value="weights">Piston-Cylinder System</TabsTrigger>
            </TabsList>

            <TabsContent value="engine">
              <CarEngineSimulation />
            </TabsContent>

            <TabsContent value="weights">
              <LiftingWeightsSimulation />
            </TabsContent>
          </Tabs>

          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/spontaneous-reactions">
                <ArrowLeft size={16} /> Previous: Spontaneous Reactions
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/system-surrounding">
                Next: System & Surrounding <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>

        <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>
              <Info size={20} />
              {activeTab === "engine" ? "How Car Engines Work" : "Thermodynamic Work: W = -∫P dV"}
            </h2>
          <div className={styles.sidebarContent}>
            {sidebarContent}
          </div>
        </aside>
      </div>
    </>
  );
};

export default WorkPage;