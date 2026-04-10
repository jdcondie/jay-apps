/**
 * SprintList.tsx — List all user's ad sprints
 * Design: Matches AdCanvas-Max / StaticAds theme
 */

import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { T } from "@/lib/sprintTheme";

export default function SprintList() {
  const { data: sprints, isLoading } = trpc.sprint.listSprints.useQuery();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: T.font,
        color: T.text,
      }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        style={{
          width: 256,
          background: T.sidebar,
          borderRight: `1px solid ${T.borderSidebar}`,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            padding: "0 8px",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: T.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              color: T.textWhite,
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "-0.025em",
            }}
          >
            Ad Sprint
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "New Sprint", path: "/sprint/new", active: false },
            { label: "My Sprints", path: "/sprints", active: true },
            { label: "Reports", path: "/reports", active: false },
          ].map((item) => (
            <a
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: T.radius,
                color: item.active ? "#fff" : T.textWhite,
                background: item.active ? T.accent : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: item.active ? 600 : 500,
                boxShadow: item.active
                  ? "0 4px 12px rgba(232, 84, 26, 0.25)"
                  : "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ flex: 1 }} />
        <a
          href="/"
          style={{
            color: T.textSidebarMuted,
            fontSize: 13,
            textDecoration: "none",
            padding: "8px 14px",
          }}
        >
          ← Back to Scout
        </a>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, background: T.bg, overflow: "auto" }}>
        <div
          style={{
            borderBottom: `1px solid ${T.borderLight}`,
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            My Sprints
          </h1>
          <Link
            href="/sprint/new"
            style={{
              background: T.accent,
              color: "#fff",
              textDecoration: "none",
              borderRadius: T.radius,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(232, 84, 26, 0.25)",
            }}
          >
            + New Sprint
          </Link>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px" }}>
          {isLoading ? (
            <p style={{ color: T.textSub }}>Loading sprints...</p>
          ) : !sprints?.length ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: T.radiusLg,
                  background: T.accentLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 28,
                }}
              >
                ⚡
              </div>
              <p
                style={{
                  color: T.text,
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                No sprints yet
              </p>
              <p
                style={{
                  color: T.textSub,
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                Create your first ad sprint to generate 60 angles and a test
                plan.
              </p>
              <Link
                href="/sprint/new"
                style={{
                  background: T.accent,
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: T.radius,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(232, 84, 26, 0.25)",
                }}
              >
                Create Ad Sprint
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {sprints.map((s) => (
                <Link
                  key={s.id}
                  href={`/sprint/${s.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: T.card,
                      border: `1px solid ${T.borderLight}`,
                      borderRadius: T.radiusLg,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = T.accent;
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(232, 84, 26, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.borderLight;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: T.text,
                          fontSize: 15,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {s.brandName}
                      </div>
                      {s.brandUrl && (
                        <div
                          style={{
                            color: T.textMuted,
                            fontSize: 12,
                            marginTop: 3,
                          }}
                        >
                          {s.brandUrl}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          background:
                            s.status === "complete"
                              ? T.greenBg
                              : s.status === "generating"
                                ? T.yellowBg
                                : T.accentLight,
                          color:
                            s.status === "complete"
                              ? T.green
                              : s.status === "generating"
                                ? T.yellow
                                : T.accent,
                          padding: "3px 10px",
                          borderRadius: T.radiusFull,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {s.status}
                      </span>
                      <span style={{ color: T.textMuted, fontSize: 12 }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
