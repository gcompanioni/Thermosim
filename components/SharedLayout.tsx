import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Beaker } from "lucide-react";
import styles from "./SharedLayout.module.css";

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout = ({ children }: SharedLayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className={styles.layout}>
      <header className={`${styles.header} ${isHomePage ? styles.transparentHeader : ""}`}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <Beaker size={24} />
            <span>Thermodynamics Series</span>
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};