import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Slider } from "../components/Slider";
import { Info, Droplet, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./simulations.enthalpy.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

const EnthalpyPage = () => {
  const [hotTemp, setHotTemp] = useState(80); // °C
  const [coldTemp, setColdTemp] = useState(10); // °C
  const [hotVolume, setHotVolume] = useState(200); // mL
  const [coldVolume, setColdVolume] = useState(200); // mL
  const [isMixing, setIsMixing] = useState(false);
  const [mixProgress, setMixProgress] = useState(0);
  const [currentHotTemp, setCurrentHotTemp] = useState(80);
  const [currentColdTemp, setCurrentColdTemp] = useState(10);
  const [showFinal, setShowFinal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SteamParticle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const [temperatureHistory, setTemperatureHistory] = useState<Array<{time: number, hot: number, cold: number}>>([]);

  // Calculate final equilibrium temperature
  // Assuming water density = 1 g/mL and specific heat c = 4.18 J/g°C
  const m1 = hotVolume; // mass in grams (since density = 1)
  const m2 = coldVolume;
  const finalTemp = (m1 * hotTemp + m2 * coldTemp) / (m1 + m2);
  
  // Heat calculations
  const heatLost = m1 * 4.18 * (hotTemp - finalTemp); // Joules
  const heatGained = m2 * 4.18 * (finalTemp - coldTemp); // Joules

  // Steam particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate steam particles from hot water (if not mixed yet)
      if (!showFinal && hotTemp > 50 && Math.random() > 0.85) {
        particlesRef.current.push({
          x: 80 + Math.random() * 40,
          y: 180,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 1,
          life: 1,
          size: 2 + Math.random() * 3,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hotTemp, showFinal]);

  // Mixing animation
  useEffect(() => {
    if (!isMixing) return;

        const interval = setInterval(() => {
      setMixProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsMixing(false);
          setShowFinal(true);
          return 100;
        }
        const newProgress = p + 0.5;
        
        // Animate temperature changes
        const progressRatio = newProgress / 100;
        setCurrentHotTemp(hotTemp - (hotTemp - finalTemp) * progressRatio);
        setCurrentColdTemp(coldTemp + (finalTemp - coldTemp) * progressRatio);
        
        // Record temperature history
        setTemperatureHistory(prev => [...prev, {
          time: newProgress,
          hot: hotTemp - (hotTemp - finalTemp) * progressRatio,
          cold: coldTemp + (finalTemp - coldTemp) * progressRatio,
        }]);
        
        return newProgress;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isMixing, hotTemp, coldTemp, finalTemp]);

  const handleMix = () => {
    if (isMixing) return;
    setMixProgress(0);
    setCurrentHotTemp(hotTemp);
    setCurrentColdTemp(coldTemp);
    setShowFinal(false);
    setTemperatureHistory([{time: 0, hot: hotTemp, cold: coldTemp}]);
    particlesRef.current = [];
    setIsMixing(true);
  };

  const handleReset = () => {
    setIsMixing(false);
    setMixProgress(0);
    setShowFinal(false);
    setCurrentHotTemp(hotTemp);
    setCurrentColdTemp(coldTemp);
    setTemperatureHistory([]);
    particlesRef.current = [];
  };

  const getWaterColor = (temp: number) => {
    if (temp >= 70) return "hsl(15, 90%, 55%)";
    if (temp >= 50) return "hsl(35, 85%, 60%)";
    if (temp >= 30) return "hsl(200, 70%, 50%)";
    return "hsl(200, 80%, 45%)";
  };

  return (
    <>
      <Helmet>
        <title>Enthalpy & Heat Transfer | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive simulation demonstrating enthalpy and heat transfer through mixing hot and cold water."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Enthalpy & Heat Transfer</h1>
            <div className={styles.deltaHDisplay}>
              Final T = {finalTemp.toFixed(1)}°C
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.visuals}>
              {/* Beaker Visualizations */}
              <div className={styles.beakersContainer}>
                {!showFinal ? (
                  <>
                    {/* Hot Water Beaker */}
                    <div className={styles.beakerWrapper}>
                      <canvas
                        ref={canvasRef}
                        width={200}
                        height={250}
                        className={styles.steamCanvas}
                      />
                      <div className={styles.beaker}>
                        <div className={styles.beakerTop} />
                        <div className={styles.beakerBody}>
                          <div 
                            className={styles.waterLevel}
                            style={{
                              height: `${(hotVolume / 500) * 100}%`,
                              background: `linear-gradient(to bottom, ${getWaterColor(currentHotTemp)}, ${getWaterColor(currentHotTemp - 10)})`,
                            }}
                          />
                          <div className={styles.volumeMarks}>
                            <div className={styles.mark} style={{bottom: '80%'}}><span>400mL</span></div>
                            <div className={styles.mark} style={{bottom: '60%'}}><span>300mL</span></div>
                            <div className={styles.mark} style={{bottom: '40%'}}><span>200mL</span></div>
                            <div className={styles.mark} style={{bottom: '20%'}}><span>100mL</span></div>
                          </div>
                        </div>
                        <div className={styles.beakerBase} />
                      </div>
                      <div className={styles.beakerLabel}>
                        <div className={styles.tempDisplay}>{currentHotTemp.toFixed(1)}°C</div>
                        <div className={styles.volumeDisplay}>{hotVolume} mL</div>
                        <div className={styles.labelText}>Hot Water</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {isMixing && (
                      <div className={styles.mixingArrow}>
                        <div className={styles.arrowLine} />
                        <div className={styles.arrowHead}>→</div>
                      </div>
                    )}

                    {/* Cold Water Beaker */}
                    <div className={styles.beakerWrapper}>
                      <div className={styles.beaker}>
                        <div className={styles.beakerTop} />
                        <div className={styles.beakerBody}>
                          <div 
                            className={styles.waterLevel}
                            style={{
                              height: `${(coldVolume / 500) * 100}%`,
                              background: `linear-gradient(to bottom, ${getWaterColor(currentColdTemp)}, ${getWaterColor(currentColdTemp - 5)})`,
                            }}
                          />
                          <div className={styles.volumeMarks}>
                            <div className={styles.mark} style={{bottom: '80%'}}><span>400mL</span></div>
                            <div className={styles.mark} style={{bottom: '60%'}}><span>300mL</span></div>
                            <div className={styles.mark} style={{bottom: '40%'}}><span>200mL</span></div>
                            <div className={styles.mark} style={{bottom: '20%'}}><span>100mL</span></div>
                          </div>
                        </div>
                        <div className={styles.beakerBase} />
                      </div>
                      <div className={styles.beakerLabel}>
                        <div className={styles.tempDisplay}>{currentColdTemp.toFixed(1)}°C</div>
                        <div className={styles.volumeDisplay}>{coldVolume} mL</div>
                        <div className={styles.labelText}>Cold Water</div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Final Mixed Beaker */
                  <div className={styles.finalBeakerWrapper}>
                    <div className={styles.beaker} style={{transform: 'scale(1.3)'}}>
                      <div className={styles.beakerTop} />
                      <div className={styles.beakerBody}>
                        <div 
                          className={styles.waterLevel}
                          style={{
                            height: `${((hotVolume + coldVolume) / 500) * 100}%`,
                            background: `linear-gradient(to bottom, ${getWaterColor(finalTemp)}, ${getWaterColor(finalTemp - 5)})`,
                          }}
                        />
                        <div className={styles.volumeMarks}>
                          <div className={styles.mark} style={{bottom: '80%'}}><span>400mL</span></div>
                          <div className={styles.mark} style={{bottom: '60%'}}><span>300mL</span></div>
                          <div className={styles.mark} style={{bottom: '40%'}}><span>200mL</span></div>
                          <div className={styles.mark} style={{bottom: '20%'}}><span>100mL</span></div>
                        </div>
                      </div>
                      <div className={styles.beakerBase} />
                    </div>
                    <div className={styles.beakerLabel}>
                      <div className={styles.tempDisplay} style={{fontSize: '1.5rem'}}>{finalTemp.toFixed(1)}°C</div>
                      <div className={styles.volumeDisplay}>{hotVolume + coldVolume} mL</div>
                      <div className={styles.labelText}>Equilibrium Reached</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Temperature vs Time Chart */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>Temperature vs Time</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temperatureHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                            <XAxis
                      dataKey="time"
                      tick={{ fill: "var(--muted-foreground)" }}
                      label={{ value: "Time", position: "insideBottom", offset: -10, fill: "var(--muted-foreground)" }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)" }}
                      tick={{ fill: "var(--muted-foreground)" }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popup)",
                        borderColor: "var(--border)",
                        color: "var(--popup-foreground)",
                      }}
                    />
                    <Legend />
                                        <Line
                      type="monotone"
                      dataKey="hot"
                      stroke="hsl(15, 90%, 55%)"
                      strokeWidth={2}
                      name="Hot Water (°C)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cold"
                      stroke="hsl(200, 80%, 45%)"
                      strokeWidth={2}
                      name="Cold Water (°C)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Display */}
            <div className={styles.dataPanel}>
              <div className={styles.dataSection}>
                <h4>Initial Conditions</h4>
                <div className={styles.dataGrid}>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Hot Water</span>
                    <span className={styles.dataValue}>{hotTemp}°C × {hotVolume} mL</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Cold Water</span>
                    <span className={styles.dataValue}>{coldTemp}°C × {coldVolume} mL</span>
                  </div>
                </div>
              </div>
              <div className={styles.dataSection}>
                <h4>Heat Transfer</h4>
                <div className={styles.dataGrid}>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Heat Lost (Hot)</span>
                    <span className={styles.dataValue} style={{color: 'var(--error)'}}>{(heatLost / 1000).toFixed(2)} kJ</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Heat Gained (Cold)</span>
                    <span className={styles.dataValue} style={{color: 'var(--primary)'}}>{(heatGained / 1000).toFixed(2)} kJ</span>
                  </div>
                </div>
              </div>
              <div className={styles.dataSection}>
                <h4>Final State</h4>
                <div className={styles.dataGrid}>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Equilibrium Temperature</span>
                    <span className={styles.dataValue} style={{color: 'var(--success)'}}>{finalTemp.toFixed(2)}°C</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Total Volume</span>
                    <span className={styles.dataValue}>{hotVolume + coldVolume} mL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label>Hot Water Temperature: {hotTemp}°C</label>
              <Slider
                min={40}
                max={100}
                step={5}
                value={[hotTemp]}
                onValueChange={(v) => {
                  setHotTemp(v[0]);
                  setCurrentHotTemp(v[0]);
                }}
                disabled={isMixing}
              />
            </div>
            <div className={styles.controlGroup}>
              <label>Cold Water Temperature: {coldTemp}°C</label>
              <Slider
                min={0}
                max={30}
                step={2}
                value={[coldTemp]}
                onValueChange={(v) => {
                  setColdTemp(v[0]);
                  setCurrentColdTemp(v[0]);
                }}
                disabled={isMixing}
              />
            </div>
            <div className={styles.controlGroup}>
              <label>Hot Water Volume: {hotVolume} mL</label>
              <Slider
                min={50}
                max={500}
                step={25}
                value={[hotVolume]}
                onValueChange={(v) => setHotVolume(v[0])}
                disabled={isMixing}
              />
            </div>
            <div className={styles.controlGroup}>
              <label>Cold Water Volume: {coldVolume} mL</label>
              <Slider
                min={50}
                max={500}
                step={25}
                value={[coldVolume]}
                onValueChange={(v) => setColdVolume(v[0])}
                disabled={isMixing}
              />
            </div>
            <div className={styles.buttonGroup}>
              <Button onClick={handleMix} disabled={isMixing}>
                <Droplet size={16} />
                Mix
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/three-laws">
                <ArrowLeft size={16} /> Previous: The Three Laws
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/gibbs-free-energy">
                Next: Gibbs Free Energy <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            About Enthalpy & Heat Transfer
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              <strong>Enthalpy (H)</strong> is a measure of the total heat content of a system at constant pressure. When heat is transferred at constant pressure, the change in enthalpy (ΔH) equals the heat transferred (q).
            </p>
            <div className={styles.formula}>ΔH = q<sub>p</sub> (at constant pressure)</div>
            
            <h3>Heat Transfer Equation</h3>
            <p>
              The heat gained or lost by a substance is calculated using:
            </p>
            <div className={styles.formula}>q = mcΔT</div>
            <p>
              where m is mass, c is specific heat capacity (4.18 J/g°C for water), and ΔT is the change in temperature.
            </p>

            <h3>Conservation of Energy</h3>
            <p>
              When hot and cold water mix, heat flows from the hot water to the cold water until thermal equilibrium is reached. By conservation of energy:
            </p>
            <div className={styles.formula}>Heat Lost = Heat Gained</div>
            <p>
              This allows us to calculate the final equilibrium temperature:
            </p>
            <div className={styles.formula}>T<sub>final</sub> = (m₁T₁ + m₂T₂) / (m₁ + m₂)</div>

            <h3>Why Do Temperatures Equalize?</h3>
            <p>
              The Second Law of Thermodynamics states that heat naturally flows from hotter objects to cooler objects until thermal equilibrium is reached. This process increases the total entropy of the system.
            </p>

            <h3>Real-World Applications</h3>
            <ul>
              <li><strong>Bathing:</strong> Mixing hot and cold water to achieve comfortable bath temperature</li>
              <li><strong>Coffee & Milk:</strong> Adding cold milk to hot coffee cools it to drinking temperature</li>
              <li><strong>Cooling Systems:</strong> Heat exchangers mix fluids of different temperatures</li>
              <li><strong>Cooking:</strong> Tempering eggs or chocolate by gradually mixing hot and cold</li>
              <li><strong>Calorimetry:</strong> Measuring heat of reactions using water temperature changes</li>
            </ul>

            <h3>Key Insight</h3>
            <p>
              The final temperature depends on both the initial temperatures and the volumes (masses) of the liquids. More hot water means the final temperature will be closer to the hot water's initial temperature, and vice versa.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};

export default EnthalpyPage;