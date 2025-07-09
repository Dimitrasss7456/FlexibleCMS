import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession, isAuthenticated, requireRole, hashPassword, verifyPassword } from "./auth";
import { loginSchema, registerSchema } from "@shared/schema";
import { 
  insertLeasingApplicationSchema,
  insertLeasingOfferSchema,
  insertCarSchema,
  insertDocumentSchema,
  insertNotificationSchema,
  users,
  leasingCompanies
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { parseCarCatalog } from "./carParser";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Имя пользователя уже занято" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(data.password);
      
      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      // Start session
      req.session.userId = user.id;
      req.session.userType = user.userType;
      
      res.json({ 
        message: "Пользователь зарегистрирован", 
        user: { 
          id: user.id, 
          username: user.username, 
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }
      
      const isValid = await verifyPassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }
      
      // Start session
      req.session.userId = user.id;
      req.session.userType = user.userType;
      
      res.json({ 
        message: "Успешный вход",
        user: { 
          id: user.id, 
          username: user.username, 
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ message: "Ошибка входа" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка выхода" });
      }
      res.json({ message: "Вы вышли из системы" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // For updates, we'll use createUser with onConflictDoUpdate
      const updatedUser = await storage.createUser({
        ...existingUser,
        ...updates,
        id: userId,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Application routes
  app.post('/api/applications', async (req, res) => {
    try {
      const applicationData = insertLeasingApplicationSchema.parse(req.body);
      
      // Create the application
      const application = await storage.createApplication(applicationData);
      
      // Get compatible companies
      const companies = await storage.getCompatibleCompanies(application);
      
      // Create notifications for compatible company managers
      for (const company of companies) {
        await storage.createNotification({
          userId: 1, // System notifications for now
          title: `Новая заявка на лизинг`,
          message: `Получена новая заявка на ${applicationData.leasingType} стоимостью ${applicationData.objectCost} руб.`,
          type: 'info'
        });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      let applications;
      if (user.userType === 'admin') {
        applications = await storage.getAllApplications();
      } else if (user.userType === 'agent') {
        applications = await storage.getApplicationsByAgent(user.id);
      } else {
        applications = await storage.getApplicationsByClient(user.id);
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check permissions
      const user = req.user;
      
      if (user.userType !== 'admin' && 
          application.clientId !== user.id && 
          application.agentId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only admin and managers can update status
      if (user?.userType !== 'admin' && user?.userType !== 'manager') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const application = await storage.updateApplicationStatus(applicationId, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Create notification for client
      await storage.createNotification({
        userId: application.clientId,
        title: `Статус заявки изменен`,
        message: `Статус вашей заявки №${application.id} изменен на: ${status}`,
        type: 'info'
      });
      
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Offer routes
  app.post('/api/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only managers can create offers
      if (user?.userType !== 'manager') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const offerData = insertLeasingOfferSchema.parse({
        ...req.body,
        managerId: userId
      });
      
      const offer = await storage.createOffer(offerData);
      
      // Get application to notify client
      const application = await storage.getApplication(offerData.applicationId);
      if (application) {
        await storage.createNotification({
          userId: application.clientId,
          title: `Новое предложение по лизингу`,
          message: `Получено новое предложение по заявке №${application.id}`,
          type: 'success'
        });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.get('/api/applications/:id/offers', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const offers = await storage.getOffersByApplication(applicationId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  app.post('/api/offers/:id/select', isAuthenticated, async (req: any, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const offer = await storage.selectOffer(offerId);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      // Update application status
      await storage.updateApplicationStatus(offer.applicationId, 'collecting_documents');
      
      res.json(offer);
    } catch (error) {
      console.error("Error selecting offer:", error);
      res.status(500).json({ message: "Failed to select offer" });
    }
  });

  // Car routes
  app.get('/api/cars', async (req, res) => {
    try {
      const filters = {
        brand: req.query.brand as string,
        model: req.query.model as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        isNew: req.query.isNew ? req.query.isNew === 'true' : undefined,
      };
      
      const cars = Object.values(filters).some(v => v !== undefined) 
        ? await storage.searchCars(filters)
        : await storage.getAllCars();
      
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.post('/api/cars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only suppliers can add cars
      if (user?.userType !== 'supplier') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const carData = insertCarSchema.parse({
        ...req.body,
        supplierId: userId
      });
      
      const car = await storage.createCar(carData);
      res.json(car);
    } catch (error) {
      console.error("Error creating car:", error);
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  // Document routes
  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        uploadedBy: userId
      });
      
      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get('/api/applications/:id/documents', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByApplication(applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Company routes
  app.get('/api/companies', async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers.map(user => ({
        ...user,
        password: undefined // Remove password from response
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/companies', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/admin/cars', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.post('/api/admin/companies', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const companyData = req.body;
      const [newCompany] = await db
        .insert(leasingCompanies)
        .values(companyData)
        .returning();
      
      res.json(newCompany);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.patch('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userId = parseInt(req.params.id);
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Car parser routes
  app.post('/api/admin/parse-cars', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { source, url } = req.body;
      
      // Simple car parser implementation
      const parsedCars = await parseCarCatalog(source, url);
      
      // Save parsed cars to database
      const savedCars = [];
      for (const carData of parsedCars) {
        const car = await storage.createCar({
          ...carData,
          supplierId: req.user.id
        });
        savedCars.push(car);
      }
      
      res.json({ 
        message: `Успешно загружено ${savedCars.length} автомобилей`,
        cars: savedCars 
      });
    } catch (error) {
      console.error("Error parsing cars:", error);
      res.status(500).json({ message: "Failed to parse cars" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
