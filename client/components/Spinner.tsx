"use client";

export default function Spinner() {
  return (
    <div style={{ marginTop: "20px" }}>
      <div className="spinner" />
      <style jsx>{`
        .spinner {
          width: 32px;
          height: 32px;
          border: 4px solid #ddd;
          border-top: 4px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
