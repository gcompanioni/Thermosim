import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Play, Pause } from "lucide-react";
import styles from "./CarEngineSimulation.module.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
} from "recharts";

type EngineStroke = "intake" | "compression" | "power" | "exhaust";

export const CarEngineSimulation = () => {
  const [rpm, setRpm] = useState(30);
  const [fuelInput, setFuelInput] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pistonPosition, setPistonPosition] = useState(50);
  const [currentStroke, setCurrentStroke] = useState<EngineStroke>("intake");
  const [crankAngle, setCrankAngle] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(Date.now());

  const volume = 0.5 + (pistonPosition / 100) * 1.5;
  const compressionRatio = 2 / 0.5;
  
  const getPressure = () => {
    switch (currentStroke) {
      case "intake":
        return 0.8 + (pistonPosition / 100) * 0.2;
      case "compression":
        return 1 + ((100 - pistonPosition) / 100) * (compressionRatio * 2 - 1);
      case "power":
        const maxPressure = 10 + (fuelInput / 100) * 20;
        return maxPressure - ((pistonPosition / 100) * (maxPressure - 1));
      case "exhaust":
        return 1 + ((100 - pistonPosition) / 100) * 0.5;
      default:
        return 1;
    }
  };

  const pressure = getPressure();
  const workPerCycle = fuelInput * 0.8;
  const power = (workPerCycle * rpm) / 60;

  const generatePVData = () => {
    const data = [];
    const Vmin = 0.5;
    const Vmax = 2.0;
    const Pmin = 1;
    const gamma = 1.4;
    const Pmax = 10 + (fuelInput / 100) * 20;
    
    for (let i = 0; i <= 10; i++) {
      const v = Vmin + (i / 10) * (Vmax - Vmin);
      data.push({ volume: v, pressure: Pmin, stroke: "intake" });
    }
    
    for (let i = 0; i <= 20; i++) {
      const v = Vmax - (i / 20) * (Vmax - Vmin);
      const p = Pmin * Math.pow(Vmax / v, gamma);
      data.push({ volume: v, pressure: p, stroke: "compression" });
    }
    
    const Pcompressed = Pmin * Math.pow(compressionRatio, gamma);
    data.push({ volume: Vmin, pressure: Pmax, stroke: "combustion" });
    
    for (let i = 0; i <= 20; i++) {
      const v = Vmin + (i / 20) * (Vmax - Vmin);
      const p = Pmax * Math.pow(Vmin / v, gamma);
      data.push({ volume: v, pressure: p, stroke: "power" });
    }
    
    data.push({ volume: Vmax, pressure: Pmin, stroke: "exhaust" });
    
    return data;
  };

  const pvData = generatePVData();

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const degreesPerMs = (rpm * 360) / (60 * 1000);
      const angleIncrement = degreesPerMs * deltaTime;

      setCrankAngle((prevAngle) => {
        const newAngle = (prevAngle + angleIncrement) % 720;
        
        const strokeAngle = newAngle % 180;
        const position = 50 + 50 * Math.sin((strokeAngle * Math.PI) / 180);
        setPistonPosition(position);

        if (newAngle < 180) {
          setCurrentStroke("intake");
        } else if (newAngle < 360) {
          setCurrentStroke("compression");
        } else if (newAngle < 540) {
          setCurrentStroke("power");
        } else {
          setCurrentStroke("exhaust");
        }

        return newAngle;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, rpm]);

  const getStrokeColor = (stroke: EngineStroke) => {
    switch (stroke) {
      case "intake": return "hsl(204, 70%, 55%)";
      case "compression": return "hsl(35, 90%, 55%)";
      case "power": return "hsl(0, 80%, 55%)";
      case "exhaust": return "hsl(0, 0%, 60%)";
    }
  };

  const showSpark = currentStroke === "power" && pistonPosition > 95;

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.subtitle}>Car Engine - Otto Cycle</h2>
        <div className={styles.dataDisplay}>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Stroke:</span>
            <span className={styles.dataValue} style={{ color: getStrokeColor(currentStroke) }}>
              {currentStroke.toUpperCase()}
            </span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Work/Cycle:</span>
            <span className={styles.dataValue}>{workPerCycle.toFixed(1)} J</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Power:</span>
            <span className={styles.dataValue}>{power.toFixed(2)} kW</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.engineContainer}>
          <svg viewBox="0 0 300 400" className={styles.engineSvg}>
            <rect x="100" y="50" width="100" height="250" fill="var(--muted)" stroke="var(--border)" strokeWidth="3" rx="5" />
            <rect x="90" y="30" width="120" height="25" fill="var(--surface)" stroke="var(--border)" strokeWidth="3" rx="3" />
            <line x1="150" y1="30" x2="150" y2="60" stroke="var(--muted-foreground)" strokeWidth="3" />
            <circle cx="150" cy="30" r="5" fill="var(--accent)" />
            {showSpark && (
              <g className={styles.sparkAnimation}>
                <line x1="140" y1="60" x2="145" y2="68" stroke="hsl(48, 96%, 53%)" strokeWidth="2" />
                <line x1="150" y1="60" x2="150" y2="70" stroke="hsl(48, 96%, 53%)" strokeWidth="2" />
                <line x1="160" y1="60" x2="155" y2="68" stroke="hsl(48, 96%, 53%)" strokeWidth="2" />
              </g>
            )}
            <rect x="105" y={60 + (pistonPosition * 2.2)} width="90" height={240 - (pistonPosition * 2.2)} fill={getStrokeColor(currentStroke)} opacity="0.4" />
            <g transform={`translate(0, ${pistonPosition * 2.2})`}>
              <rect x="105" y="60" width="90" height="30" fill="var(--muted-foreground)" stroke="var(--border)" strokeWidth="2" rx="2" />
              <line x1="105" y1="70" x2="195" y2="70" stroke="var(--border)" strokeWidth="1" />
              <line x1="105" y1="80" x2="195" y2="80" stroke="var(--border)" strokeWidth="1" />
              <line x1="150" y1="90" x2="150" y2="180" stroke="var(--foreground)" strokeWidth="4" />
              <circle cx="150" cy="90" r="6" fill="var(--foreground)" />
            </g>
            <g transform={`rotate(${crankAngle / 2}, 150, 310)`}>
              <circle cx="150" cy="310" r="30" fill="none" stroke="var(--border)" strokeWidth="2" />
              <circle cx="150" cy="310" r="8" fill="var(--foreground)" />
              <line x1="150" y1="310" x2="150" y2="280" stroke="var(--foreground)" strokeWidth="6" />
              <circle cx="150" cy="280" r="8" fill="var(--secondary)" />
            </g>
            <circle cx="150" cy="310" r="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            <text x="220" y="150" fill="var(--muted-foreground)" fontSize="12" fontFamily="var(--font-family-monospace)">
              V: {volume.toFixed(2)} L
            </text>
            <text x="220" y="170" fill="var(--muted-foreground)" fontSize="12" fontFamily="var(--font-family-monospace)">
              P: {pressure.toFixed(1)} atm
            </text>
          </svg>

          <div className={styles.strokeIndicator}>
            <div className={`${styles.strokeLabel} ${currentStroke === 'intake' ? styles.active : ''}`}>
              <div className={styles.strokeDot} style={{ backgroundColor: getStrokeColor('intake') }}></div>
              Intake
            </div>
            <div className={`${styles.strokeLabel} ${currentStroke === 'compression' ? styles.active : ''}`}>
              <div className={styles.strokeDot} style={{ backgroundColor: getStrokeColor('compression') }}></div>
              Compression
            </div>
            <div className={`${styles.strokeLabel} ${currentStroke === 'power' ? styles.active : ''}`}>
              <div className={styles.strokeDot} style={{ backgroundColor: getStrokeColor('power') }}></div>
              Power
            </div>
            <div className={`${styles.strokeLabel} ${currentStroke === 'exhaust' ? styles.active : ''}`}>
              <div className={styles.strokeDot} style={{ backgroundColor: getStrokeColor('exhaust') }}></div>
              Exhaust
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>P-V Diagram (Otto Cycle)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pvData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="volume" type="number" domain={[0.4, 2.1]} label={{ value: 'Volume (L)', position: 'insideBottom', offset: -15, fill: 'var(--foreground)' }} stroke="var(--foreground)" />
              <YAxis dataKey="pressure" type="number" domain={[0, 35]} label={{ value: 'Pressure (atm)', angle: -90, position: 'insideLeft', fill: 'var(--foreground)' }} stroke="var(--foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--popup)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
              <defs>
                <linearGradient id="cycleAreaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="pressure" stroke="none" fillOpacity={1} fill="url(#cycleAreaColor)" />
              <Line type="linear" dataKey="pressure" stroke="var(--primary)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className={styles.chartNote}>Area inside loop = Net work per cycle</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <Button onClick={() => setIsPlaying(!isPlaying)} variant="primary" size="lg">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
        <div className={styles.sliderGroup}>
          <label>Engine Speed: {rpm.toFixed(0)} RPM (Slow Motion)</label>
          <Slider min={10} max={120} step={10} value={[rpm]} onValueChange={(v) => setRpm(v[0])} />
        </div>
        <div className={styles.sliderGroup}>
          <label>Fuel Input: {fuelInput}%</label>
          <Slider min={10} max={100} step={5} value={[fuelInput]} onValueChange={(v) => setFuelInput(v[0])} />
        </div>
      </div>
    </>
  );
};