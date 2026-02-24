import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
	id: integer({ mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	title: text().notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	role: text("role"),
	banned: integer("banned", { mode: "boolean" }),
	banReason: text("banReason"),
	banExpires: integer("banExpires", { mode: "timestamp" }),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	token: text("token").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const apiKey = sqliteTable("api_key", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull(),
	key: text("key").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	expiresAt: integer("expiresAt", { mode: "timestamp" }),
	password: text("password"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }),
	updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const instanceConfig = sqliteTable("instance_config", {
	id: integer("id").primaryKey().default(1),
	mistralApiKey: text("mistralApiKey"),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const userSettings = sqliteTable("user_settings", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: text("userId")
		.notNull()
		.unique()
		.references(() => user.id),
	safeSearch: text("safeSearch").default("off").notNull(),
	openInNewTab: integer("openInNewTab", { mode: "boolean" })
		.default(sql`1`)
		.notNull(),
	theme: text("theme").default("system").notNull(),
	language: text("language").default("en").notNull(),
	enableAiSummary: integer("enableAiSummary", { mode: "boolean" })
		.default(sql`0`)
		.notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
