"use client";

// Last resort: the root layout itself failed, so there are no providers and no
// stylesheet here. Plain inline styles only.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#000", background: "#fff" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
          <p style={{ maxWidth: 320, fontSize: 14, color: "#525252", margin: 0 }}>
            The page didn&apos;t load properly. Try again, or come back in a minute.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#000", color: "#fff", border: 0, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
