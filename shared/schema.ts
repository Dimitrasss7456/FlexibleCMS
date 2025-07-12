import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  userType: varchar("user_type").notNull().default("client"), // client, manager, supplier, agent, admin
  phone: varchar("phone"),
  inn: varchar("inn"),
  companyName: varchar("company_name"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leasingApplications = pgTable("leasing_applications", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  agentId: integer("agent_id").references(() => users.id),
  objectCost: decimal("object_cost", { precision: 15, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 5, scale: 2 }).notNull(), // percentage
  leasingTerm: integer("leasing_term").notNull(), // months
  leasingType: varchar("leasing_type").notNull(), // auto, equipment, real_estate
  clientPhone: varchar("client_phone").notNull(),
  clientInn: varchar("client_inn").notNull(),
  isNewObject: boolean("is_new_object").default(true),
  isForRental: boolean("is_for_rental").default(false),
  comment: text("comment"),
  status: varchar("status").notNull().default("pending"), // pending, approved_by_admin, collecting_offers, reviewing_offers, collecting_documents, approved, needs_revision, issued, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leasingOffers = pgTable("leasing_offers", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id).notNull(),
  companyId: integer("company_id").references(() => leasingCompanies.id).notNull(),
  managerId: integer("manager_id").references(() => users.id),
  monthlyPayment: decimal("monthly_payment", { precision: 15, scale: 2 }).notNull(),
  firstPayment: decimal("first_payment", { precision: 15, scale: 2 }).notNull(),
  buyoutPayment: decimal("buyout_payment", { precision: 15, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  brand: varchar("brand").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  engine: varchar("engine"),
  transmission: varchar("transmission"),
  drive: varchar("drive"),
  status: varchar("status").default("available"), // available, sold, reserved
  isNew: boolean("is_new").default(true),
  supplierId: integer("supplier_id").references(() => users.id),
  images: jsonb("images"),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id).notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  documentType: varchar("document_type").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applicationMessages = pgTable("application_messages", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isSystemMessage: boolean("is_system_message").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leasingCompanies = pgTable("leasing_companies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  logo: varchar("logo"),
  isActive: boolean("is_active").default(true),
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }),
  minTerm: integer("min_term"), // months
  maxTerm: integer("max_term"), // months
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  maxLeasingTerm: integer("max_leasing_term"),
  requirements: jsonb("requirements"),
  workWithUsed: boolean("work_with_used").default(true),
  workWithAuto: boolean("work_with_auto").default(true),
  workWithEquipment: boolean("work_with_equipment").default(true),
  workWithRealEstate: boolean("work_with_real_estate").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// CMS Tables for dynamic content management
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  content: text("content"),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").default(false),
  template: varchar("template").default("default"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(), // Dynamic form fields configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id).notNull(),
  data: jsonb("data").notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parsers = pgTable("parsers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  sourceUrl: varchar("source_url").notNull(),
  isActive: boolean("is_active").default(true),
  config: jsonb("config").notNull(), // Parser configuration
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parserRuns = pgTable("parser_runs", {
  id: serial("id").primaryKey(),
  parserId: integer("parser_id").references(() => parsers.id).notNull(),
  status: varchar("status").notNull().default("running"), // running, completed, failed
  itemsProcessed: integer("items_processed").default(0),
  errors: text("errors"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const tableSchema = pgTable("table_schema", {
  id: serial("id").primaryKey(),
  tableName: varchar("table_name").notNull(),
  columnName: varchar("column_name").notNull(),
  dataType: varchar("data_type").notNull(),
  isNullable: boolean("is_nullable").default(true),
  defaultValue: varchar("default_value"),
  constraints: jsonb("constraints"),
  displayName: varchar("display_name"),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("table_column_unique").on(table.tableName, table.columnName),
]);

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  type: varchar("type").notNull().default("string"), // string, number, boolean, json
  description: text("description"),
  category: varchar("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  tableName: varchar("table_name"),
  recordId: integer("record_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(leasingApplications, { relationName: "client_applications" }),
  agentApplications: many(leasingApplications, { relationName: "agent_applications" }),
  offers: many(leasingOffers),
  cars: many(cars),
  documents: many(documents),
  notifications: many(notifications),
  sentMessages: many(applicationMessages),
}));

export const leasingApplicationsRelations = relations(leasingApplications, ({ one, many }) => ({
  client: one(users, {
    fields: [leasingApplications.clientId],
    references: [users.id],
    relationName: "client_applications",
  }),
  agent: one(users, {
    fields: [leasingApplications.agentId],
    references: [users.id],
    relationName: "agent_applications",
  }),
  offers: many(leasingOffers),
  documents: many(documents),
  messages: many(applicationMessages),
}));

export const leasingOffersRelations = relations(leasingOffers, ({ one }) => ({
  application: one(leasingApplications, {
    fields: [leasingOffers.applicationId],
    references: [leasingApplications.id],
  }),
  company: one(leasingCompanies, {
    fields: [leasingOffers.companyId],
    references: [leasingCompanies.id],
  }),
  manager: one(users, {
    fields: [leasingOffers.managerId],
    references: [users.id],
  }),
}));

export const carsRelations = relations(cars, ({ one }) => ({
  supplier: one(users, {
    fields: [cars.supplierId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(leasingApplications, {
    fields: [documents.applicationId],
    references: [leasingApplications.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const applicationMessagesRelations = relations(applicationMessages, ({ one }) => ({
  application: one(leasingApplications, {
    fields: [applicationMessages.applicationId],
    references: [leasingApplications.id],
  }),
  sender: one(users, {
    fields: [applicationMessages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeasingApplicationSchema = createInsertSchema(leasingApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeasingOfferSchema = createInsertSchema(leasingOffers).omit({
  id: true,
  createdAt: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationMessageSchema = createInsertSchema(applicationMessages).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  email: z.string().email("Неверный формат email").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.enum(["client", "manager", "supplier", "agent", "admin"]).default("client"),
  phone: z.string().optional(),
  inn: z.string().optional(),
  companyName: z.string().optional(),
});

// CMS Insert schemas
export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertParserSchema = createInsertSchema(parsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InsertLeasingApplication = z.infer<typeof insertLeasingApplicationSchema>;
export type LeasingApplication = typeof leasingApplications.$inferSelect;
export type InsertLeasingOffer = z.infer<typeof insertLeasingOfferSchema>;
export type LeasingOffer = typeof leasingOffers.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertApplicationMessage = z.infer<typeof insertApplicationMessageSchema>;
export type ApplicationMessage = typeof applicationMessages.$inferSelect;
export type LeasingCompany = typeof leasingCompanies.$inferSelect;

// CMS Types
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type Parser = typeof parsers.$inferSelect;
export type InsertParser = z.infer<typeof insertParserSchema>;
export type ParserRun = typeof parserRuns.$inferSelect;
export type TableSchema = typeof tableSchema.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
