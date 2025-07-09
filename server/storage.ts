import {
  users,
  leasingApplications,
  leasingOffers,
  leasingCompanies,
  cars,
  documents,
  notifications,
  type User,
  type InsertUser,
  type InsertLeasingApplication,
  type LeasingApplication,
  type InsertLeasingOffer,
  type LeasingOffer,
  type InsertCar,
  type Car,
  type InsertDocument,
  type Document,
  type InsertNotification,
  type Notification,
  type LeasingCompany,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Application operations
  createApplication(application: InsertLeasingApplication): Promise<LeasingApplication>;
  getApplicationsByClient(clientId: number): Promise<LeasingApplication[]>;
  getApplicationsByAgent(agentId: number): Promise<LeasingApplication[]>;
  getApplication(id: number): Promise<LeasingApplication | undefined>;
  updateApplicationStatus(id: number, status: string): Promise<LeasingApplication | undefined>;
  getAllApplications(): Promise<LeasingApplication[]>;
  
  // Offer operations
  createOffer(offer: InsertLeasingOffer): Promise<LeasingOffer>;
  getOffersByApplication(applicationId: number): Promise<LeasingOffer[]>;
  selectOffer(offerId: number): Promise<LeasingOffer | undefined>;
  
  // Company operations
  getAllCompanies(): Promise<LeasingCompany[]>;
  getCompatibleCompanies(application: LeasingApplication): Promise<LeasingCompany[]>;
  
  // Car operations
  createCar(car: InsertCar): Promise<Car>;
  getAllCars(): Promise<Car[]>;
  getCarsBySupplier(supplierId: number): Promise<Car[]>;
  searchCars(filters: {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    isNew?: boolean;
  }): Promise<Car[]>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByApplication(applicationId: number): Promise<Document[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Application operations
  async createApplication(application: InsertLeasingApplication): Promise<LeasingApplication> {
    const [newApplication] = await db
      .insert(leasingApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getApplicationsByClient(clientId: number): Promise<LeasingApplication[]> {
    return await db
      .select()
      .from(leasingApplications)
      .where(eq(leasingApplications.clientId, clientId))
      .orderBy(desc(leasingApplications.createdAt));
  }

  async getApplicationsByAgent(agentId: number): Promise<LeasingApplication[]> {
    return await db
      .select()
      .from(leasingApplications)
      .where(eq(leasingApplications.agentId, agentId))
      .orderBy(desc(leasingApplications.createdAt));
  }

  async getApplication(id: number): Promise<LeasingApplication | undefined> {
    const [application] = await db
      .select()
      .from(leasingApplications)
      .where(eq(leasingApplications.id, id));
    return application;
  }

  async updateApplicationStatus(id: number, status: string): Promise<LeasingApplication | undefined> {
    const [application] = await db
      .update(leasingApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(leasingApplications.id, id))
      .returning();
    return application;
  }

  async getAllApplications(): Promise<LeasingApplication[]> {
    return await db
      .select()
      .from(leasingApplications)
      .orderBy(desc(leasingApplications.createdAt));
  }

  // Offer operations
  async createOffer(offer: InsertLeasingOffer): Promise<LeasingOffer> {
    const [newOffer] = await db
      .insert(leasingOffers)
      .values(offer)
      .returning();
    return newOffer;
  }

  async getOffersByApplication(applicationId: number): Promise<LeasingOffer[]> {
    return await db
      .select()
      .from(leasingOffers)
      .where(eq(leasingOffers.applicationId, applicationId))
      .orderBy(asc(leasingOffers.monthlyPayment));
  }

  async selectOffer(offerId: number): Promise<LeasingOffer | undefined> {
    // First, unselect all other offers for this application
    const [offer] = await db
      .select()
      .from(leasingOffers)
      .where(eq(leasingOffers.id, offerId));
    
    if (offer) {
      await db
        .update(leasingOffers)
        .set({ isSelected: false })
        .where(eq(leasingOffers.applicationId, offer.applicationId));
      
      // Select the chosen offer
      const [selectedOffer] = await db
        .update(leasingOffers)
        .set({ isSelected: true })
        .where(eq(leasingOffers.id, offerId))
        .returning();
      
      return selectedOffer;
    }
    return undefined;
  }

  // Company operations
  async getAllCompanies(): Promise<LeasingCompany[]> {
    return await db
      .select()
      .from(leasingCompanies)
      .where(eq(leasingCompanies.isActive, true))
      .orderBy(asc(leasingCompanies.name));
  }

  async getCompatibleCompanies(application: LeasingApplication): Promise<LeasingCompany[]> {
    // Simplified version - return all active companies for now
    return await db
      .select()
      .from(leasingCompanies)
      .where(eq(leasingCompanies.isActive, true));
  }

  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db
      .insert(cars)
      .values(car)
      .returning();
    return newCar;
  }

  async getAllCars(): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.status, "available"))
      .orderBy(desc(cars.createdAt));
  }

  async getCarsBySupplier(supplierId: number): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.supplierId, supplierId))
      .orderBy(desc(cars.createdAt));
  }

  async searchCars(filters: {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    isNew?: boolean;
  }): Promise<Car[]> {
    const conditions = [eq(cars.status, "available")];

    if (filters.brand) {
      conditions.push(like(cars.brand, `%${filters.brand}%`));
    }
    if (filters.model) {
      conditions.push(like(cars.model, `%${filters.model}%`));
    }
    if (filters.minPrice) {
      conditions.push(gte(cars.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice) {
      conditions.push(lte(cars.price, filters.maxPrice.toString()));
    }
    if (filters.year) {
      conditions.push(eq(cars.year, filters.year));
    }
    if (filters.isNew !== undefined) {
      conditions.push(eq(cars.isNew, filters.isNew));
    }

    return await db
      .select()
      .from(cars)
      .where(and(...conditions))
      .orderBy(desc(cars.createdAt));
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId))
      .orderBy(desc(documents.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
