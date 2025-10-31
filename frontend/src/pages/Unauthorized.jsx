// src/pages/Unauthorized.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>403 - Accès refusé</h1>
      <p style={styles.message}>
        Tu n'as pas l'autorisation d'accéder à cette page.
      </p>
      <Link to="/" style={styles.link}>
        Retour à l'accueil
      </Link>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
  },
  title: {
    fontSize: "3rem",
    color: "#e74c3c",
  },
  message: {
    fontSize: "1.2rem",
    marginTop: "20px",
    marginBottom: "30px",
  },
  link: {
    fontSize: "1rem",
    color: "#3498db",
    textDecoration: "none",
  },
};
