import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Slider } from '../components/Slider';
import { Button } from '../components/Button';
import { RefreshCw, Info, ArrowRight } from "lucide-react";
import styles from "./simulations.entropy.module.css";

const MIN_PARTICLES = 10;
const MAX_PARTICLES = 100;
const MIN_TEMP = 273; // 0°C
const MAX_TEMP = 573; // 300°C
const BOLTZMANN_CONSTANT = 1.38e-23; // J/K

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const EntropySimulationPage = () => {
  const [numParticles, setNumParticles] = useState(50);
  const [temperature, setTemperature] = useState(373); // 100°C
  const [entropy, setEntropy] = useState(0);
  const particlesRef = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  const resetSimulation = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const newParticles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      const radius = 5;
      newParticles.push({
        id: i,
        radius,
        x: radius + Math.random() * (width - radius * 2),
        y: radius + Math.random() * (height - radius * 2),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }
    particlesRef.current = newParticles;
  }, [numParticles]);

  useEffect(() => {
    resetSimulation();
  }, [numParticles, resetSimulation]);

  useEffect(() => {
    const calculateEntropy = () => {
      // Simplified model: Entropy is proportional to temperature and number of particles (disorder)
      // This is a qualitative representation, not a precise physical calculation.
      const normalizedTemp = (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
      const normalizedParticles =
      (numParticles - MIN_PARTICLES) / (MAX_PARTICLES - MIN_PARTICLES);
      const calculated =
      (normalizedTemp * 0.7 + normalizedParticles * 0.3 + 0.1) * 100;
      setEntropy(calculated);
    };
    calculateEntropy();
  }, [numParticles, temperature]);

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const speedFactor = temperature / MIN_TEMP * 0.5;

      particlesRef.current = particlesRef.current.map((p) => {
        let newX = p.x + p.vx * speedFactor;
        let newY = p.y + p.vy * speedFactor;
        let newVx = p.vx;
        let newVy = p.vy;

        if (newX - p.radius < 0 || newX + p.radius > width) {
          newVx = -newVx;
          newX = p.x + newVx * speedFactor;
        }
        if (newY - p.radius < 0 || newY + p.radius > height) {
          newVy = -newVy;
          newY = p.y + newVy * speedFactor;
        }

        return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
      });

      // Force a re-render by creating a new array
      if (containerRef.current) {
        // This is a bit of a hack to trigger re-render without state for performance
        containerRef.current.innerHTML = ""; // Clear previous frame
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const tempColor = `hsl(240, 100%, ${70 - (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP) * 30}%)`;

        particlesRef.current.forEach((p) => {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", p.x.toString());
          circle.setAttribute("cy", p.y.toString());
          circle.setAttribute("r", p.radius.toString());
          circle.setAttribute("fill", tempColor);
          svg.appendChild(circle);
        });
        containerRef.current.appendChild(svg);
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [temperature]);

  return (
    <>
      <Helmet>
        <title>Entropy Simulation | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive simulation to understand entropy, disorder, and the effects of temperature and particle count." />

      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Entropy & Disorder</h1>
            <div className={styles.entropyDisplay}>
              <span className={styles.entropyLabel}>Calculated Entropy (S)</span>
              <span className={styles.entropyValue}>{entropy.toFixed(2)}</span>
            </div>
          </div>
          <div
            ref={containerRef}
            className={styles.visualization}
            style={{
              "--temp-color-start": `hsl(240, 80%, ${95 - (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP) * 20}%)`,
              "--temp-color-end": `hsl(0, 80%, ${75 + (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP) * 20}%)`
            } as React.CSSProperties}>
          </div>
          <div className={styles.controls}>
            <div className={styles.sliderGroup}>
              <label htmlFor="particles-slider">
                Number of Particles: {numParticles}
              </label>
              <Slider
                id="particles-slider"
                min={MIN_PARTICLES}
                max={MAX_PARTICLES}
                step={1}
                value={[numParticles]}
                onValueChange={(value) => setNumParticles(value[0])} />

            </div>
            <div className={styles.sliderGroup}>
              <label htmlFor="temp-slider">
                Temperature: {temperature} K ({temperature - 273}°C)
              </label>
              <Slider
                id="temp-slider"
                min={MIN_TEMP}
                max={MAX_TEMP}
                step={1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])} />

            </div>
            <Button
              variant="outline"
              onClick={resetSimulation}
              className={styles.resetButton}>

              <RefreshCw size={16} /> Reset
            </Button>
          </div>
          <footer className={styles.navigationFooter}>
            <div></div>
            <Button asChild>
              <Link to="/simulations/three-laws">
                Next: The Three Laws <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            About Entropy
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              <strong>Entropy (S)</strong> is a fundamental concept in
              thermodynamics that measures the amount of randomness, disorder,
              or uncertainty in a system. A system with higher entropy is more
              disordered.
            </p>
            <h3>Key Concepts</h3>
            <ul>
              <li>
                <strong>State Function:</strong> Entropy depends only on the
                current state of the system, not how it got there.
              </li>
              <li>
                <strong>Second Law:</strong> The total entropy of an isolated
                system can only increase over time. It can never decrease.
              </li>
            </ul>
            <h3>Formula</h3>
            <p>
              The change in entropy (ΔS) for a reversible process is defined as:
            </p>
            <div className={styles.formula}>ΔS = Q / T</div>
            <p>
              Where <strong>Q</strong> is the heat added to the system and{" "}
              <strong>T</strong> is the temperature in Kelvin.
            </p>
            <h3>Real-World Examples</h3>
            <ul>
              <li>
                <strong>Ice Melting:</strong> Solid water (ice) has a structured,
                ordered lattice. As it melts into liquid water, the molecules
                can move freely, increasing disorder and entropy.
              </li>
              <li>
                <strong>Gas Expanding:</strong> When a gas expands to fill a
                larger volume, its particles have more possible positions,
                leading to higher entropy.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>);

};

export default EntropySimulationPage;