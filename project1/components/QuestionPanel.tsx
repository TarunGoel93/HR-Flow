import React from "react";

interface Question {
  _id: string;
}

interface QuestionPanelProps {
  questions: Question[];
  currentIndex: number;
  answersMap: Map<string, number>;
  onJump: (index: number) => void;
}

export default function QuestionPanel({ questions, currentIndex, answersMap, onJump }: QuestionPanelProps) {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>Questions</div>

      <div style={styles.grid}>
        {questions.map((q: Question, idx: number) => {
          const answered = answersMap.has(q._id);
          const isActive = idx === currentIndex;

          return (
            <button
              key={q._id}
              onClick={() => onJump(idx)}
              style={{
                ...styles.qBtn,
                borderColor: isActive ? "#111" : "#ddd",
                background: answered ? "#111" : "#fff",
                color: answered ? "#fff" : "#111",
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrap: {
    width: 240,
    borderRight: "1px solid #eee",
    padding: 14,
    boxSizing: "border-box" as const,
    height: "100vh",
    overflow: "auto",
    background: "#fafafa",
  },
  title: { fontWeight: 700, marginBottom: 10 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  qBtn: {
    height: 44,
    borderRadius: 10,
    border: "2px solid #ddd",
    cursor: "pointer",
    fontWeight: 700,
  },
};
