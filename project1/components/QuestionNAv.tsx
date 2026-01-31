import React from "react";

interface Question {
  _id: string;
  prompt: string;
  options: string[];
}

interface QuestionNAvProps {
  question: Question | null;
  selectedAnswer: number | undefined;
  onSelect: (index: number) => void;
  disabled: boolean;
}

export default function QuestionNAv({ question, selectedAnswer, onSelect, disabled }: QuestionNAvProps) {
  if (!question) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.prompt}>
        <div style={styles.qNo}>Question</div>
        <div style={styles.qText}>{question.prompt}</div>
      </div>

      <div style={styles.options}>
        {(question.options || []).map((opt: string, idx: number) => {
          const checked = Number(selectedAnswer) === idx;

          return (
            <label
              key={idx}
              style={{
                ...styles.option,
                borderColor: checked ? "#111" : "#ddd",
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="radio"
                name={`q-${question._id}`}
                value={idx}
                disabled={disabled}
                checked={checked}
                onChange={() => onSelect(idx)}
                style={{ marginRight: 10 }}
              />
              <span>
                <b style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</b>
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrap: { padding: 18, boxSizing: "border-box" as const },
  prompt: { marginBottom: 16 },
  qNo: { fontSize: 12, opacity: 0.65, marginBottom: 6 },
  qText: { fontSize: 20, fontWeight: 700, lineHeight: 1.3 },
  options: { display: "grid", gap: 12, marginTop: 16 },
  option: {
    border: "2px solid #ddd",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    alignItems: "center",
    background: "#fff",
  },
};
