"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [testId, setTestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLink, setTestLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateLink = async (id?: string) => {
    const idToUse = id || testId;
    
    if (!idToUse.trim()) {
      setError("Please enter a Test ID");
      return;
    }

    setLoading(true);
    setError("");
    setTestLink("");
    setCopied(false);

    try {
      const response = await axios.post(`/api/public/tests/${idToUse}/link`);
      setTestLink(response.data.url);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        "Failed to generate test link"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTestLink = () => {
    window.open(testLink, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Generate Test Link</h1>
        <p style={styles.subtitle}>Create and start a test instantly</p>

        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Test ID (MongoDB ObjectId)</label>
            <input
              type="text"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Paste MongoDB Test ID here"
              style={styles.input}
              onKeyPress={(e) => {
                if (e.key === "Enter") generateLink();
              }}
            />
            <small style={styles.helperText}>
              Example: 507f1f77bcf86cd799439011
            </small>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={() => generateLink()}
              disabled={loading || !testId.trim()}
              style={{
                ...styles.primaryBtn,
                opacity: loading || !testId.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "Generating..." : "Generate Link"}
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠ {error}
            </div>
          )}

          {testLink && (
            <div style={styles.successBox}>
              <p style={styles.successTitle}>✓ Test Link Generated!</p>
              
              <div style={styles.linkDisplay}>
                <p style={styles.linkLabel}>Your test link:</p>
                <code style={styles.linkCode}>{testLink}</code>
              </div>

              <div style={styles.actionButtons}>
                <button 
                  onClick={openTestLink}
                  style={{...styles.actionBtn, background: "#4caf50"}}
                >
                  ▶ Open Test
                </button>
                <button 
                  onClick={copyToClipboard}
                  style={{...styles.actionBtn, background: "#2196F3"}}
                >
                  {copied ? "✓ Copied!" : "📋 Copy Link"}
                </button>
              </div>

              <p style={styles.note}>
                Share this link with candidates. It can only be used once and expires in 60 minutes.
              </p>
            </div>
          )}
        </div>

        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>How it works:</h3>
          <ol style={styles.infoList}>
            <li>Have a Test ID from your MongoDB database</li>
            <li>Paste it above and click "Generate Link"</li>
            <li>Click "Open Test" to start the test immediately</li>
            <li>Or copy the link to share with others</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
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
    margin: "0 0 30px 0",
  },
  form: {
    marginBottom: "30px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#111",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontFamily: "monospace",
    transition: "border-color 0.2s",
  },
  helperText: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    color: "#999",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "10px",
    background: "#667eea",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  errorBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#ffebee",
    border: "1px solid #ef5350",
    borderRadius: "8px",
    color: "#c62828",
    fontSize: "14px",
    fontWeight: 500,
  },
  successBox: {
    marginTop: "20px",
    padding: "20px",
    background: "#e8f5e9",
    border: "2px solid #4caf50",
    borderRadius: "12px",
  },
  successTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "#2e7d32",
  },
  linkDisplay: {
    marginBottom: "16px",
  },
  linkLabel: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    fontWeight: 600,
    color: "#555",
    textTransform: "uppercase",
  },
  linkCode: {
    display: "block",
    padding: "12px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "monospace",
    wordBreak: "break-all",
    color: "#667eea",
    lineHeight: "1.4",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "12px",
  },
  actionBtn: {
    padding: "12px 16px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.2s",
  },
  note: {
    margin: "0",
    fontSize: "12px",
    color: "#555",
    fontStyle: "italic",
  },
  infoBox: {
    padding: "16px",
    background: "#f5f5f5",
    borderRadius: "12px",
    borderLeft: "4px solid #667eea",
  },
  infoTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111",
  },
  infoList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#555",
    fontSize: "13px",
    lineHeight: "1.8",
  },
};
