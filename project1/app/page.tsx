"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Online Test Platform</h1>
          <p style={styles.subtitle}>Secure and Proctored Testing</p>
        </div>

        <div style={styles.content}>
          <div style={styles.infoBox}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={styles.icon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p style={styles.infoTitle}>How to Access Your Test</p>
              <p style={styles.infoText}>
                You will receive a unique test link via email from your administrator.
                Click that link to start your test. The test link can only be used once.
              </p>
            </div>
          </div>

          <div style={styles.exampleBox}>
            <p style={styles.exampleTitle}>Test Link Format:</p>
            <code style={styles.codeBlock}>
              http://192.168.1.6:3000/test?token=YOUR_UNIQUE_TOKEN
            </code>
            <p style={styles.exampleNote}>
              Your administrator will provide you with the complete link.
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.buttonGroup}>
            <Link href="/apply" style={{ textDecoration: "none" }}>
              <button style={styles.applyBtn}>
                Apply Now →
              </button>
            </Link>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              style={styles.instructionBtn}
            >
              {showInstructions ? "Hide" : "Show"} Instructions
            </button>
          </div>

          {showInstructions && (
            <div style={styles.instructions}>
              <h3 style={styles.instructionTitle}>How to Use</h3>
              <ul style={styles.instructionList}>
                <li>Receive a test token from your administrator</li>
                <li>Paste the token in the form above</li>
                <li>The test will enter fullscreen mode automatically</li>
                <li>You will have a time limit to complete the test</li>
                <li>Switching tabs or losing focus will record violations</li>
                <li>Submit when you are done with all questions</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center" as any,
    justifyContent: "center" as any,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "16px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    padding: "40px",
  },
  header: {
    marginBottom: "32px",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "0 0 8px 0",
    color: "#111",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  content: {
    marginBottom: "32px",
  },
  infoBox: {
    display: "flex" as const,
    gap: "12px",
    padding: "20px",
    background: "#f0f4ff",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #d0d9ff",
  },
  icon: {
    flexShrink: 0,
    color: "#667eea",
    marginTop: "2px",
  },
  infoTitle: {
    margin: "0 0 8px 0",
    fontSize: "15px",
    fontWeight: 600,
    color: "#111",
  },
  infoText: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
  },
  exampleBox: {
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  },
  exampleTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111",
  },
  codeBlock: {
    display: "block" as const,
    padding: "12px",
    background: "#fff",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#667eea",
    border: "1px solid #e0e0e0",
    wordBreak: "break-all" as const,
    fontFamily: "monospace",
  },
  exampleNote: {
    margin: "10px 0 0 0",
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "10px",
    background: "#667eea",
    color: "#fff",
    cursor: "pointer" as const,
    transition: "all 0.2s",
  } as React.CSSProperties,
  footer: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  buttonGroup: {
    display: "flex" as const,
    gap: "10px",
    flexDirection: "column" as const,
  },
  applyBtn: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    cursor: "pointer" as const,
    transition: "all 0.2s",
  } as React.CSSProperties,
  instructionBtn: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 600,
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    color: "#667eea",
    cursor: "pointer" as const,
  } as React.CSSProperties,
  instructions: {
    marginTop: "16px",
    padding: "16px",
    background: "#f9f9f9",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  instructionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111",
  },
  instructionList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#555",
  },
};
