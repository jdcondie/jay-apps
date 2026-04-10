import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Reports table — stores each generated competitor analysis report per user
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to users.id — the user who generated this report */
  userId: int("userId").notNull(),
  /** Brand name the report was generated for */
  brandName: varchar("brandName", { length: 255 }).notNull(),
  /** Product/service category */
  category: varchar("category", { length: 255 }).notNull().default(""),
  /** Full ReportConfig JSON blob */
  config: text("config").notNull(),
  /** Whether the report was generated with real Meta Ads data or AI-only */
  isAiOnly: int("isAiOnly").notNull().default(0),
  /** Number of real ads analyzed (0 for AI-only reports) */
  totalAdsAnalyzed: int("totalAdsAnalyzed").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ─── SPRINTS ─────────────────────────────────────────────────────────────────

export const sprints = mysqlTable("sprints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** FK to reports table (competitive analysis, optional) */
  reportId: int("reportId"),
  brandName: varchar("brandName", { length: 255 }).notNull(),
  brandUrl: varchar("brandUrl", { length: 2048 }),
  /** JSON blob: { colors, fonts, logo } */
  brandKit: text("brandKit"),
  /** JSON blob: extracted product data (name, price, features, proof, offer, visualStyle) */
  productIntel: text("productIntel"),
  /** draft | generating | complete | failed */
  status: varchar("status", { length: 32 }).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sprint = typeof sprints.$inferSelect;
export type InsertSprint = typeof sprints.$inferInsert;

// ─── ANGLES ──────────────────────────────────────────────────────────────────

export const angles = mysqlTable("angles", {
  id: int("id").autoincrement().primaryKey(),
  sprintId: int("sprintId").notNull(),
  rank: int("rank"),
  headline: varchar("headline", { length: 255 }).notNull(),
  primaryText: varchar("primaryText", { length: 500 }),
  cta: varchar("cta", { length: 100 }),
  /** Problem-Aware | Benefit-Led | Social Proof | Direct Offer | Curiosity | Comparison */
  category: varchar("category", { length: 50 }).notNull(),
  scoreBrandFit: int("scoreBrandFit"),
  scoreHookStrength: int("scoreHookStrength"),
  scoreCompliance: int("scoreCompliance"),
  scoreAverage: decimal("scoreAverage", { precision: 3, scale: 1 }),
  isTop20: boolean("isTop20").default(false),
  /** Batch number — 0 for initial, 1+ for winner iterations */
  batch: int("batch").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Angle = typeof angles.$inferSelect;
export type InsertAngle = typeof angles.$inferInsert;

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  /** null = built-in template, set = user's custom template */
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** Studio | Lifestyle | Room | Outdoor | Themed | Creative */
  category: varchar("category", { length: 50 }),
  keywords: text("keywords"),
  promptTemplate: text("promptTemplate"),
  /** S3 URL for the reference image */
  referenceImageUrl: varchar("referenceImageUrl", { length: 2048 }),
  isBuiltIn: boolean("isBuiltIn").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// ─── GENERATED ADS ───────────────────────────────────────────────────────────

export const generatedAds = mysqlTable("generated_ads", {
  id: int("id").autoincrement().primaryKey(),
  sprintId: int("sprintId").notNull(),
  /** FK to angles (which headline powered this ad) */
  angleId: int("angleId"),
  /** FK to templates (which visual style) */
  templateId: int("templateId"),
  /** S3 URL for the generated image */
  imageUrl: varchar("imageUrl", { length: 2048 }),
  /** 1:1 | 4:5 | 9:16 | 16:9 */
  aspectRatio: varchar("aspectRatio", { length: 10 }),
  headline: varchar("headline", { length: 255 }),
  primaryText: varchar("primaryText", { length: 500 }),
  /** pending | generating | complete | failed */
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedAd = typeof generatedAds.$inferSelect;
export type InsertGeneratedAd = typeof generatedAds.$inferInsert;

// ─── TEST PLANS ──────────────────────────────────────────────────────────────

export const testPlans = mysqlTable("test_plans", {
  id: int("id").autoincrement().primaryKey(),
  sprintId: int("sprintId").notNull(),
  /** JSON: { cold: { categories, budgetPct }, warm: {...}, hot: {...} } */
  funnelMap: text("funnelMap"),
  /** JSON: 4-week plan with weekly actions */
  weeklyCalendar: text("weeklyCalendar"),
  /** JSON: kill/hold/scale rules and thresholds */
  criteria: text("criteria"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TestPlan = typeof testPlans.$inferSelect;
export type InsertTestPlan = typeof testPlans.$inferInsert;