import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import styles from "./LiftingWeightsSimulation.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const LiftingWeightsSimulation = () => {
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [initialPressure, setInitialPressure] = useState(5); // atm
  const [volume, setVolume] = useState(5); // liters
  const [pressure, setPressure] = useState(5); // atm
  const [workDone, setWorkDone] = useState(0); // Joules
  const [isAnimating, setIsAnimating] = useState(false);
  const [processType, setProcessType] = useState<"idle" | "expansion" | "compression">("idle");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(Date.now());
  const currentPistonYRef = useRef<number>(0);
  const currentCylinderHeightRef = useRef<number>(0);

  const numParticles = 50;
  const cylinderWidth = 200;
  const maxCylinderHeight = 400;
  const minCylinderHeight = 100;
  const pistonHeight = 20;

  // Calculate cylinder height based on volume (volume 1-10 liters maps to height range)
  const cylinderHeight = minCylinderHeight + ((volume - 1) / 9) * (maxCylinderHeight - minCylinderHeight);
  const pistonY = maxCylinderHeight - cylinderHeight;

  // Update refs so animation loop always has current values
  currentPistonYRef.current = pistonY;
  currentCylinderHeightRef.current = cylinderHeight;

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * (cylinderWidth - 20) + 10,
        y: pistonY + pistonHeight + Math.random() * (cylinderHeight - pistonHeight - 20) + 10,
        vx: (Math.random() - 0.5) * (temperature / 150),
        vy: (Math.random() - 0.5) * (temperature / 150),
      });
    }
    particlesRef.current = particles;
  }, []);

  // Update particle velocities when temperature changes
  useEffect(() => {
    const speedFactor = temperature / 300;
    particlesRef.current.forEach(particle => {
      const currentSpeed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      const targetSpeed = (temperature / 150) * 0.5;
      if (currentSpeed > 0) {
        const scale = targetSpeed / currentSpeed;
        particle.vx *= scale;
        particle.vy *= scale;
      }
    });
  }, [temperature]);

  // Constrain particles when piston moves (especially during compression)
  useEffect(() => {
    const currentPistonY = pistonY;
    const minParticleY = currentPistonY + pistonHeight + 5;
    
    particlesRef.current.forEach(particle => {
      // If particle is above the piston, push it down below the piston
      if (particle.y < minParticleY) {
        particle.y = minParticleY;
        // Reverse y velocity to bounce it downward
        if (particle.vy < 0) {
          particle.vy = Math.abs(particle.vy);
        }
      }
    });
  }, [pistonY, pistonHeight]);

  // Particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Read current values from refs to get real-time piston position
      const currentPistonY = currentPistonYRef.current;
      const currentCylinderHeight = currentCylinderHeightRef.current;

      // Apply clipping to gas region (below piston, within cylinder)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, currentPistonY + pistonHeight, cylinderWidth, Math.max(0, maxCylinderHeight - (currentPistonY + pistonHeight)));
      ctx.clip();

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x <= 5 || particle.x >= cylinderWidth - 5) {
          particle.vx *= -1;
          particle.x = Math.max(5, Math.min(cylinderWidth - 5, particle.x));
        }

        // Bounce off piston (top)
        if (particle.y <= currentPistonY + pistonHeight + 5) {
          particle.vy = Math.abs(particle.vy);
          particle.y = currentPistonY + pistonHeight + 5;
        }

        // Bounce off bottom
        if (particle.y >= maxCylinderHeight - 5) {
          particle.vy = -Math.abs(particle.vy);
          particle.y = maxCylinderHeight - 5;
        }

        // Keep particles in bounds
        particle.x = Math.max(5, Math.min(cylinderWidth - 5, particle.x));
        particle.y = Math.max(currentPistonY + pistonHeight + 5, Math.min(maxCylinderHeight - 5, particle.y));

        // Draw particle
        const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
        const hue = 200 + speed * 20; // Bluer when slower, more towards red when faster
        ctx.fillStyle = `hsl(${Math.min(hue, 360)}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Restore context after clipping
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Empty deps - animation loop runs independently and reads from refs

  // Update pressure using ideal gas law: PV = nRT
  useEffect(() => {
    // P1V1/T1 = P2V2/T2
    // Keep n (moles) constant, so P ∝ T/V
    const newPressure = (initialPressure * 5 * temperature) / (volume * 300);
    setPressure(newPressure);
  }, [volume, temperature, initialPressure]);

  const handleExpand = () => {
    if (isAnimating || volume >= 10) return;
    
    setIsAnimating(true);
    setProcessType("expansion");
    
    const startVolume = volume;
    const endVolume = Math.min(10, volume + 2);
    const startPressure = pressure;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animateExpansion = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentVolume = startVolume + (endVolume - startVolume) * progress;
      setVolume(currentVolume);

      // Calculate work done: W = -∫P dV
      // For expansion, work is done BY the gas (positive)
      // Using average pressure approximation: W ≈ -P_avg * ΔV
      const currentPressure = (initialPressure * 5 * temperature) / (currentVolume * 300);
      const avgPressure = (startPressure + currentPressure) / 2;
      const deltaV = (currentVolume - startVolume) / 1000; // Convert liters to m³
      const work = -avgPressure * 101325 * deltaV; // Convert atm to Pa and calculate
      setWorkDone(work);

      if (progress < 1) {
        requestAnimationFrame(animateExpansion);
      } else {
        setIsAnimating(false);
        setProcessType("idle");
      }
    };

    animateExpansion();
  };

  const handleCompress = () => {
    if (isAnimating || volume <= 1) return;
    
    setIsAnimating(true);
    setProcessType("compression");
    
    const startVolume = volume;
    const endVolume = Math.max(1, volume - 2);
    const startPressure = pressure;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animateCompression = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentVolume = startVolume - (startVolume - endVolume) * progress;
      setVolume(currentVolume);

      // Calculate work done: W = -∫P dV
      // For compression, work is done ON the gas (negative)
      const currentPressure = (initialPressure * 5 * temperature) / (currentVolume * 300);
      const avgPressure = (startPressure + currentPressure) / 2;
      const deltaV = (currentVolume - startVolume) / 1000; // Convert liters to m³
      const work = -avgPressure * 101325 * deltaV; // Convert atm to Pa and calculate
      setWorkDone(work);

      if (progress < 1) {
        requestAnimationFrame(animateCompression);
      } else {
        setIsAnimating(false);
        setProcessType("idle");
      }
    };

    animateCompression();
  };

  const handleReset = () => {
    setVolume(5);
    setPressure(initialPressure);
    setWorkDone(0);
    setIsAnimating(false);
    setProcessType("idle");
  };

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.subtitle}>Piston-Cylinder Work - Thermodynamic Expansion/Compression</h2>
        <div className={styles.dataDisplay}>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Volume:</span>
            <span className={styles.dataValue}>{volume.toFixed(2)} L</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Pressure:</span>
            <span className={styles.dataValue}>{pressure.toFixed(2)} atm</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Temperature:</span>
            <span className={styles.dataValue}>{temperature} K</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Work Done:</span>
            <span className={styles.dataValue} style={{ color: workDone > 0 ? 'var(--success)' : workDone < 0 ? 'var(--error)' : 'inherit' }}>
              {workDone.toFixed(1)} J
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.pistonContainer}>
          <svg viewBox="0 0 300 500" className={styles.pistonSvg}>
            {/* Cylinder body */}
            <rect
              x="50"
              y="50"
              width={cylinderWidth}
              height={maxCylinderHeight}
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
              rx="5"
            />
            
            {/* Cylinder left wall (thick) */}
            <rect
              x="35"
              y="50"
              width="15"
              height={maxCylinderHeight}
              fill="hsl(220, 15%, 70%)"
              stroke="hsl(220, 15%, 50%)"
              strokeWidth="2"
              rx="3"
            />
            
            {/* Cylinder right wall (thick) */}
            <rect
              x={50 + cylinderWidth}
              y="50"
              width="15"
              height={maxCylinderHeight}
              fill="hsl(220, 15%, 70%)"
              stroke="hsl(220, 15%, 50%)"
              strokeWidth="2"
              rx="3"
            />

            {/* Cylinder bottom (thick) */}
            <rect
              x="35"
              y={50 + maxCylinderHeight}
              width={cylinderWidth + 30}
              height="15"
              fill="hsl(220, 15%, 70%)"
              stroke="hsl(220, 15%, 50%)"
              strokeWidth="2"
              rx="3"
            />

            {/* Volume scale markers */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vol) => {
              const y = 50 + maxCylinderHeight - ((vol - 1) / 9) * (maxCylinderHeight - minCylinderHeight) - minCylinderHeight;
              return (
                <g key={vol}>
                  <line x1="30" y1={y} x2="40" y2={y} stroke="var(--muted-foreground)" strokeWidth="1.5" />
                  <text x="25" y={y + 4} fill="var(--muted-foreground)" fontSize="10" textAnchor="end" fontFamily="var(--font-family-monospace)">
                    {vol}L
                  </text>
                </g>
              );
            })}

            {/* Piston */}
            <rect
              x="35"
              y={50 + pistonY}
              width={cylinderWidth + 30}
              height={pistonHeight}
              fill="hsl(30, 60%, 50%)"
              stroke="hsl(30, 60%, 30%)"
              strokeWidth="2"
              rx="2"
            />

            {/* Piston rod */}
            <rect
              x="145"
              y="20"
              width="10"
              height={pistonY + 30}
              fill="hsl(0, 0%, 60%)"
              stroke="hsl(0, 0%, 40%)"
              strokeWidth="2"
            />

            {/* Piston handle */}
            <circle
              cx="150"
              cy="20"
              r="8"
              fill="hsl(0, 0%, 50%)"
              stroke="hsl(0, 0%, 30%)"
              strokeWidth="2"
            />

            {/* Pressure indicator */}
            <g transform="translate(270, 100)">
              <circle cx="0" cy="0" r="25" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="0" y="-15" fill="var(--muted-foreground)" fontSize="8" textAnchor="middle" fontWeight="600">PRESSURE</text>
              <text x="0" y="5" fill="var(--foreground)" fontSize="12" textAnchor="middle" fontFamily="var(--font-family-monospace)" fontWeight="600">
                {pressure.toFixed(1)}
              </text>
              <text x="0" y="15" fill="var(--muted-foreground)" fontSize="8" textAnchor="middle">atm</text>
            </g>

            {/* Process indicator */}
            {processType !== "idle" && (
              <g transform="translate(150, 250)">
                {processType === "expansion" ? (
                  <>
                    <text x="0" y="0" fill="var(--success)" fontSize="14" textAnchor="middle" fontWeight="600">
                      ⬆ EXPANSION
                    </text>
                    <text x="0" y="15" fill="var(--success)" fontSize="10" textAnchor="middle">
                      Work BY gas (+)
                    </text>
                  </>
                ) : (
                  <>
                    <text x="0" y="0" fill="var(--error)" fontSize="14" textAnchor="middle" fontWeight="600">
                      ⬇ COMPRESSION
                    </text>
                    <text x="0" y="15" fill="var(--error)" fontSize="10" textAnchor="middle">
                      Work ON gas (-)
                    </text>
                  </>
                )}
              </g>
            )}
          </svg>

          {/* Canvas for particles */}
          <canvas
            ref={canvasRef}
            width={cylinderWidth}
            height={maxCylinderHeight}
            className={styles.particleCanvas}
            style={{
              position: 'absolute',
              left: '16.6667%',
              top: '10%',
              width: '66.6667%',
              height: '80%',
            }}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <Button 
            onClick={handleExpand} 
            variant="primary" 
            size="lg" 
            disabled={isAnimating || volume >= 10}
          >
            <ArrowUp size={20} />
            Expand
          </Button>
          <Button 
            onClick={handleCompress} 
            variant="secondary" 
            size="lg" 
            disabled={isAnimating || volume <= 1}
          >
            <ArrowDown size={20} />
            Compress
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw size={20} />
            Reset
          </Button>
        </div>
        <div className={styles.sliderGroup}>
          <label>Temperature: {temperature} K</label>
          <Slider 
            min={200} 
            max={600} 
            step={10} 
            value={[temperature]} 
            onValueChange={(v) => setTemperature(v[0])} 
            disabled={isAnimating} 
          />
        </div>
        <div className={styles.sliderGroup}>
          <label>Initial Pressure: {initialPressure} atm</label>
          <Slider 
            min={1} 
            max={10} 
            step={0.5} 
            value={[initialPressure]} 
            onValueChange={(v) => setInitialPressure(v[0])} 
            disabled={isAnimating} 
          />
        </div>
      </div>
    </>
  );
};