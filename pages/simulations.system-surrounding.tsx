import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Slider } from "../components/Slider";
import { Info, Coffee, ChefHat, Thermometer as ThermometerIcon, Play, Pause, RotateCcw, ArrowLeft } from "lucide-react";
import styles from "./simulations.system-surrounding.module.css";

type SystemType = "open" | "closed" | "isolated";

// Coffee Cup Visualization (Open System)
const CoffeeCupVisualization = ({ isPlaying, speed }: { isPlaying: boolean; speed: number }) => {
  const [time, setTime] = useState(0);
  const [temperature, setTemperature] = useState(80);
  const [mass, setMass] = useState(250);
    const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setTime(t => t + 0.016 * speed);
      setTemperature(temp => Math.max(25, temp - 0.01 * speed));
      setMass(m => Math.max(200, m - 0.005 * speed));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className={styles.visualizationWrapper}>
      <div className={styles.sceneContainer}>
        {/* Coffee Cup SVG */}
        <svg className={styles.coffeeCup} viewBox="0 0 200 200" width="300" height="300">
          {/* Cup body */}
          <path
            d="M 50 80 L 60 160 Q 100 170 140 160 L 150 80 Z"
            fill="hsl(35, 70%, 60%)"
            stroke="hsl(35, 50%, 40%)"
            strokeWidth="2"
          />
          {/* Coffee liquid */}
          <ellipse
            cx="100"
            cy="85"
            rx="48"
            ry="8"
            fill="hsl(25, 60%, 30%)"
            opacity="0.9"
          />
          {/* Cup handle */}
          <path
            d="M 150 90 Q 170 90 170 110 Q 170 130 150 130"
            fill="none"
            stroke="hsl(35, 50%, 40%)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Boundary circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        </svg>

        {/* Animated steam particles (matter leaving) */}
        {isPlaying && Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`steam-${i}`}
            className={styles.steamParticle}
            style={{
              left: `${45 + i * 5}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 / speed}s`,
            }}
          />
        ))}

        {/* Animated heat waves (energy leaving) */}
        {isPlaying && Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`heat-${i}`}
            className={styles.heatWave}
            style={{
              left: `${40 + i * 10}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 / speed}s`,
            }}
          />
        ))}

        {/* Labels */}
        <div className={`${styles.flowLabel} ${styles.energyOut}`}>
          Heat Energy →
        </div>
        <div className={`${styles.flowLabel} ${styles.matterOut}`}>
          Water Vapor →
        </div>
      </div>

      <div className={styles.dataPanel}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Temperature:</span>
          <span className={styles.dataValue}>{temperature.toFixed(1)}°C</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Mass:</span>
          <span className={styles.dataValue}>{mass.toFixed(1)}g</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Time:</span>
          <span className={styles.dataValue}>{time.toFixed(1)}s</span>
        </div>
        <div className={styles.systemType}>
          <strong>Open System:</strong> Both energy and matter can escape
        </div>
      </div>
    </div>
  );
};

// Pressure Cooker Visualization (Closed System)
const PressureCookerVisualization = ({ isPlaying, speed }: { isPlaying: boolean; speed: number }) => {
  const [time, setTime] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1.0);
  const [mass] = useState(500);
    const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setTime(t => t + 0.016 * speed);
      setTemperature(temp => Math.min(120, temp + 0.02 * speed));
      setPressure(p => Math.min(2.5, p + 0.001 * speed));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className={styles.visualizationWrapper}>
      <div className={styles.sceneContainer}>
        {/* Pressure Cooker SVG */}
        <svg className={styles.pressureCooker} viewBox="0 0 200 200" width="300" height="300">
          {/* Pot body */}
          <rect
            x="40"
            y="90"
            width="120"
            height="80"
            rx="5"
            fill="hsl(0, 0%, 70%)"
            stroke="hsl(0, 0%, 40%)"
            strokeWidth="2"
          />
          {/* Lid */}
          <ellipse
            cx="100"
            cy="90"
            rx="65"
            ry="12"
            fill="hsl(0, 0%, 75%)"
            stroke="hsl(0, 0%, 40%)"
            strokeWidth="2"
          />
          {/* Lid handle */}
          <rect
            x="90"
            y="75"
            width="20"
            height="15"
            rx="3"
            fill="hsl(0, 0%, 30%)"
          />
          {/* Pressure valve */}
          <circle
            cx="100"
            cy="82"
            r="4"
            fill="hsl(0, 70%, 50%)"
          />
          
          {/* Steam inside (visible through transparency) */}
          {isPlaying && (
            <g opacity="0.3">
              {Array.from({ length: 6 }).map((_, i) => (
                <circle
                  key={`inside-steam-${i}`}
                  cx={60 + Math.random() * 80}
                  cy={110 + Math.random() * 40}
                  r={3 + Math.random() * 3}
                  fill="hsl(200, 70%, 70%)"
                  className={styles.bubbleParticle}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </g>
          )}

          {/* Boundary circle */}
          <circle
            cx="100"
            cy="120"
            r="80"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        </svg>

        {/* Stove/flame below */}
        <div className={styles.stoveFlame}>
          {isPlaying && Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`flame-${i}`}
              className={styles.flame}
              style={{
                left: `${30 + i * 10}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${0.6 / speed}s`,
              }}
            />
          ))}
        </div>

        {/* Heat energy arrows going in */}
        {isPlaying && (
          <div className={`${styles.flowLabel} ${styles.energyIn}`}>
            ↑ Heat Energy
          </div>
        )}
      </div>

      <div className={styles.dataPanel}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Temperature:</span>
          <span className={styles.dataValue}>{temperature.toFixed(1)}°C</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Pressure:</span>
          <span className={styles.dataValue}>{pressure.toFixed(2)} atm</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Mass:</span>
          <span className={styles.dataValue}>{mass.toFixed(1)}g (constant)</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Time:</span>
          <span className={styles.dataValue}>{time.toFixed(1)}s</span>
        </div>
        <div className={styles.systemType}>
          <strong>Closed System:</strong> Energy enters, but matter is sealed inside
        </div>
      </div>
    </div>
  );
};

// Thermos Visualization (Isolated System)
const ThermosVisualization = ({ isPlaying, speed }: { isPlaying: boolean; speed: number }) => {
  const [time, setTime] = useState(0);
  const [temperature] = useState(85);
  const [mass] = useState(300);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setTime(t => t + 0.016 * speed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className={styles.visualizationWrapper}>
      <div className={styles.sceneContainer}>
        {/* Thermos SVG */}
        <svg className={styles.thermos} viewBox="0 0 200 200" width="300" height="300">
          {/* Outer shell */}
          <rect
            x="60"
            y="40"
            width="80"
            height="130"
            rx="10"
            fill="hsl(200, 60%, 50%)"
            stroke="hsl(200, 40%, 30%)"
            strokeWidth="3"
          />
          {/* Thick insulation layer - very visible */}
          <rect
            x="67"
            y="47"
            width="66"
            height="116"
            rx="8"
            fill="hsl(45, 90%, 60%)"
            opacity="0.8"
          />
          {/* Insulation pattern */}
          <g opacity="0.6">
            <path d="M 70 55 L 130 55" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 65 L 130 65" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 75 L 130 75" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 85 L 130 85" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 95 L 130 95" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 105 L 130 105" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 115 L 130 115" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 125 L 130 125" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 135 L 130 135" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 145 L 130 145" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
            <path d="M 70 155 L 130 155" stroke="hsl(45, 80%, 40%)" strokeWidth="1" />
          </g>
          {/* Inner container */}
          <rect
            x="74"
            y="54"
            width="52"
            height="102"
            rx="6"
            fill="hsl(0, 0%, 90%)"
            stroke="hsl(0, 0%, 60%)"
            strokeWidth="1"
          />
          {/* Liquid inside */}
          <rect
            x="76"
            y="70"
            width="48"
            height="80"
            rx="5"
            fill="hsl(35, 80%, 45%)"
          />
          {/* Cap */}
          <ellipse
            cx="100"
            cy="40"
            rx="42"
            ry="8"
            fill="hsl(200, 50%, 40%)"
            stroke="hsl(200, 40%, 30%)"
            strokeWidth="2"
          />

          {/* Boundary circle - insulation barrier */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="4"
            strokeDasharray="8,4"
            opacity="0.8"
          />
        </svg>

        {/* Heat particles trying to escape but being blocked */}
        {isPlaying && Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`blocked-heat-${i}`}
            className={styles.blockedHeatParticle}
            style={{
              left: `${35 + (i % 4) * 10}%`,
              top: `${40 + Math.floor(i / 4) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${1.5 / speed}s`,
            }}
          />
        ))}

        {/* Steam particles trying to escape but being blocked */}
        {isPlaying && Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`blocked-steam-${i}`}
            className={styles.blockedSteamParticle}
            style={{
              left: `${40 + i * 7}%`,
              top: `35%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 / speed}s`,
            }}
          />
        ))}

        {/* Blocking effect indicators */}
        {isPlaying && (
          <>
            <div className={`${styles.blockIndicator} ${styles.blockTop}`}>
              <span className={styles.blockX}>✕</span>
            </div>
            <div className={`${styles.blockIndicator} ${styles.blockRight}`}>
              <span className={styles.blockX}>✕</span>
            </div>
            <div className={`${styles.blockIndicator} ${styles.blockLeft}`}>
              <span className={styles.blockX}>✕</span>
            </div>
          </>
        )}

        {/* Labels showing blocked exchange */}
        <div className={`${styles.flowLabel} ${styles.heatBlocked}`}>
          <span className={styles.crossOut}>✕</span> Heat Blocked
        </div>
        <div className={`${styles.flowLabel} ${styles.matterBlocked}`}>
          <span className={styles.crossOut}>✕</span> Matter Blocked
        </div>
      </div>

      <div className={styles.dataPanel}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Temperature:</span>
          <span className={styles.dataValue}>{temperature.toFixed(1)}°C (constant)</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Mass:</span>
          <span className={styles.dataValue}>{mass.toFixed(1)}g (constant)</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Time:</span>
          <span className={styles.dataValue}>{time.toFixed(1)}s</span>
        </div>
        <div className={styles.systemType}>
          <strong>Isolated System:</strong> Neither energy nor matter can cross the boundary
        </div>
      </div>
    </div>
  );
};

const SystemSurroundingPage = () => {
  const [systemType, setSystemType] = useState<SystemType>("open");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey(k => k + 1);
  };

  return (
    <>
      <Helmet>
        <title>System & Surrounding | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive visualization of open, closed, and isolated thermodynamic systems with real-world examples."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>System vs. Surrounding</h1>
            <div className={styles.controls}>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant={isPlaying ? "secondary" : "primary"}
              >
                {isPlaying ? (
                  <>
                    <Pause size={16} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={16} /> Play
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>

          <Tabs value={systemType} onValueChange={(v) => setSystemType(v as SystemType)} className={styles.tabsRoot}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="open">
                <Coffee size={16} /> Coffee Cup (Open)
              </TabsTrigger>
              <TabsTrigger value="closed">
                <ChefHat size={16} /> Pressure Cooker (Closed)
              </TabsTrigger>
              <TabsTrigger value="isolated">
                <ThermometerIcon size={16} /> Thermos (Isolated)
              </TabsTrigger>
            </TabsList>

            <div className={styles.mainContent}>
              <TabsContent value="open" className={styles.tabsContent}>
                <CoffeeCupVisualization key={`open-${resetKey}`} isPlaying={isPlaying} speed={speed} />
              </TabsContent>
              <TabsContent value="closed" className={styles.tabsContent}>
                <PressureCookerVisualization key={`closed-${resetKey}`} isPlaying={isPlaying} speed={speed} />
              </TabsContent>
              <TabsContent value="isolated" className={styles.tabsContent}>
                <ThermosVisualization key={`isolated-${resetKey}`} isPlaying={isPlaying} speed={speed} />
              </TabsContent>

              <div className={styles.speedControl}>
                <label className={styles.speedLabel}>Animation Speed</label>
                <Slider
                  value={[speed]}
                  onValueChange={(v) => setSpeed(v[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className={styles.speedSlider}
                />
                <span className={styles.speedValue}>{speed.toFixed(1)}x</span>
              </div>
            </div>
          </Tabs>

          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft size={16} /> Back to Home
              </Link>
            </Button>
          </footer>
        </main>

        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            Understanding Systems
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              In thermodynamics, we divide the universe into the <strong>system</strong> (what we're studying) and the <strong>surroundings</strong> (everything else). The <strong>boundary</strong> between them determines what can be exchanged.
            </p>

            <h3>Open System (Coffee Cup)</h3>
            <p>
              Both <strong>energy</strong> and <strong>matter</strong> can cross the boundary. The coffee loses heat to the air and water evaporates as steam. Temperature and mass both decrease over time.
            </p>
            <p className={styles.example}>
              <strong>Examples:</strong> Boiling pot, human body, open beaker, Earth's atmosphere
            </p>

            <h3>Closed System (Pressure Cooker)</h3>
            <p>
              Only <strong>energy</strong> can cross the boundary; <strong>matter</strong> is sealed inside. Heat enters from the stove, increasing temperature and pressure, but no steam escapes. Mass remains constant.
            </p>
            <p className={styles.example}>
              <strong>Examples:</strong> Sealed flask, piston-cylinder (no leaks), refrigerator, car engine
            </p>

            <h3>Isolated System (Thermos)</h3>
            <p>
              Neither <strong>energy</strong> nor <strong>matter</strong> can cross the boundary. Perfect isolation is theoretical, but a good thermos comes close. Temperature and mass remain constant.
            </p>
            <p className={styles.example}>
              <strong>Examples:</strong> Insulated thermos, calorimeter, the universe as a whole
            </p>

            <div className={styles.keyInsight}>
              <strong>Key Insight:</strong> The type of system affects what thermodynamic processes are possible. Open systems can exchange both energy and matter with surroundings, closed systems only energy, and isolated systems neither.
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SystemSurroundingPage;