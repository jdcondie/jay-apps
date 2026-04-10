/**
 * SprintWizard.tsx — Create a new ad sprint from a URL
 *
 * Design: Matches AdCanvas-Max / StaticAds theme
 * Orange accent, Plus Jakarta Sans, light bg, rounded-xl cards
 */

import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { T } from "@/lib/sprintTheme";

export default function SprintWizard() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [audience, setAudience] = useState("");
  const [productIntel, setProductIntel] = useState<any>(null);
  const [sprintId, setSprintId] = useState<number | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productMimeType, setProductMimeType] = useState("image/png");
  const [error, setError] = useState("");

  const createSprint = trpc.sprint.create.useMutation();
  const generateAngles = trpc.sprint.generateAngles.useMutation();
  const generateTestPlan = trpc.sprint.generateTestPlan.useMutation();

  const handleCreateSprint = useCallback(async () => {
    if (!url.trim()) return;
    setError("");
    try {
      const result = await createSprint.mutateAsync({
        url: url.trim(),
        brandName: brandName.trim() || undefined,
        audience: audience.trim() || undefined,
      });
      setSprintId(result.sprintId);
      setProductIntel(result.productIntel);
      setStep(2);
    } catch (e: any) {
      setError(e.message || "Failed to create sprint");
    }
  }, [url, brandName, audience, createSprint]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setProductMimeType(file.type || "image/png");
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        setProductImage(base64);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!sprintId) return;
    setError("");
    setStep(3);
    try {
      await generateAngles.mutateAsync({ sprintId });
      await generateTestPlan.mutateAsync({ sprintId });
      navigate(`/sprint/${sprintId}`);
    } catch (e: any) {
      setError(e.message || "Generation failed");
    }
  }, [sprintId, generateAngles, generateTestPlan, navigate]);

  const isLoading =
    createSprint.isPending ||
    generateAngles.isPending ||
    generateTestPlan.isPending;

  const inputStyle: React.CSSProperties = {
    background: T.bgWhite,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "14px 16px",
    color: T.text,
    fontSize: 15,
    fontFamily: T.font,
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
  };

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
            { label: "New Sprint", path: "/sprint/new", active: true },
            { label: "My Sprints", path: "/sprints", active: false },
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
                transition: "background 0.15s",
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

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main style={{ flex: 1, background: T.bg, overflow: "auto" }}>
        {/* Step indicator */}
        <div
          style={{
            borderBottom: `1px solid ${T.borderLight}`,
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: step >= s ? T.accent : T.borderLight,
                    color: step >= s ? "#fff" : T.textMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {s}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: step >= s ? T.text : T.textMuted,
                    fontWeight: step === s ? 600 : 400,
                  }}
                >
                  {s === 1 ? "URL" : s === 2 ? "Review" : "Generate"}
                </span>
                {s < 3 && (
                  <div
                    style={{
                      width: 32,
                      height: 1,
                      background: step > s ? T.accent : T.borderLight,
                      margin: "0 4px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 32px" }}>
          <AnimatePresence mode="wait">
            {/* ── STEP 1 ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: 6,
                  }}
                >
                  Paste your product URL
                </h1>
                <p
                  style={{
                    color: T.textSub,
                    marginBottom: 32,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  We'll extract product intelligence, generate 60 ad angles, and
                  build a 4-week testing plan.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Product URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourbrand.com/product"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onFocus={(e) =>
                        (e.target.style.borderColor = T.accent)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = T.border)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Brand name{" "}
                      <span style={{ color: T.textMuted, fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-detected from URL"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      onFocus={(e) =>
                        (e.target.style.borderColor = T.accent)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = T.border)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Target audience{" "}
                      <span style={{ color: T.textMuted, fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Health-conscious men 25-44"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      onFocus={(e) =>
                        (e.target.style.borderColor = T.accent)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = T.border)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={handleCreateSprint}
                    disabled={!url.trim() || isLoading}
                    style={{
                      background: T.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: T.radius,
                      padding: "14px 24px",
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: T.font,
                      cursor: isLoading ? "wait" : "pointer",
                      opacity: !url.trim() || isLoading ? 0.5 : 1,
                      marginTop: 8,
                      boxShadow: "0 4px 12px rgba(232, 84, 26, 0.25)",
                      transition: "opacity 0.15s, transform 0.1s",
                    }}
                  >
                    {createSprint.isPending
                      ? "Extracting product intel..."
                      : "Extract & Continue →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: 6,
                  }}
                >
                  Product Intelligence
                </h1>
                <p
                  style={{
                    color: T.textSub,
                    marginBottom: 24,
                    fontSize: 15,
                  }}
                >
                  Review the extracted data, upload a product photo, then
                  generate.
                </p>

                {productIntel && (
                  <div
                    style={{
                      background: T.card,
                      border: `1px solid ${T.borderLight}`,
                      borderRadius: T.radiusLg,
                      padding: 24,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        fontSize: 14,
                      }}
                    >
                      {(
                        [
                          ["Brand", productIntel.brandName],
                          ["Product", productIntel.productName],
                          ["Category", productIntel.category],
                          ["Price", productIntel.price],
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
                              color: T.text,
                            }}
                          >
                            {val || "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    {productIntel.features?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <span
                          style={{
                            color: T.textMuted,
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontWeight: 600,
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          Key Features
                        </span>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          {productIntel.features.map(
                            (f: string, i: number) => (
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
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Image Upload */}
                <div
                  style={{
                    background: T.card,
                    border: `2px dashed ${T.border}`,
                    borderRadius: T.radiusLg,
                    padding: 40,
                    textAlign: "center",
                    marginBottom: 20,
                    cursor: "pointer",
                    position: "relative",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = T.accent)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = T.border)
                  }
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                  {productImage ? (
                    <div>
                      <img
                        src={`data:${productMimeType};base64,${productImage}`}
                        alt="Product"
                        style={{
                          maxHeight: 160,
                          borderRadius: T.radius,
                          margin: "0 auto",
                        }}
                      />
                      <p
                        style={{
                          color: T.textSub,
                          fontSize: 13,
                          marginTop: 12,
                        }}
                      >
                        Product photo uploaded. Click to change.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: T.radius,
                          background: T.accentLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 12px",
                          fontSize: 22,
                        }}
                      >
                        ↓
                      </div>
                      <p
                        style={{
                          color: T.text,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Click to upload or drag & drop
                      </p>
                      <p
                        style={{
                          color: T.textMuted,
                          fontSize: 13,
                          marginTop: 4,
                        }}
                      >
                        PNG or JPG — used for AI image generation
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  style={{
                    background: T.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: T.radius,
                    padding: "14px 24px",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: T.font,
                    cursor: isLoading ? "wait" : "pointer",
                    width: "100%",
                    opacity: isLoading ? 0.5 : 1,
                    boxShadow: "0 4px 12px rgba(232, 84, 26, 0.25)",
                  }}
                >
                  Generate 60 Angles + Test Plan →
                </button>
              </motion.div>
            )}

            {/* ── STEP 3 ─── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", paddingTop: 64 }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: `3px solid ${T.borderLight}`,
                    borderTopColor: T.accent,
                    borderRadius: "50%",
                    margin: "0 auto 24px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: 8,
                  }}
                >
                  Building your sprint
                </h2>
                <p style={{ color: T.textSub, fontSize: 14 }}>
                  {generateAngles.isPending
                    ? "Generating 60 ad angles across 6 categories..."
                    : generateTestPlan.isPending
                      ? "Creating targeting funnel + 4-week test plan..."
                      : "Finalizing..."}
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div
              style={{
                background: T.redBg,
                border: `1px solid ${T.red}`,
                borderRadius: T.radius,
                padding: "12px 16px",
                marginTop: 24,
                color: T.red,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
