import {
  users,
  leasingApplications,
  leasingOffers,
  leasingCompanies,
  cars,
  documents,
  notifications,
  applicationMessages,
  pages,
  forms,
  formSubmissions,
  parsers,
  parserRuns,
  systemSettings,
  auditLogs,
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
  type InsertApplicationMessage,
  type ApplicationMessage,
  type LeasingCompany,
  type Page,
  type InsertPage,
  type Form,
  type InsertForm,
  type FormSubmission,
  type InsertFormSubmission,
  type Parser,
  type InsertParser,
  type ParserRun,
  type SystemSetting,
  type InsertSystemSetting,
  type AuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc } from "drizzle-orm";

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
  
  // Message operations
  createApplicationMessage(message: InsertApplicationMessage): Promise<ApplicationMessage>;
  getApplicationMessages(applicationId: number): Promise<ApplicationMessage[]>;
  
  // Application workflow operations
  approveApplication(id: number, adminId: number): Promise<LeasingApplication | undefined>;
  rejectApplication(id: number, adminId: number, reason: string): Promise<LeasingApplication | undefined>;
  sendApplicationToManagers(applicationId: number): Promise<void>;
  getAllManagers(): Promise<User[]>;
  
  // CMS operations
  createPage(page: InsertPage): Promise<Page>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(): Promise<Page[]>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  
  createForm(form: InsertForm): Promise<Form>;
  getAllForms(): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getFormSubmissions(formId: number): Promise<FormSubmission[]>;
  
  createParser(parser: InsertParser): Promise<Parser>;
  getAllParsers(): Promise<Parser[]>;
  updateParser(id: number, parser: Partial<InsertParser>): Promise<Parser | undefined>;
  deleteParser(id: number): Promise<boolean>;
  
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting | undefined>;
  
  createAuditLog(log: Partial<AuditLog>): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private applications: LeasingApplication[] = [];
  private offers: LeasingOffer[] = [];
  private companies: LeasingCompany[] = [];
  private cars: Car[] = [];
  private documents: Document[] = [];
  private notifications: Notification[] = [];
  private applicationMessages: ApplicationMessage[] = [];
  private pages: Page[] = [];
  private forms: Form[] = [];
  private formSubmissions: FormSubmission[] = [];
  private parsers: Parser[] = [];
  private parserRuns: ParserRun[] = [];
  private systemSettings: SystemSetting[] = [];
  private auditLogs: AuditLog[] = [];
  private nextId = 1;

  constructor() {
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo admin user
    const adminUser: User = {
      id: this.nextId++,
      username: "admin",
      password: "$2b$10$dummy.hash.for.demo",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      userType: "admin",
      phone: "+7 (999) 999-99-99",
      inn: null,
      companyName: null,
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(adminUser);

    // Create demo pages
    this.pages.push({
      id: this.nextId++,
      title: "Главная страница",
      slug: "home",
      content: "Добро пожаловать на платформу лизинга",
      metaTitle: "Лизинг.ОРГ - Главная",
      metaDescription: "Лизинговая платформа для клиентов, агентов и поставщиков",
      isPublished: true,
      template: "default",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create demo forms
    this.forms.push({
      id: this.nextId++,
      name: "leasing_application",
      title: "Заявка на лизинг",
      description: "Форма подачи заявки на лизинг",
      fields: [
        {
          name: "objectCost",
          type: "number",
          label: "Стоимость объекта",
          required: true,
          placeholder: "Введите стоимость",
        },
        {
          name: "downPayment",
          type: "number",
          label: "Первоначальный взнос (%)",
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: "leasingTerm",
          type: "select",
          label: "Срок лизинга (месяцы)",
          required: true,
          options: [12, 24, 36, 48, 60],
        },
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create demo system settings
    this.systemSettings.push(
      {
        id: this.nextId++,
        key: "site_title",
        value: "Лизинг.ОРГ",
        type: "string",
        description: "Название сайта",
        category: "general",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextId++,
        key: "max_file_size",
        value: "10485760",
        type: "number",
        description: "Максимальный размер файла (байты)",
        category: "upload",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    // Create demo leasing companies
    this.companies.push(
      {
        id: this.nextId++,
        name: "Альфа-Лизинг",
        description: "Лизинг автомобилей и оборудования",
        logo: null,
        isActive: true,
        minAmount: "100000",
        maxAmount: "50000000",
        minTerm: 12,
        maxTerm: 60,
        interestRate: "12.5",
        maxLeasingTerm: 60,
        requirements: {
          minExperience: 12,
          requiredDocuments: ["устав", "баланс"],
        },
        workWithUsed: true,
        workWithAuto: true,
        workWithEquipment: true,
        workWithRealEstate: false,
        createdAt: new Date(),
      },
      {
        id: this.nextId++,
        name: "Сбербанк Лизинг",
        description: "Универсальная лизинговая компания",
        logo: null,
        isActive: true,
        minAmount: "500000",
        maxAmount: "100000000",
        minTerm: 12,
        maxTerm: 84,
        interestRate: "11.8",
        maxLeasingTerm: 84,
        requirements: {
          minExperience: 24,
          requiredDocuments: ["устав", "баланс", "справка из банка"],
        },
        workWithUsed: true,
        workWithAuto: true,
        workWithEquipment: true,
        workWithRealEstate: true,
        createdAt: new Date(),
      }
    );
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...userData,
      userType: userData.userType || "client",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      phone: userData.phone || null,
      inn: userData.inn || null,
      companyName: userData.companyName || null,
      isActive: userData.isActive ?? true,
      isVerified: userData.isVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Application operations
  async createApplication(application: InsertLeasingApplication): Promise<LeasingApplication> {
    const app: LeasingApplication = {
      id: this.nextId++,
      ...application,
      agentId: application.agentId || null,
      isNewObject: application.isNewObject ?? true,
      isForRental: application.isForRental ?? false,
      comment: application.comment || null,
      status: application.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.push(app);
    return app;
  }

  async getApplicationsByClient(clientId: number): Promise<LeasingApplication[]> {
    return this.applications.filter(app => app.clientId === clientId);
  }

  async getApplicationsByAgent(agentId: number): Promise<LeasingApplication[]> {
    return this.applications.filter(app => app.agentId === agentId);
  }

  async getApplication(id: number): Promise<LeasingApplication | undefined> {
    return this.applications.find(app => app.id === id);
  }

  async updateApplicationStatus(id: number, status: string): Promise<LeasingApplication | undefined> {
    const app = this.applications.find(app => app.id === id);
    if (app) {
      app.status = status;
      app.updatedAt = new Date();
    }
    return app;
  }

  async getAllApplications(): Promise<LeasingApplication[]> {
    return this.applications;
  }

  // Offer operations
  async createOffer(offer: InsertLeasingOffer): Promise<LeasingOffer> {
    const newOffer: LeasingOffer = {
      id: this.nextId++,
      ...offer,
      interestRate: offer.interestRate || null,
      managerId: offer.managerId || null,
      isSelected: offer.isSelected ?? false,
      createdAt: new Date(),
    };
    this.offers.push(newOffer);
    return newOffer;
  }

  async getOffersByApplication(applicationId: number): Promise<LeasingOffer[]> {
    return this.offers.filter(offer => offer.applicationId === applicationId);
  }

  async selectOffer(offerId: number): Promise<LeasingOffer | undefined> {
    // First, deselect all offers for this application
    const offer = this.offers.find(o => o.id === offerId);
    if (offer) {
      this.offers.forEach(o => {
        if (o.applicationId === offer.applicationId) {
          o.isSelected = false;
        }
      });
      offer.isSelected = true;
    }
    return offer;
  }

  // Company operations
  async getAllCompanies(): Promise<LeasingCompany[]> {
    return this.companies;
  }

  async getCompatibleCompanies(application: LeasingApplication): Promise<LeasingCompany[]> {
    return this.companies.filter(company => {
      if (!company.isActive) return false;
      if (company.minAmount && Number(application.objectCost) < Number(company.minAmount)) return false;
      if (company.maxAmount && Number(application.objectCost) > Number(company.maxAmount)) return false;
      if (company.minTerm && application.leasingTerm < company.minTerm) return false;
      if (company.maxTerm && application.leasingTerm > company.maxTerm) return false;
      
      // Check if company works with the leasing type
      switch (application.leasingType) {
        case "auto":
          return company.workWithAuto;
        case "equipment":
          return company.workWithEquipment;
        case "real_estate":
          return company.workWithRealEstate;
        default:
          return true;
      }
    });
  }

  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const newCar: Car = {
      id: this.nextId++,
      ...car,
      status: car.status || "available",
      engine: car.engine || null,
      transmission: car.transmission || null,
      drive: car.drive || null,
      isNew: car.isNew ?? true,
      supplierId: car.supplierId || null,
      images: car.images || [],
      specifications: car.specifications || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cars.push(newCar);
    return newCar;
  }

  async getAllCars(): Promise<Car[]> {
    return this.cars;
  }

  async getCarsBySupplier(supplierId: number): Promise<Car[]> {
    return this.cars.filter(car => car.supplierId === supplierId);
  }

  async searchCars(filters: {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    isNew?: boolean;
  }): Promise<Car[]> {
    return this.cars.filter(car => {
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (filters.minPrice && Number(car.price) < filters.minPrice) return false;
      if (filters.maxPrice && Number(car.price) > filters.maxPrice) return false;
      if (filters.year && car.year !== filters.year) return false;
      if (filters.isNew !== undefined && car.isNew !== filters.isNew) return false;
      return true;
    });
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const newDoc: Document = {
      id: this.nextId++,
      ...document,
      createdAt: new Date(),
    };
    this.documents.push(newDoc);
    return newDoc;
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return this.documents.filter(doc => doc.applicationId === applicationId);
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.nextId++,
      ...notification,
      isRead: notification.isRead ?? false,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notifications.filter(notification => notification.userId === userId);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Message operations
  async createApplicationMessage(message: InsertApplicationMessage): Promise<ApplicationMessage> {
    const newMessage: ApplicationMessage = {
      id: this.nextId++,
      ...message,
      isSystemMessage: message.isSystemMessage ?? false,
      createdAt: new Date(),
    };
    this.applicationMessages.push(newMessage);
    return newMessage;
  }

  async getApplicationMessages(applicationId: number): Promise<ApplicationMessage[]> {
    return this.applicationMessages.filter(msg => msg.applicationId === applicationId);
  }

  // Application workflow operations
  async approveApplication(id: number, adminId: number): Promise<LeasingApplication | undefined> {
    const app = this.applications.find(app => app.id === id);
    if (app) {
      app.status = "approved_by_admin";
      app.updatedAt = new Date();
      
      // Create notification
      await this.createNotification({
        userId: app.clientId,
        title: "Заявка одобрена",
        message: "Ваша заявка на лизинг одобрена администратором",
        type: "success",
      });
    }
    return app;
  }

  async rejectApplication(id: number, adminId: number, reason: string): Promise<LeasingApplication | undefined> {
    const app = this.applications.find(app => app.id === id);
    if (app) {
      app.status = "rejected";
      app.updatedAt = new Date();
      
      // Create notification
      await this.createNotification({
        userId: app.clientId,
        title: "Заявка отклонена",
        message: `Ваша заявка на лизинг отклонена: ${reason}`,
        type: "error",
      });
    }
    return app;
  }

  async sendApplicationToManagers(applicationId: number): Promise<void> {
    const app = this.applications.find(app => app.id === applicationId);
    if (app) {
      app.status = "collecting_offers";
      app.updatedAt = new Date();
      
      // Notify managers
      const managers = this.users.filter(u => u.userType === "manager");
      for (const manager of managers) {
        await this.createNotification({
          userId: manager.id,
          title: "Новая заявка",
          message: `Поступила новая заявка на лизинг #${applicationId}`,
          type: "info",
        });
      }
    }
  }

  async getAllManagers(): Promise<User[]> {
    return this.users.filter(u => u.userType === "manager");
  }

  // CMS operations
  async createPage(page: InsertPage): Promise<Page> {
    const newPage: Page = {
      id: this.nextId++,
      ...page,
      content: page.content || null,
      metaTitle: page.metaTitle || null,
      metaDescription: page.metaDescription || null,
      isPublished: page.isPublished ?? false,
      template: page.template || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pages.push(newPage);
    return newPage;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return this.pages.find(p => p.slug === slug);
  }

  async getAllPages(): Promise<Page[]> {
    return this.pages;
  }

  async updatePage(id: number, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    const page = this.pages.find(p => p.id === id);
    if (page) {
      Object.assign(page, pageData);
      page.updatedAt = new Date();
    }
    return page;
  }

  async deletePage(id: number): Promise<boolean> {
    const index = this.pages.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pages.splice(index, 1);
      return true;
    }
    return false;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const newForm: Form = {
      id: this.nextId++,
      ...form,
      isActive: form.isActive ?? true,
      description: form.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forms.push(newForm);
    return newForm;
  }

  async getAllForms(): Promise<Form[]> {
    return this.forms;
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.find(f => f.id === id);
  }

  async updateForm(id: number, formData: Partial<InsertForm>): Promise<Form | undefined> {
    const form = this.forms.find(f => f.id === id);
    if (form) {
      Object.assign(form, formData);
      form.updatedAt = new Date();
    }
    return form;
  }

  async deleteForm(id: number): Promise<boolean> {
    const index = this.forms.findIndex(f => f.id === id);
    if (index !== -1) {
      this.forms.splice(index, 1);
      return true;
    }
    return false;
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const newSubmission: FormSubmission = {
      id: this.nextId++,
      ...submission,
      userAgent: submission.userAgent || null,
      ipAddress: submission.ipAddress || null,
      createdAt: new Date(),
    };
    this.formSubmissions.push(newSubmission);
    return newSubmission;
  }

  async getFormSubmissions(formId: number): Promise<FormSubmission[]> {
    return this.formSubmissions.filter(s => s.formId === formId);
  }

  async createParser(parser: InsertParser): Promise<Parser> {
    const newParser: Parser = {
      id: this.nextId++,
      ...parser,
      isActive: parser.isActive ?? true,
      lastRun: parser.lastRun || null,
      nextRun: parser.nextRun || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.parsers.push(newParser);
    return newParser;
  }

  async getAllParsers(): Promise<Parser[]> {
    return this.parsers;
  }

  async updateParser(id: number, parserData: Partial<InsertParser>): Promise<Parser | undefined> {
    const parser = this.parsers.find(p => p.id === id);
    if (parser) {
      Object.assign(parser, parserData);
      parser.updatedAt = new Date();
    }
    return parser;
  }

  async deleteParser(id: number): Promise<boolean> {
    const index = this.parsers.findIndex(p => p.id === id);
    if (index !== -1) {
      this.parsers.splice(index, 1);
      return true;
    }
    return false;
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return this.systemSettings;
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    return this.systemSettings.find(s => s.key === key);
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting | undefined> {
    const setting = this.systemSettings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updatedAt = new Date();
    }
    return setting;
  }

  async createAuditLog(logData: Partial<AuditLog>): Promise<AuditLog> {
    const log: AuditLog = {
      id: this.nextId++,
      userId: logData.userId || null,
      action: logData.action || "unknown",
      tableName: logData.tableName || null,
      recordId: logData.recordId || null,
      oldValues: logData.oldValues || null,
      newValues: logData.newValues || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.push(log);
    return log;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogs.slice(0, limit);
  }
}

// Database implementation will be added when database is available

// Use DatabaseStorage for real database operations
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        userType: insertUser.userType || "client",
        email: insertUser.email || null,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        phone: insertUser.phone || null,
        inn: insertUser.inn || null,
        companyName: insertUser.companyName || null,
        isActive: insertUser.isActive ?? true,
        isVerified: insertUser.isVerified ?? false,
      })
      .returning();
    return user;
  }

  async getAllApplications(): Promise<LeasingApplication[]> {
    return await db.select().from(leasingApplications).orderBy(desc(leasingApplications.createdAt));
  }

  async createApplication(application: InsertLeasingApplication): Promise<LeasingApplication> {
    const [app] = await db
      .insert(leasingApplications)
      .values({
        ...application,
        agentId: application.agentId || null,
        isNewObject: application.isNewObject ?? true,
        isForRental: application.isForRental ?? false,
        comment: application.comment || null,
        status: application.status || "pending",
      })
      .returning();
    return app;
  }

  async getApplicationById(id: number): Promise<LeasingApplication | undefined> {
    const [app] = await db.select().from(leasingApplications).where(eq(leasingApplications.id, id));
    return app || undefined;
  }

  async updateApplicationStatus(id: number, status: string): Promise<LeasingApplication | undefined> {
    const [app] = await db
      .update(leasingApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(leasingApplications.id, id))
      .returning();
    return app || undefined;
  }

  // CMS operations
  async getAllPages(): Promise<Page[]> {
    return await db.select().from(pages).orderBy(desc(pages.updatedAt));
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [newPage] = await db
      .insert(pages)
      .values({
        ...page,
        content: page.content || null,
        metaTitle: page.metaTitle || null,
        metaDescription: page.metaDescription || null,
        isPublished: page.isPublished ?? false,
        template: page.template || null,
      })
      .returning();
    return newPage;
  }

  async updatePage(id: number, updates: Partial<InsertPage>): Promise<Page | undefined> {
    const [page] = await db
      .update(pages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page || undefined;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return result.rowCount > 0;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page || undefined;
  }

  async getAllForms(): Promise<Form[]> {
    return await db.select().from(forms).orderBy(desc(forms.updatedAt));
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db
      .insert(forms)
      .values({
        ...form,
        isActive: form.isActive ?? true,
        description: form.description || null,
      })
      .returning();
    return newForm;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return form || undefined;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result.rowCount > 0;
  }

  async getAllParsers(): Promise<Parser[]> {
    return await db.select().from(parsers).orderBy(desc(parsers.updatedAt));
  }

  async createParser(parser: InsertParser): Promise<Parser> {
    const [newParser] = await db
      .insert(parsers)
      .values({
        ...parser,
        isActive: parser.isActive ?? true,
        lastRun: parser.lastRun || null,
        nextRun: parser.nextRun || null,
      })
      .returning();
    return newParser;
  }

  async updateParser(id: number, updates: Partial<InsertParser>): Promise<Parser | undefined> {
    const [parser] = await db
      .update(parsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(parsers.id, id))
      .returning();
    return parser || undefined;
  }

  async deleteParser(id: number): Promise<boolean> {
    const result = await db.delete(parsers).where(eq(parsers.id, id));
    return result.rowCount > 0;
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [newSubmission] = await db
      .insert(formSubmissions)
      .values({
        ...submission,
        userAgent: submission.userAgent || null,
        ipAddress: submission.ipAddress || null,
      })
      .returning();
    return newSubmission;
  }

  // Stub implementations for other methods - implement as needed
  async getAllCars(): Promise<Car[]> {
    return await db.select().from(cars).orderBy(desc(cars.createdAt));
  }

  async getAllCompanies(): Promise<LeasingCompany[]> {
    return await db.select().from(leasingCompanies);
  }

  async getAllManagers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.userType, "manager"));
  }

  // Add other method stubs as needed...
  async createOffer(offer: InsertLeasingOffer): Promise<LeasingOffer> {
    const [newOffer] = await db
      .insert(leasingOffers)
      .values({
        ...offer,
        interestRate: offer.interestRate || null,
        managerId: offer.managerId || null,
        isSelected: offer.isSelected ?? false,
      })
      .returning();
    return newOffer;
  }

  async getOffersByApplication(applicationId: number): Promise<LeasingOffer[]> {
    return await db.select().from(leasingOffers).where(eq(leasingOffers.applicationId, applicationId));
  }

  async selectOffer(offerId: number): Promise<LeasingOffer | undefined> {
    const [offer] = await db
      .update(leasingOffers)
      .set({ isSelected: true })
      .where(eq(leasingOffers.id, offerId))
      .returning();
    return offer || undefined;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db
      .insert(cars)
      .values({
        ...car,
        status: car.status || "available",
        engine: car.engine || null,
        transmission: car.transmission || null,
        drive: car.drive || null,
        isNew: car.isNew ?? true,
        supplierId: car.supplierId || null,
        images: car.images || [],
        specifications: car.specifications || {},
      })
      .returning();
    return newCar;
  }

  async searchCars(filters: {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    isNew?: boolean;
  }): Promise<Car[]> {
    // Implement filtering logic using Drizzle queries
    return await db.select().from(cars);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(document).returning();
    return newDoc;
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.applicationId, applicationId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        isRead: notification.isRead ?? false,
      })
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async createApplicationMessage(message: InsertApplicationMessage): Promise<ApplicationMessage> {
    const [newMessage] = await db
      .insert(applicationMessages)
      .values({
        ...message,
        isSystemMessage: message.isSystemMessage ?? false,
      })
      .returning();
    return newMessage;
  }

  async getApplicationMessages(applicationId: number): Promise<ApplicationMessage[]> {
    return await db.select().from(applicationMessages).where(eq(applicationMessages.applicationId, applicationId));
  }

  async approveApplication(id: number, adminId: number): Promise<LeasingApplication | undefined> {
    const [app] = await db
      .update(leasingApplications)
      .set({ status: "approved_by_admin", updatedAt: new Date() })
      .where(eq(leasingApplications.id, id))
      .returning();
    
    if (app) {
      await this.createNotification({
        userId: app.clientId,
        title: "Заявка одобрена",
        message: "Ваша заявка на лизинг одобрена администратором",
        type: "success",
      });
    }
    
    return app || undefined;
  }

  async rejectApplication(id: number, adminId: number, reason: string): Promise<LeasingApplication | undefined> {
    const [app] = await db
      .update(leasingApplications)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(leasingApplications.id, id))
      .returning();
    
    if (app) {
      await this.createNotification({
        userId: app.clientId,
        title: "Заявка отклонена",
        message: `Ваша заявка на лизинг отклонена. Причина: ${reason}`,
        type: "error",
      });
    }
    
    return app || undefined;
  }

  async getCompatibleCompanies(application: LeasingApplication): Promise<LeasingCompany[]> {
    const companies = await db.select().from(leasingCompanies);
    return companies.filter((company: LeasingCompany) => {
      if (!company.isActive) return false;
      if (company.minAmount && Number(application.objectCost) < Number(company.minAmount)) return false;
      if (company.maxAmount && Number(application.objectCost) > Number(company.maxAmount)) return false;
      if (company.minTerm && application.leasingTerm < company.minTerm) return false;
      if (company.maxTerm && application.leasingTerm > company.maxTerm) return false;
      return true;
    });
  }

  async getCarsBySupplier(supplierId: number): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.supplierId, supplierId));
  }

  async getFormSubmissions(formId: number): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.formId, formId));
  }

  // Missing methods from IStorage interface
  async getApplicationsByClient(clientId: number): Promise<LeasingApplication[]> {
    return await db.select().from(leasingApplications).where(eq(leasingApplications.clientId, clientId));
  }

  async getApplicationsByAgent(agentId: number): Promise<LeasingApplication[]> {
    return await db.select().from(leasingApplications).where(eq(leasingApplications.agentId, agentId));
  }

  async getApplication(id: number): Promise<LeasingApplication | undefined> {
    return await this.getApplicationById(id);
  }

  async sendApplicationToManagers(applicationId: number): Promise<void> {
    const managers = await this.getAllManagers();
    for (const manager of managers) {
      await this.createNotification({
        userId: manager.id,
        title: "Новая заявка",
        message: `Поступила новая заявка на лизинг #${applicationId}`,
        type: "info",
      });
    }
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return setting || undefined;
  }

  async createAuditLog(logData: Partial<AuditLog>): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values({
        userId: logData.userId || null,
        action: logData.action || "unknown",
        tableName: logData.tableName || null,
        recordId: logData.recordId || null,
        oldValues: logData.oldValues || null,
        newValues: logData.newValues || null,
        ipAddress: logData.ipAddress || null,
        userAgent: logData.userAgent || null,
      })
      .returning();
    return log;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }
}

// Use DatabaseStorage when DATABASE_URL is available, otherwise use MemStorage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();