import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Slider } from "../components/Slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Info, Thermometer, Zap, Snowflake, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./simulations.three-laws.module.css";

// --- First Law Components ---
const FirstLawSimulation = () => {
  const [internalEnergy, setInternalEnergy] = useState(50); // ΔU
  const [heatAdded, setHeatAdded] = useState(0); // Q
  const [workDone, setWorkDone] = useState(0); // W
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);

  const particleCount = 30;

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));

    const animate = () => {
      if (!containerRef.current) return;
      const ctx = (containerRef.current.querySelector('canvas') as HTMLCanvasElement)?.getContext('2d');
      if (!ctx) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      
      ctx.clearRect(0, 0, width, height);

      const speedFactor = internalEnergy / 50;
      const hue = 240 - (internalEnergy / 100) * 240; // Blue to Red

      particlesRef.current.forEach(p => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [internalEnergy]);

  const handleAddHeat = () => {
    setHeatAdded(q => q + 10);
    setInternalEnergy(u => Math.min(100, u + 10));
  };

  const handleDoWork = () => {
    setWorkDone(w => w + 5);
    setInternalEnergy(u => Math.max(0, u - 5));
  };

  const reset = () => {
    setInternalEnergy(50);
    setHeatAdded(0);
    setWorkDone(0);
  };

  return (
    <div className={styles.lawContainer}>
      <div className={styles.visualization} ref={containerRef}>
        <canvas />
      </div>
      <div className={styles.controls}>
        <div className={styles.displayGroup}>
          <div className={styles.formula}>ΔU = Q - W</div>
          <div className={styles.valueDisplay}>
            <span>ΔU: {internalEnergy.toFixed(0)}</span>
            <span>Q: {heatAdded.toFixed(0)}</span>
            <span>W: {workDone.toFixed(0)}</span>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <Button onClick={handleAddHeat}>Add Heat (Q)</Button>
                    <Button onClick={handleDoWork} className={styles.doWorkButton}>Do Work (W)</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>
      </div>
    </div>
  );
};

// --- Second Law Components ---
const SecondLawSimulation = () => {
    const [isPartitionRemoved, setPartitionRemoved] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; temp: 'hot' | 'cold' }[]>([]);
    const animationFrameId = useRef<number | undefined>(undefined);
    const [entropy, setEntropy] = useState(10);

    useEffect(() => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const halfWidth = width / 2;

        particlesRef.current = [
            ...Array.from({ length: 25 }, () => ({
                x: Math.random() * halfWidth,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                temp: 'hot' as const,
            })),
            ...Array.from({ length: 25 }, () => ({
                x: halfWidth + Math.random() * halfWidth,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                temp: 'cold' as const,
            })),
        ];

        const animate = () => {
            if (!containerRef.current) return;
            const ctx = (containerRef.current.querySelector('canvas') as HTMLCanvasElement)?.getContext('2d');
            if (!ctx) return;

            const { width, height } = containerRef.current.getBoundingClientRect();
            ctx.canvas.width = width;
            ctx.canvas.height = height;
            ctx.clearRect(0, 0, width, height);

                        if (!isPartitionRemoved) {
                ctx.beginPath();
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                if (!isPartitionRemoved) {
                    if (p.temp === 'hot' && p.x > width / 2) p.vx *= -1;
                    if (p.temp === 'cold' && p.x < width / 2) p.vx *= -1;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = p.temp === 'hot' ? '#ff6b6b' : '#4ecdc4';
                ctx.fill();
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPartitionRemoved]);

    useEffect(() => {
        if (isPartitionRemoved) {
            const interval = setInterval(() => {
                setEntropy(e => (e < 100 ? e + 1 : 100));
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isPartitionRemoved]);

    const reset = () => {
        setPartitionRemoved(false);
        setEntropy(10);
    };

    return (
        <div className={styles.lawContainer}>
            <div className={styles.visualization} ref={containerRef}><canvas /></div>
            <div className={styles.controls}>
                <div className={styles.displayGroup}>
                    <span className={styles.entropyLabel}>Total Entropy (S)</span>
                    <span className={styles.entropyValue}>{entropy.toFixed(0)}</span>
                </div>
                <div className={styles.buttonGroup}>
                    <Button onClick={() => setPartitionRemoved(true)} disabled={isPartitionRemoved}>Remove Partition</Button>
                    <Button onClick={reset} variant="outline">Reset</Button>
                </div>
            </div>
        </div>
    );
};

// --- Third Law Components ---
const ThirdLawSimulation = () => {
    const [temperature, setTemperature] = useState(300); // Kelvin
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
    const animationFrameId = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        particlesRef.current = Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
        }));
    }, []);

    useEffect(() => {
        const animate = () => {
            if (!containerRef.current) return;
            const ctx = (containerRef.current.querySelector('canvas') as HTMLCanvasElement)?.getContext('2d');
            if (!ctx) return;

            const { width, height } = containerRef.current.getBoundingClientRect();
            ctx.canvas.width = width;
            ctx.canvas.height = height;
            ctx.clearRect(0, 0, width, height);

            const speedFactor = temperature / 100;
            const hue = 240 - (temperature / 300) * 240;

            particlesRef.current.forEach(p => {
                p.x += p.vx * speedFactor;
                p.y += p.vy * speedFactor;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                ctx.fill();
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [temperature]);

    return (
        <div className={styles.lawContainer}>
            <div className={styles.visualization} ref={containerRef}><canvas /></div>
            <div className={styles.controls}>
                <div className={styles.sliderGroup}>
                    <label htmlFor="temp-slider">Temperature: {temperature.toFixed(1)} K</label>
                    <Slider
                        id="temp-slider"
                        min={0}
                        max={300}
                        step={0.1}
                        value={[temperature]}
                        onValueChange={(value) => setTemperature(value[0])}
                    />
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const ThreeLawsPage = () => {
  return (
    <>
      <Helmet>
        <title>The Three Laws of Thermodynamics | Thermodynamics Series</title>
        <meta
          name="description"
          content="Interactive simulations explaining the three laws of thermodynamics: conservation of energy, entropy, and absolute zero."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <Tabs defaultValue="first" className={styles.tabsRoot}>
            <div className={styles.header}>
              <h1 className={styles.title}>The Laws of Thermodynamics</h1>
              <TabsList className={styles.tabsList}>
                <TabsTrigger value="first"><Zap size={16} /> First Law</TabsTrigger>
                <TabsTrigger value="second"><Thermometer size={16} /> Second Law</TabsTrigger>
                <TabsTrigger value="third"><Snowflake size={16} /> Third Law</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="first" className={styles.tabsContent}>
              <FirstLawSimulation />
            </TabsContent>
            <TabsContent value="second" className={styles.tabsContent}>
              <SecondLawSimulation />
            </TabsContent>
            <TabsContent value="third" className={styles.tabsContent}>
              <ThirdLawSimulation />
            </TabsContent>
          </Tabs>
          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/entropy">
                <ArrowLeft size={16} /> Previous: Entropy & Disorder
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/enthalpy">
                Next: Enthalpy & Heat <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            About The Laws
          </h2>
          <div className={styles.sidebarContent}>
            <h3>First Law: Conservation of Energy</h3>
            <p>
              Energy cannot be created or destroyed, only converted from one form to another. The change in a system's internal energy (ΔU) is equal to the heat added (Q) minus the work done by the system (W).
            </p>
            <strong>Real-life App:</strong> A car engine converts the chemical energy of fuel into heat, which then does work to move the pistons.

            <h3>Second Law: Entropy Increases</h3>
            <p>
              The total entropy of an isolated system can only increase over time. This law defines the "arrow of time" – processes occur in a direction that increases total disorder. Heat naturally flows from hotter to colder objects.
            </p>
            <strong>Real-life App:</strong> A cup of hot coffee will always cool down to room temperature, never spontaneously heat up.

            <h3>Third Law: Absolute Zero</h3>
            <p>
              The entropy of a perfect crystal at absolute zero (0 Kelvin) is zero. As a system approaches absolute zero, all processes cease and its entropy approaches a minimum value. It is impossible to reach absolute zero through any finite number of steps.
            </p>
            <strong>Real-life App:</strong> Superconductors, which operate at very low temperatures, exhibit quantum effects because molecular motion is minimized.
          </div>
        </aside>
      </div>
    </>
  );
};

export default ThreeLawsPage;