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

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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
  clientId: varchar("client_id").references(() => users.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id),
  objectCost: decimal("object_cost", { precision: 15, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 5, scale: 2 }).notNull(), // percentage
  leasingTerm: integer("leasing_term").notNull(), // months
  leasingType: varchar("leasing_type").notNull(), // auto, equipment, real_estate
  clientPhone: varchar("client_phone").notNull(),
  clientInn: varchar("client_inn").notNull(),
  isNewObject: boolean("is_new_object").default(true),
  isForRental: boolean("is_for_rental").default(false),
  comment: text("comment"),
  status: varchar("status").notNull().default("collecting_offers"), // collecting_offers, reviewing_offers, collecting_documents, document_review, approved, rejected, issued
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  workWithUsed: boolean("work_with_used").default(true),
  workWithAuto: boolean("work_with_auto").default(true),
  workWithEquipment: boolean("work_with_equipment").default(true),
  workWithRealEstate: boolean("work_with_real_estate").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leasingOffers = pgTable("leasing_offers", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id).notNull(),
  companyId: integer("company_id").references(() => leasingCompanies.id).notNull(),
  managerId: varchar("manager_id").references(() => users.id),
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
  supplierId: varchar("supplier_id").references(() => users.id),
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
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false),
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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
export type LeasingCompany = typeof leasingCompanies.$inferSelect;
