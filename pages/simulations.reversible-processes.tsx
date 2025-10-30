import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Slider } from "../components/Slider";
import { Info, Play, Pause, RefreshCw, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

import styles from "./simulations.reversible-processes.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'A' | 'B';
}

interface ReactionVisualizationProps {
  isReversible: boolean;
  isPlaying: boolean;
  speed: number;
  onReverseClick?: () => void;
}

const ReactionVisualization = ({ isReversible, isPlaying, speed, onReverseClick }: ReactionVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const [countA, setCountA] = useState(80);
  const [countB, setCountB] = useState(20);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const particles: Particle[] = [];

    // Start with mostly A molecules
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'A',
      });
    }

    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'B',
      });
    }

    particlesRef.current = particles;
    timeRef.current = 0;
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw container
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      const particles = particlesRef.current;
      let currentCountA = 0;
      let currentCountB = 0;

      // Update and draw particles
      particles.forEach((particle) => {
        // Move particle
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        // Bounce off walls
        if (particle.x < 15 || particle.x > width - 15) {
          particle.vx *= -1;
          particle.x = Math.max(15, Math.min(width - 15, particle.x));
        }
        if (particle.y < 15 || particle.y > height - 15) {
          particle.vy *= -1;
          particle.y = Math.max(15, Math.min(height - 15, particle.y));
        }

        // Count particles
        if (particle.type === 'A') currentCountA++;
        else currentCountB++;

                // Draw particle
        const color = particle.type === 'A' 
          ? '#4A90E2'  // Bright blue for A
          : '#FF8C42'; // Bright orange for B
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
        ctx.fill();

                // Draw label on a fixed subset of particles (deterministic)
        const particleIndex = particles.indexOf(particle);
        if (particleIndex % 20 === 0) {
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
          ctx.font = '10px monospace';
          ctx.fillText(particle.type, particle.x - 3, particle.y - 8);
        }
      });

      // Chemical reaction logic
      timeRef.current += 0.016 * speed;

      if (isReversible) {
        // Reversible: A ⇌ B (reaches equilibrium)
        const forwardRate = 0.008 * speed;
        const reverseRate = 0.006 * speed;

        particles.forEach((particle) => {
          if (particle.type === 'A' && Math.random() < forwardRate) {
            particle.type = 'B';
          } else if (particle.type === 'B' && Math.random() < reverseRate) {
            particle.type = 'A';
          }
        });
      } else {
        // Irreversible: A → B (goes to completion)
        const forwardRate = 0.012 * speed;

        particles.forEach((particle) => {
          if (particle.type === 'A' && Math.random() < forwardRate) {
            particle.type = 'B';
          }
        });
      }

      setCountA(currentCountA);
      setCountB(currentCountB);

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, speed, isReversible]);

  const totalCount = countA + countB;
  const concentrationA = (countA / totalCount * 100).toFixed(1);
  const concentrationB = (countB / totalCount * 100).toFixed(1);

    // Calculate rates and entropy
  const forwardRate = isReversible ? (countA / totalCount * 0.8).toFixed(2) : (countA / totalCount * 1.2).toFixed(2);
  const reverseRate = isReversible ? (countB / totalCount * 0.6).toFixed(2) : '0.00';
  const entropyChange = isReversible 
    ? Math.abs(parseFloat(forwardRate) - parseFloat(reverseRate)).toFixed(2)
    : (countB / totalCount * 0.5).toFixed(2);
  const keq = isReversible ? (countB / Math.max(countA, 1)).toFixed(2) : 'N/A';

  return (
    <div className={styles.reactionVizContainer}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className={styles.reactionCanvas}
        />
        <div className={styles.reactionArrow}>
          {isReversible ? '⇌' : '→'}
        </div>
      </div>

      <div className={styles.dataDisplay}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>[A] Conc.</span>
          <span className={styles.dataValue} style={{ color: 'var(--primary)' }}>{concentrationA}%</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>[B] Conc.</span>
          <span className={styles.dataValue} style={{ color: 'var(--secondary)' }}>{concentrationB}%</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Forward Rate</span>
          <span className={styles.dataValue}>{forwardRate}</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Reverse Rate</span>
          <span className={styles.dataValue}>{reverseRate}</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>ΔS</span>
          <span className={styles.dataValue} style={{ color: parseFloat(entropyChange) < 0.01 ? 'var(--success)' : 'var(--warning)' }}>
            {entropyChange} J/K
          </span>
        </div>
        {isReversible && (
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>K<sub>eq</sub></span>
            <span className={styles.dataValue}>{keq}</span>
          </div>
        )}
      </div>

      {isReversible && onReverseClick && (
        <Button onClick={onReverseClick} variant="outline" size="sm" className={styles.reverseButton}>
          <RotateCcw size={16} /> Reverse Direction
        </Button>
      )}
    </div>
  );
};

const ReversibleProcessesPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const reset = () => {
    setIsPlaying(false);
    setResetKey(prev => prev + 1);
  };

  const handleReverse = () => {
    console.log('Reverse direction triggered for reversible reaction');
    // This is handled by the internal animation logic
    setResetKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>Reversible vs. Irreversible Processes | Thermodynamics Series</title>
        <meta
          name="description"
          content="Compare reversible and irreversible chemical reactions. Understand equilibrium, reaction rates, and entropy generation."
        />
      </Helmet>
      <div className={styles.pageLayout}>
        <main className={styles.simulationContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reversible vs. Irreversible Processes</h1>
            <p className={styles.subtitle}>Chemical Reaction Simulation</p>
          </div>
          <div className={styles.comparisonGrid}>
            <div className={styles.processContainer}>
              <h3 className={styles.processTitle}>
                Reversible Process
                <span className={styles.badge} style={{ backgroundColor: 'var(--success)', color: 'var(--success-foreground)' }}>
                  A ⇌ B
                </span>
              </h3>
              <ReactionVisualization 
                key={`rev-${resetKey}`} 
                isReversible={true} 
                isPlaying={isPlaying} 
                speed={speed}
                onReverseClick={handleReverse}
              />
              <p className={styles.processDescription}>
                <strong>Equilibrium reaction:</strong> Molecules A convert to B and B converts back to A simultaneously. 
                At equilibrium, forward rate = reverse rate. The system can return to its original state.
                <strong> ΔS → 0</strong> as equilibrium is reached.
              </p>
            </div>
            <div className={styles.processContainer}>
              <h3 className={styles.processTitle}>
                Irreversible Process
                <span className={styles.badge} style={{ backgroundColor: 'var(--error)', color: 'var(--error-foreground)' }}>
                  A → B
                </span>
              </h3>
              <ReactionVisualization 
                key={`irrev-${resetKey}`} 
                isReversible={false} 
                isPlaying={isPlaying} 
                speed={speed}
              />
              <p className={styles.processDescription}>
                <strong>Completion reaction:</strong> All A molecules convert to B with no reverse reaction. 
                The system cannot spontaneously return to its original state.
                <strong> ΔS &gt; 0</strong> and entropy continuously increases.
              </p>
            </div>
          </div>
          <div className={styles.controls}>
            <Button onClick={() => setIsPlaying(!isPlaying)} size="lg">
              {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
            </Button>
            <div className={styles.sliderGroup}>
              <label>Animation Speed</label>
              <Slider min={0.5} max={3} step={0.1} value={[speed]} onValueChange={(v) => setSpeed(v[0])} />
            </div>
            <Button onClick={reset} variant="outline" size="lg">
              <RefreshCw size={20} /> Reset
            </Button>
          </div>
          <footer className={styles.navigationFooter}>
            <Button asChild variant="outline">
              <Link to="/simulations/gibbs-free-energy">
                <ArrowLeft size={16} /> Previous: Gibbs Free Energy
              </Link>
            </Button>
            <Button asChild>
              <Link to="/simulations/spontaneous-reactions">
                Next: Spontaneous Reactions <ArrowRight size={16} />
              </Link>
            </Button>
          </footer>
        </main>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            <Info size={20} />
            Chemical Equilibrium & Reversibility
          </h2>
          <div className={styles.sidebarContent}>
            <p>
              In thermodynamics, reversibility is fundamentally about whether a process can return to its initial state without leaving permanent changes in the universe.
            </p>
            
            <h3>Reversible Process: Dynamic Equilibrium</h3>
            <p>
              A reversible chemical reaction (A ⇌ B) reaches dynamic equilibrium where forward and reverse reactions occur at equal rates. The system appears static, but molecules continuously interconvert.
            </p>
            <ul>
              <li><strong>Bidirectional:</strong> Both forward (A → B) and reverse (B → A) reactions occur.</li>
              <li><strong>Equilibrium State:</strong> Concentrations remain constant when forward rate = reverse rate.</li>
              <li><strong>Equilibrium Constant (K<sub>eq</sub>):</strong> K<sub>eq</sub> = [B]/[A] at equilibrium.</li>
              <li><strong>Minimal Entropy:</strong> At equilibrium, ΔS<sub>universe</sub> ≈ 0. The system is in its most probable state.</li>
              <li><strong>Reversibility:</strong> Small changes can shift equilibrium in either direction (Le Chatelier's principle).</li>
            </ul>
            
            <h3>Irreversible Process: Goes to Completion</h3>
            <p>
              An irreversible reaction (A → B) proceeds in only one direction until all reactants are consumed. There is no significant reverse reaction.
            </p>
            <ul>
              <li><strong>Unidirectional:</strong> Only the forward reaction (A → B) occurs at significant rate.</li>
              <li><strong>Complete Conversion:</strong> Reaction continues until [A] ≈ 0 and [B] is maximized.</li>
              <li><strong>No Equilibrium:</strong> System does not settle into a balanced state.</li>
              <li><strong>Entropy Increases:</strong> ΔS<sub>universe</sub> &gt; 0. Energy disperses irreversibly.</li>
              <li><strong>Cannot Spontaneously Reverse:</strong> The system will not return to high [A] without external work.</li>
            </ul>

            <h3>Key Insight: Reaction Arrows Matter</h3>
            <p>
              The double arrow (⇌) indicates a reversible, equilibrium-seeking process. The single arrow (→) indicates an irreversible, completion-driven process. This distinction is crucial in thermodynamics and chemistry.
            </p>

            <div className={styles.callout}>
              <strong>Real-World Examples:</strong>
              <br />• <strong>Reversible:</strong> H₂O(l) ⇌ H₂O(g) — water and vapor in a closed container reach equilibrium.
              <br />• <strong>Irreversible:</strong> 2H₂ + O₂ → 2H₂O (combustion) — hydrogen burns completely, does not spontaneously reform.
            </div>

            <h3>Thermodynamic Significance</h3>
            <p>
              Reversible processes represent ideal, equilibrium-controlled transformations with minimum entropy generation. Irreversible processes are spontaneous, one-way changes that increase universal entropy. Understanding this distinction is essential for predicting reaction behavior and designing efficient chemical processes.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ReversibleProcessesPage;