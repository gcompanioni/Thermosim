import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Atom,
  Scale,
  Thermometer,
  Zap,
  Recycle,
  FlaskConical,
  Activity,
  Box,
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import styles from "./_index.module.css";

const SIMULATIONS = [
  {
    title: "Entropy & Disorder",
    description: "Explore the measure of randomness in a system.",
    icon: Atom,
    link: "/simulations/entropy",
    status: "active",
  },
  {
    title: "Work & Energy",
    description: "Understand how energy transfer relates to work done.",
    icon: Activity,
    link: "/simulations/work",
    status: "active",
  },
  {
    title: "The Three Laws",
    description: "Understand the fundamental laws governing energy.",
    icon: Scale,
    link: "/simulations/three-laws",
    status: "active",
  },
  {
    title: "Enthalpy & Heat",
    description: "Visualize the total heat content of a system.",
    icon: Thermometer,
    link: "/simulations/enthalpy",
    status: "active",
  },
  {
    title: "Gibbs Free Energy",
    description: "Calculate the maximum work a system can perform.",
    icon: Zap,
    link: "/simulations/gibbs-free-energy",
    status: "active",
  },
  {
    title: "System & Surrounding",
    description: "Learn about system boundaries and energy exchange.",
    icon: Box,
    link: "/simulations/system-surrounding",
    status: "active",
  },
  {
    title: "Reversible Processes",
    description: "Compare ideal processes with irreversible ones.",
    icon: Recycle,
    link: "/simulations/reversible-processes",
    status: "active",
  },
  {
    title: "Spontaneous Reactions",
    description: "Predict if a reaction will occur without input.",
    icon: FlaskConical,
    link: "/simulations/spontaneous-reactions",
    status: "active",
  },
];

const IndexPage = () => {
  return (
    <>
      <Helmet>
        <title>Thermodynamics Simulation Series</title>
        <meta
          name="description"
          content="Learn thermodynamics through a series of interactive, modern simulations. Explore concepts like entropy, enthalpy, and Gibbs free energy."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Thermodynamics
                <br />
                Simulation Series
              </h1>
              <p className={styles.heroTagline}>
                by Giancarlo Companioni and Andro Luna
              </p>
              <Button asChild size="lg" className={styles.heroCta}>
                <Link to="/simulations/entropy">
                  Start with Entropy <ArrowRight size={20} />
                </Link>
              </Button>
            </div>
            <div className={styles.heroImageContainer}>
              <img
                                src="https://assets.floot.app/b26bb4e1-d953-459b-bcd2-d98e2730806a/8d644f45-79e1-4b8b-8f4c-197c30608599.webp"
                alt="Abstract representation of energy and matter"
                className={styles.heroImage}
              />
              <div className={styles.heroImageOverlay} />
            </div>
          </section>

          <section className={styles.introSection}>
            <h2 className={styles.sectionTitle}>What is Thermodynamics?</h2>
            <p className={styles.introText}>
              Thermodynamics is the branch of science that deals with the
              relationships between heat and other forms of energy. It's the
              study of energy, its transformations, and its ability to do work.
              From the engines that power our world to the chemical reactions
              that sustain life, the principles of thermodynamics are
              fundamental to understanding the universe.
            </p>
          </section>

          <section className={styles.simulationsSection}>
            <h2 className={styles.sectionTitle}>Explore the Simulations</h2>
            <div className={styles.simulationsGrid}>
              {SIMULATIONS.map((sim) => (
                <Link
                  to={sim.link}
                  key={sim.title}
                  className={`${styles.simulationCard} ${sim.status === "coming-soon" ? styles.disabledCard : ""}`}
                  onClick={(e) => sim.status === "coming-soon" && e.preventDefault()}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      <sim.icon size={24} />
                    </div>
                    {sim.status === "coming-soon" && (
                      <Badge variant="secondary">Coming Soon</Badge>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{sim.title}</h3>
                  <p className={styles.cardDescription}>{sim.description}</p>
                  <div className={styles.cardFooter}>
                    <span>
                      {sim.status === "active"
                        ? "Launch Simulation"
                        : "Learn More"}
                    </span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default IndexPage;