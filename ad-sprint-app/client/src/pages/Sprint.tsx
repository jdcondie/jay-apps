/**
 * Sprint.tsx — Full ad sprint dashboard
 * Design: Matches AdCanvas-Max / StaticAds theme
 */

import { useState, useMemo, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { T, CAT_COLORS, CATEGORIES } from "@/lib/sprintTheme";

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {count !== undefined && (
          <span
            style={{
              background: T.accentLight,
              color: T.accent,
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: T.radiusFull,
            }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cat = CAT_COLORS[category] || { color: T.textMuted, bg: T.cardHover };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: cat.bg,
        color: cat.color,
        borderRadius: T.radiusFull,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cat.color,
        }}
      />
      {category}
    </span>
  );
}

function ScoreCell({ value }: { value: number | string | null }) {
  const n = Number(value) || 0;
  const color = n >= 8 ? T.green : n >= 6 ? T.yellow : T.red;
  return (
    <span
      style={{
        color,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        fontSize: 13,
      }}
    >
      {n.toFixed(1)}
    </span>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function Sprint() {
  const [, params] = useRoute("/sprint/:id");
  const sprintId = Number(params?.id);

  const { data: sprint, isLoading } = trpc.sprint.getSprint.useQuery(
    { id: sprintId },
    { enabled: !!sprintId }
  );

  const [catFilter, setCatFilter] = useState("All");
  const [sortCol, setSortCol] = useState<
    "rank" | "scoreAverage" | "scoreBrandFit" | "scoreHookStrength" | "scoreCompliance"
  >("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [winnerText, setWinnerText] = useState("");

  const iterateWinners = trpc.sprint.iterateWinners.useMutation();

  const filteredAngles = useMemo(() => {
    if (!sprint?.angles) return [];
    let list = [...sprint.angles];
    if (catFilter !== "All") list = list.filter((a) => a.category === catFilter);
    list.sort((a, b) => {
      const aVal = Number(a[sortCol]) || 0;
      const bVal = Number(b[sortCol]) || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [sprint?.angles, catFilter, sortCol, sortAsc]);

  const handleSort = useCallback(
    (col: typeof sortCol) => {
      if (sortCol === col) setSortAsc((a) => !a);
      else {
        setSortCol(col);
        setSortAsc(col === "rank");
      }
    },
    [sortCol]
  );

  const handleIterate = useCallback(async () => {
    if (!winnerText.trim() || !sprintId) return;
    const headlines = winnerText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!headlines.length) return;
    await iterateWinners.mutateAsync({ sprintId, winnerHeadlines: headlines });
    setWinnerText("");
  }, [winnerText, sprintId, iterateWinners]);

  // ── Loading / Not found ──
  if (isLoading || !sprint) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: T.font,
          alignItems: "center",
          justifyContent: "center",
          background: T.bg,
          color: T.textSub,
          flexDirection: "column",
          gap: 12,
        }}
      >
        {isLoading ? (
          "Loading sprint..."
        ) : (
          <>
            <span>Sprint not found</span>
            <Link href="/sprints" style={{ color: T.accent }}>
              Back to sprints
            </Link>
          </>
        )}
      </div>
    );
  }

  const pi = sprint.productIntel;
  const tp = sprint.testPlan;

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
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
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
            { label: "New Sprint", path: "/sprint/new" },
            { label: "My Sprints", path: "/sprints" },
            { label: "Reports", path: "/reports" },
          ].map((item) => (
            <a
              key={item.path}
              href={item.path}
              style={{
                padding: "10px 14px",
                borderRadius: T.radius,
                color: T.textWhite,
                background: "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Sprint sections nav */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: `1px solid ${T.borderSidebar}`,
          }}
        >
          <span
            style={{
              color: T.textSidebarMuted,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              padding: "0 14px",
              display: "block",
              marginBottom: 8,
            }}
          >
            This Sprint
          </span>
          {[
            { label: sprint.brandName, sub: sprint.brandUrl || "" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "8px 14px",
                borderRadius: T.radius,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  color: T.textWhite,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
              {item.sub && (
                <div
                  style={{
                    color: T.textSidebarMuted,
                    fontSize: 11,
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.sub}
                </div>
              )}
            </div>
          ))}
        </div>

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

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main style={{ flex: 1, background: T.bg, overflow: "auto" }}>
        {/* Top bar */}
        <div
          style={{
            borderBottom: `1px solid ${T.borderLight}`,
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {sprint.brandName} Sprint
          </h1>
          <span
            style={{
              background:
                sprint.status === "complete" ? T.greenBg : T.yellowBg,
              color: sprint.status === "complete" ? T.green : T.yellow,
              padding: "4px 12px",
              borderRadius: T.radiusFull,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {sprint.status}
          </span>
        </div>

        <div style={{ padding: "32px", maxWidth: 1100 }}>
          {/* ── 1. PRODUCT INTEL ─────────────────────────────────── */}
          {pi && (
            <Section title="Product Intelligence">
              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: T.radiusLg,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 20,
                    fontSize: 14,
                  }}
                >
                  {(
                    [
                      ["Brand", pi.brandName],
                      ["Product", pi.productName],
                      ["Category", pi.category],
                      ["Price", pi.price],
                      ["Audience", pi.audience],
                      ["Positioning", pi.positioning],
                    ] as [string, string][]
                  ).map(([label, val]) => (
                    <div key={label}>
                      <span
                        style={{
                          color: T.textMuted,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </span>
                      <div
                        style={{
                          marginTop: 4,
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {val || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {pi.features?.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <span
                      style={{
                        color: T.textMuted,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                      }}
                    >
                      Features
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      {pi.features.map((f: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            background: T.accentLight,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontSize: 12,
                            color: T.accent,
                            fontWeight: 500,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pi.colors?.length > 0 && (
                  <div
                    style={{
                      marginTop: 20,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    {pi.colors.map((c: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: c,
                          border: `1px solid ${T.borderLight}`,
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── 2. ANGLE MATRIX ──────────────────────────────────── */}
          {sprint.angles.length > 0 && (
            <Section title="Angle Matrix" count={sprint.angles.length}>
              {/* Category filter tabs */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = catFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(cat)}
                      style={{
                        background: isActive ? T.accent : T.card,
                        color: isActive ? "#fff" : T.textSub,
                        border: `1px solid ${isActive ? T.accent : T.borderLight}`,
                        borderRadius: T.radiusFull,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: T.font,
                        transition: "all 0.15s",
                        boxShadow: isActive
                          ? "0 2px 8px rgba(232, 84, 26, 0.2)"
                          : "none",
                      }}
                    >
                      {cat}
                      {cat !== "All" && (
                        <span style={{ marginLeft: 4, opacity: 0.7 }}>
                          (
                          {
                            sprint.angles.filter((a) => a.category === cat)
                              .length
                          }
                          )
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Table */}
              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: T.radiusLg,
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ background: T.cardHover }}>
                        {[
                          { key: "rank", label: "#", w: 48 },
                          { key: null, label: "Headline", w: undefined },
                          { key: null, label: "Category", w: 140 },
                          { key: "scoreBrandFit", label: "BF", w: 56 },
                          { key: "scoreHookStrength", label: "HS", w: 56 },
                          { key: "scoreCompliance", label: "MC", w: 56 },
                          { key: "scoreAverage", label: "AVG", w: 56 },
                        ].map((col) => (
                          <th
                            key={col.label}
                            onClick={
                              col.key
                                ? () => handleSort(col.key as any)
                                : undefined
                            }
                            style={{
                              padding: "10px 12px",
                              textAlign: col.key ? "center" : "left",
                              color: T.textMuted,
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              fontWeight: 700,
                              borderBottom: `1px solid ${T.borderLight}`,
                              cursor: col.key ? "pointer" : "default",
                              userSelect: "none",
                              whiteSpace: "nowrap",
                              width: col.w,
                            }}
                          >
                            {col.label}
                            {col.key === sortCol && (
                              <span style={{ marginLeft: 3 }}>
                                {sortAsc ? "↑" : "↓"}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAngles.map((a) => {
                        const avg = Number(a.scoreAverage) || 0;
                        const isTop = (a.rank || 61) <= 20;
                        return (
                          <tr
                            key={a.id}
                            style={{
                              background: isTop
                                ? T.greenBg
                                : "transparent",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = T.cardHover)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = isTop
                                ? T.greenBg
                                : "transparent")
                            }
                          >
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                color: T.textMuted,
                                borderBottom: `1px solid ${T.borderLight}`,
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {a.rank}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                borderBottom: `1px solid ${T.borderLight}`,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  marginBottom: 2,
                                  color: T.text,
                                }}
                              >
                                {a.headline}
                              </div>
                              {a.primaryText && (
                                <div
                                  style={{
                                    color: T.textSub,
                                    fontSize: 12,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {a.primaryText}
                                </div>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                borderBottom: `1px solid ${T.borderLight}`,
                              }}
                            >
                              <CategoryBadge category={a.category} />
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                borderBottom: `1px solid ${T.borderLight}`,
                              }}
                            >
                              <ScoreCell value={a.scoreBrandFit} />
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                borderBottom: `1px solid ${T.borderLight}`,
                              }}
                            >
                              <ScoreCell value={a.scoreHookStrength} />
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                borderBottom: `1px solid ${T.borderLight}`,
                              }}
                            >
                              <ScoreCell value={a.scoreCompliance} />
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                borderBottom: `1px solid ${T.borderLight}`,
                                fontWeight: 700,
                              }}
                            >
                              <ScoreCell value={avg} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          )}

          {/* ── 3. GENERATED ADS ─────────────────────────────────── */}
          {sprint.generatedAds.length > 0 && (
            <Section
              title="Generated Ads"
              count={
                sprint.generatedAds.filter((a) => a.status === "complete")
                  .length
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                {sprint.generatedAds
                  .filter((ad) => ad.status === "complete" && ad.imageUrl)
                  .map((ad) => (
                    <div
                      key={ad.id}
                      style={{
                        background: T.card,
                        border: `1px solid ${T.borderLight}`,
                        borderRadius: T.radiusLg,
                        overflow: "hidden",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "none")
                      }
                    >
                      <img
                        src={ad.imageUrl!}
                        alt={ad.headline || "Generated ad"}
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ padding: 12 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            marginBottom: 4,
                          }}
                        >
                          {ad.headline}
                        </div>
                        {ad.primaryText && (
                          <div style={{ color: T.textSub, fontSize: 12 }}>
                            {ad.primaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* ── 4. TARGETING FUNNEL ──────────────────────────────── */}
          {tp?.funnelMap && (
            <Section title="Targeting Funnel">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {(["cold", "warm", "hot"] as const).map((stage) => {
                  const data = tp.funnelMap[stage];
                  if (!data) return null;
                  const stageColor =
                    stage === "cold"
                      ? T.blue
                      : stage === "warm"
                        ? T.yellow
                        : T.red;
                  const stageBg =
                    stage === "cold"
                      ? T.blueBg
                      : stage === "warm"
                        ? T.yellowBg
                        : T.redBg;
                  return (
                    <div
                      key={stage}
                      style={{
                        background: T.card,
                        border: `1px solid ${T.borderLight}`,
                        borderRadius: T.radiusLg,
                        borderTop: `3px solid ${stageColor}`,
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            textTransform: "uppercase",
                            fontSize: 11,
                            fontWeight: 700,
                            color: stageColor,
                            letterSpacing: "0.05em",
                            background: stageBg,
                            padding: "3px 8px",
                            borderRadius: T.radiusFull,
                          }}
                        >
                          {stage}
                        </span>
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: T.text,
                          }}
                        >
                          {data.budgetPct}%
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.textSub,
                          lineHeight: 1.6,
                        }}
                      >
                        {data.objective}
                      </div>
                      {data.categories && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            marginTop: 12,
                          }}
                        >
                          {data.categories.map((c: string) => (
                            <CategoryBadge key={c} category={c} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ── 5. TEST CALENDAR ─────────────────────────────────── */}
          {tp?.weeklyCalendar && Array.isArray(tp.weeklyCalendar) && (
            <Section title="4-Week Test Calendar">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {tp.weeklyCalendar.map((week: any) => (
                  <div
                    key={week.week}
                    style={{
                      background: T.card,
                      border: `1px solid ${T.borderLight}`,
                      borderRadius: T.radiusLg,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          background: T.accent,
                          color: "#fff",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {week.week}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {week.title}
                      </span>
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: T.textSub,
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      {week.actions?.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                    {week.budget && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 12,
                          color: T.textMuted,
                          fontWeight: 600,
                        }}
                      >
                        Budget: {week.budget}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Kill/Scale Legend */}
              {tp.criteria && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {(["kill", "hold", "scale"] as const).map((key) => {
                    const c = tp.criteria[key];
                    if (!c) return null;
                    const color =
                      key === "kill" ? T.red : key === "hold" ? T.yellow : T.green;
                    const bg =
                      key === "kill" ? T.redBg : key === "hold" ? T.yellowBg : T.greenBg;
                    return (
                      <div
                        key={key}
                        style={{
                          background: T.card,
                          borderLeft: `3px solid ${color}`,
                          border: `1px solid ${T.borderLight}`,
                          borderLeftColor: color,
                          borderLeftWidth: 3,
                          borderRadius: T.radius,
                          padding: "12px 16px",
                          fontSize: 12,
                        }}
                      >
                        <div
                          style={{
                            textTransform: "uppercase",
                            fontWeight: 700,
                            color,
                            fontSize: 11,
                            letterSpacing: "0.05em",
                            marginBottom: 4,
                          }}
                        >
                          {key}
                        </div>
                        <div style={{ color: T.textSub }}>{c.threshold}</div>
                        <div style={{ color: T.textMuted, marginTop: 2 }}>
                          {c.signal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* ── 6. WINNER ITERATION ──────────────────────────────── */}
          <Section title="Iterate on Winners">
            <div
              style={{
                background: T.card,
                border: `1px solid ${T.borderLight}`,
                borderRadius: T.radiusLg,
                padding: 24,
              }}
            >
              <p
                style={{
                  color: T.textSub,
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Paste your winning headlines (one per line) to generate 20 new
                variations that build on the same patterns.
              </p>
              <textarea
                value={winnerText}
                onChange={(e) => setWinnerText(e.target.value)}
                placeholder={`Paste winning headlines here, one per line:\n\n"36hrs on a single charge"\n"The $49 earbud that replaced my AirPods"`}
                rows={6}
                style={{
                  width: "100%",
                  background: T.bg,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: T.radius,
                  padding: "12px 16px",
                  color: T.text,
                  fontSize: 14,
                  fontFamily: T.font,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = T.accent)}
                onBlur={(e) => (e.target.style.borderColor = T.borderLight)}
              />
              <button
                onClick={handleIterate}
                disabled={!winnerText.trim() || iterateWinners.isPending}
                style={{
                  background: T.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: T.radius,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: T.font,
                  cursor:
                    !winnerText.trim() || iterateWinners.isPending
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    !winnerText.trim() || iterateWinners.isPending ? 0.5 : 1,
                  marginTop: 12,
                  boxShadow: "0 4px 12px rgba(232, 84, 26, 0.25)",
                }}
              >
                {iterateWinners.isPending
                  ? "Generating variations..."
                  : "Generate Next Batch →"}
              </button>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
