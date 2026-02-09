"use client";

import { useState } from "react";
import axios from "axios";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#333",
    marginBottom: "10px",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "30px",
    textAlign: "center" as const,
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#333",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  fileInput: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px dashed #e0e0e0",
    borderRadius: "6px",
    boxSizing: "border-box" as const,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  toggleGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  toggleBtn: {
    flex: 1,
    padding: "10px",
    border: "2px solid #e0e0e0",
    background: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
  toggleBtnActive: {
    background: "#667eea",
    color: "white",
    borderColor: "#667eea",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 700,
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
  },
  successBox: {
    background: "#e8f5e9",
    border: "2px solid #4caf50",
    borderRadius: "6px",
    padding: "15px",
    marginTop: "20px",
    color: "#2e7d32",
    fontSize: "14px",
    fontWeight: 600,
  },
  errorBox: {
    background: "#ffebee",
    border: "2px solid #f44336",
    borderRadius: "6px",
    padding: "15px",
    marginTop: "20px",
    color: "#c62828",
    fontSize: "14px",
    fontWeight: 600,
  },
  helperText: {
    fontSize: "12px",
    color: "#999",
    marginTop: "5px",
  },
};

export default function ApplyPage() {
  const [resumeType, setResumeType] = useState<"link" | "upload">("link");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resumeLink: "",
    resumeFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setMessage("Please upload a PDF file");
        setMessageType("error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("File size must be less than 5MB");
        setMessageType("error");
        return;
      }
      setFormData((prev) => ({ ...prev, resumeFile: file }));
      setMessage("");
      setMessageType("");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage("Please enter your name");
      setMessageType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return false;
    }

    if (resumeType === "link" && !formData.resumeLink.trim()) {
      setMessage("Please enter your resume link");
      setMessageType("error");
      return false;
    }

    if (resumeType === "upload" && !formData.resumeFile) {
      setMessage("Please upload your resume PDF");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      setMessage("N8N webhook URL is missing. Please contact support.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let resumeData = {};

      if (resumeType === "link") {
        resumeData = { 
          resumeFile: {
            name: formData.resumeLink,
            type: "link"
          }
        };
      } else if (formData.resumeFile) {
        // Convert file to base64 for sending to n8n
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(formData.resumeFile!);
        });

        resumeData = {
          resumeFile: {
            name: formData.resumeFile.name,
            type: formData.resumeFile.type,
            size: formData.resumeFile.size,
            data: base64Data,
          },
        };
      }

      const payload = {
        body: {
          name: formData.name,
          email: formData.email,
          resumeType,
          ...resumeData,
          submittedAt: new Date().toISOString(),
        }
      };

      const response = await axios.post(n8nWebhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.ok) {
        setMessage("✓ Application submitted successfully! We'll review it and get back to you soon.");
        setMessageType("success");
        setFormData({ name: "", email: "", resumeLink: "", resumeFile: null });
      } else {
        throw new Error("Submission failed");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit application. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Apply Now</h1>
        <p style={styles.subtitle}>Join our team by submitting your details</p>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              placeholder="John Doe"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              placeholder="john@example.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Resume Type Toggle */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Resume *</label>
            <div style={styles.toggleGroup}>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(resumeType === "link" ? styles.toggleBtnActive : {}),
                }}
                onClick={() => setResumeType("link")}
                disabled={loading}
              >
                Link
              </button>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(resumeType === "upload" ? styles.toggleBtnActive : {}),
                }}
                onClick={() => setResumeType("upload")}
                disabled={loading}
              >
                Upload PDF
              </button>
            </div>
          </div>

          {/* Resume Input */}
          {resumeType === "link" ? (
            <div style={styles.formGroup}>
              <input
                type="url"
                name="resumeLink"
                value={formData.resumeLink || ""}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/..."
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.helperText}>
                Paste a link to your resume (Google Drive, Dropbox, etc.)
              </p>
            </div>
          ) : (
            <div style={styles.formGroup}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={styles.fileInput}
                disabled={loading}
              />
              <p style={styles.helperText}>
                {formData.resumeFile
                  ? `Selected: ${formData.resumeFile.name}`
                  : "PDF only, max 5MB"}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={styles.primaryBtn}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                (e.currentTarget).style.transform = "translateY(-2px)";
                (e.currentTarget).style.boxShadow = "0 10px 20px rgba(102, 126, 234, 0.3)";
              }
            }}
            onMouseOut={(e) => {
              (e.currentTarget).style.transform = "translateY(0)";
              (e.currentTarget).style.boxShadow = "none";
            }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>

          {/* Messages */}
          {message && (
            <div style={messageType === "success" ? styles.successBox : styles.errorBox}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}