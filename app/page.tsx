"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";

type AnalysisResult = {
  data?: unknown;
  error?: string;
};

export default function HomePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [question, setQuestion] = useState("Describe this oral issue.");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setResult(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setResult(null);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setResult(null);

    try {
      const body = new FormData();
      body.append("image", imageFile);
      body.append("question", question);

      const res = await fetch("/api/analyse", {
        method: "POST",
        body,
      });

      const json: AnalysisResult = await res.json();
      setResult(json);
    } catch {
      setResult({ error: "Network error — could not reach the server." });
    } finally {
      setLoading(false);
    }
  }

  function formatResult(data: unknown): string {
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.map(formatResult).join("\n\n");
    if (data && typeof data === "object") return JSON.stringify(data, null, 2);
    return String(data);
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dental Image Analysis</h1>
          <p style={styles.subtitle}>
            Powered by MedGemma — upload an oral image and ask a clinical
            question.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Drop zone */}
          <div
            style={{
              ...styles.dropzone,
              borderColor: imagePreview ? "#3b82f6" : "#cbd5e1",
              background: imagePreview ? "#eff6ff" : "#f8fafc",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.dropHint}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p style={styles.dropText}>
                  Drag &amp; drop an image or{" "}
                  <span style={styles.browseLink}>browse</span>
                </p>
                <p style={styles.dropSub}>PNG, JPG, WEBP — max 10 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {imageFile && (
            <p style={styles.fileName}>
              {imageFile.name}{" "}
              <button
                type="button"
                style={styles.clearBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                  setResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </p>
          )}

          {/* Question input */}
          <label style={styles.label} htmlFor="question">
            Clinical Question
          </label>
          <textarea
            id="question"
            style={styles.textarea}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="e.g. Describe this oral issue."
          />

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading || !imageFile ? 0.6 : 1,
              cursor: loading || !imageFile ? "not-allowed" : "pointer",
            }}
            disabled={loading || !imageFile}
          >
            {loading ? "Analysing..." : "Analyse Image"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div
            style={{
              ...styles.resultBox,
              borderColor: result.error ? "#fca5a5" : "#86efac",
              background: result.error ? "#fef2f2" : "#f0fdf4",
            }}
          >
            <p style={styles.resultLabel}>
              {result.error ? "Error" : "Analysis Result"}
            </p>
            <pre style={styles.resultText}>
              {result.error
                ? result.error
                : formatResult(result.data)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,.07), 0 10px 30px -5px rgba(0,0,0,.1)",
    overflow: "hidden",
  },
  header: {
    padding: "2rem 2rem 1.5rem",
    borderBottom: "1px solid #f1f5f9",
    background: "linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#bfdbfe",
  },
  form: {
    padding: "1.75rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  dropzone: {
    border: "2px dashed",
    borderRadius: 12,
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    minHeight: 160,
  },
  dropHint: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  dropText: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  browseLink: {
    color: "#3b82f6",
    fontWeight: 600,
    textDecoration: "underline",
  },
  dropSub: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  preview: {
    maxHeight: 220,
    maxWidth: "100%",
    borderRadius: 8,
    objectFit: "contain",
  },
  fileName: {
    fontSize: "0.8rem",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "0.8rem",
    textDecoration: "underline",
    padding: 0,
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: "0.9rem",
    color: "#1a202c",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
    transition: "border-color 0.15s",
  },
  submitBtn: {
    padding: "0.85rem",
    background: "linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    transition: "opacity 0.2s",
  },
  resultBox: {
    margin: "0 2rem 2rem",
    border: "1.5px solid",
    borderRadius: 12,
    padding: "1rem 1.25rem",
  },
  resultLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    marginBottom: 8,
  },
  resultText: {
    fontSize: "0.9rem",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#1e293b",
    fontFamily: "inherit",
    margin: 0,
  },
};
