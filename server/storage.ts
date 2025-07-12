import {
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
} from "@shared/schema";

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
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: User[] = [];
  private applications: LeasingApplication[] = [];
  private offers: LeasingOffer[] = [];
  private companies: LeasingCompany[] = [];
  private cars: Car[] = [];
  private documents: Document[] = [];
  private notifications: Notification[] = [];
  private applicationMessages: ApplicationMessage[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some sample companies
    this.companies = [
      {
        id: 1,
        name: "AutoLeasing Pro",
        description: "Professional vehicle leasing services",
        minAmount: 10000,
        maxAmount: 500000,
        isActive: true,
        interestRate: 5.5,
        maxLeasingTerm: 60,
        requirements: JSON.stringify({
          minCreditScore: 600,
          minIncome: 30000,
          documents: ["passport", "income"]
        }),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "FlexiLease Solutions",
        description: "Flexible leasing options for all needs",
        minAmount: 5000,
        maxAmount: 300000,
        isActive: true,
        interestRate: 6.0,
        maxLeasingTerm: 48,
        requirements: JSON.stringify({
          minCreditScore: 550,
          minIncome: 25000,
          documents: ["passport", "income", "employment"]
        }),
        createdAt: new Date().toISOString()
      }
    ];

    // Initialize with sample cars
    this.cars = [
      {
        id: 1,
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        price: "35000",
        engine: "2.5L 4-cylinder",
        transmission: "Automatic",
        drive: "FWD",
        isNew: true,
        status: "available",
        supplierId: 1,
        images: JSON.stringify(["/api/placeholder/car1.jpg"]),
        specifications: JSON.stringify({
          fuel: "Gasoline",
          mpg: "32/41",
          safety: "5-star",
          warranty: "3 years"
        }),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        brand: "Honda",
        model: "Accord",
        year: 2024,
        price: "38000",
        engine: "1.5L Turbo",
        transmission: "CVT",
        drive: "FWD",
        isNew: true,
        status: "available",
        supplierId: 1,
        images: JSON.stringify(["/api/placeholder/car2.jpg"]),
        specifications: JSON.stringify({
          fuel: "Gasoline",
          mpg: "30/38",
          safety: "5-star",
          warranty: "3 years"
        }),
        createdAt: new Date().toISOString()
      }
    ];
    
    // Initialize demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo users with different roles
    await this.createUser({
      username: 'admin',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkhOtEDO4LgB2QK', // password: admin123
      email: 'admin@example.com',
      firstName: 'Администратор',
      lastName: 'Системы',
      userType: 'admin',
      isActive: true
    });

    await this.createUser({
      username: 'manager1',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkhOtEDO4LgB2QK', // password: admin123
      email: 'manager1@example.com',
      firstName: 'Менеджер',
      lastName: 'Иван',
      userType: 'manager',
      companyName: 'AutoLeasing Pro',
      isActive: true
    });

    await this.createUser({
      username: 'client1',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkhOtEDO4LgB2QK', // password: admin123
      email: 'client1@example.com',
      firstName: 'Клиент',
      lastName: 'Петр',
      userType: 'client',
      isActive: true
    });

    // Create sample applications
    await this.createApplication({
      clientId: 3,
      objectCost: '2500000',
      downPayment: '30',
      leasingTerm: 36,
      leasingType: 'Автомобиль',
      clientPhone: '+7-999-123-45-67',
      clientInn: '1234567890',
      isNewObject: true,
      isForRental: false,
      comment: 'Необходим автомобиль для работы',
      status: 'pending'
    });

    await this.createApplication({
      clientId: 3,
      objectCost: '5000000',
      downPayment: '25',
      leasingTerm: 48,
      leasingType: 'Оборудование',
      clientPhone: '+7-999-123-45-67',
      clientInn: '1234567890',
      isNewObject: true,
      isForRental: false,
      comment: 'Промышленное оборудование для производства',
      status: 'collecting_offers'
    });

    // Create sample offer for the second application
    await this.createOffer({
      applicationId: 2,
      companyId: 1,
      managerId: 2,
      monthlyPayment: '135000',
      firstPayment: '1250000',
      buyoutPayment: '50000',
      totalCost: '5530000',
      interestRate: '12.5'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  // Application operations
  async createApplication(application: InsertLeasingApplication): Promise<LeasingApplication> {
    const app: LeasingApplication = {
      id: this.nextId++,
      ...application,
      status: 'pending',
      createdAt: new Date().toISOString()
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
      isSelected: false,
      createdAt: new Date().toISOString()
    };
    this.offers.push(newOffer);
    return newOffer;
  }

  async getOffersByApplication(applicationId: number): Promise<LeasingOffer[]> {
    return this.offers.filter(offer => offer.applicationId === applicationId);
  }

  async selectOffer(offerId: number): Promise<LeasingOffer | undefined> {
    const offer = this.offers.find(offer => offer.id === offerId);
    if (offer) {
      offer.isSelected = true;
      // Unselect other offers for the same application
      this.offers.forEach(o => {
        if (o.applicationId === offer.applicationId && o.id !== offerId) {
          o.isSelected = false;
        }
      });
    }
    return offer;
  }

  // Company operations
  async getAllCompanies(): Promise<LeasingCompany[]> {
    return this.companies.filter(company => company.isActive);
  }

  async getCompatibleCompanies(application: LeasingApplication): Promise<LeasingCompany[]> {
    const amount = parseFloat(application.objectCost || '0');
    return this.companies.filter(company => 
      company.isActive &&
      (!company.minAmount || amount >= company.minAmount) &&
      (!company.maxAmount || amount <= company.maxAmount)
    );
  }

  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const newCar: Car = {
      id: this.nextId++,
      ...car,
      createdAt: new Date().toISOString()
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
      if (filters.brand && car.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.model && car.model.toLowerCase() !== filters.model.toLowerCase()) return false;
      if (filters.year && car.year !== filters.year) return false;
      if (filters.isNew !== undefined && car.isNew !== filters.isNew) return false;
      if (filters.minPrice && parseFloat(car.price) < filters.minPrice) return false;
      if (filters.maxPrice && parseFloat(car.price) > filters.maxPrice) return false;
      return true;
    });
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const newDoc: Document = {
      id: this.nextId++,
      ...document,
      createdAt: new Date().toISOString()
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
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
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
      createdAt: new Date().toISOString()
    };
    this.applicationMessages.push(newMessage);
    return newMessage;
  }

  async getApplicationMessages(applicationId: number): Promise<ApplicationMessage[]> {
    return this.applicationMessages
      .filter(message => message.applicationId === applicationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Application workflow operations
  async approveApplication(id: number, adminId: number): Promise<LeasingApplication | undefined> {
    const app = this.applications.find(app => app.id === id);
    if (app && app.status === 'pending') {
      app.status = 'approved_by_admin';
      
      // Create system message
      await this.createApplicationMessage({
        applicationId: id,
        senderId: adminId,
        message: 'Заявка одобрена администратором и передана менеджерам для формирования предложений',
        isSystemMessage: true
      });
      
      // Send to managers
      await this.sendApplicationToManagers(id);
    }
    return app;
  }

  async rejectApplication(id: number, adminId: number, reason: string): Promise<LeasingApplication | undefined> {
    const app = this.applications.find(app => app.id === id);
    if (app && app.status === 'pending') {
      app.status = 'rejected';
      
      // Create system message
      await this.createApplicationMessage({
        applicationId: id,
        senderId: adminId,
        message: `Заявка отклонена администратором. Причина: ${reason}`,
        isSystemMessage: true
      });
      
      // Notify client
      await this.createNotification({
        userId: app.clientId,
        title: 'Заявка отклонена',
        message: `Ваша заявка №${id} была отклонена. Причина: ${reason}`,
        type: 'error'
      });
    }
    return app;
  }

  async sendApplicationToManagers(applicationId: number): Promise<void> {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return;

    const managers = await this.getAllManagers();
    const compatibleCompanies = await this.getCompatibleCompanies(application);
    
    // Find managers from compatible companies
    for (const manager of managers) {
      const hasCompatibleCompany = compatibleCompanies.some(company => 
        company.name === manager.companyName
      );
      
      if (hasCompatibleCompany) {
        await this.createNotification({
          userId: manager.id,
          title: 'Новая заявка',
          message: `Поступила новая заявка №${applicationId} на сумму ${application.objectCost} руб.`,
          type: 'info'
        });
      }
    }
    
    // Update application status
    const app = this.applications.find(app => app.id === applicationId);
    if (app) {
      app.status = 'collecting_offers';
    }
  }

  async getAllManagers(): Promise<User[]> {
    return this.users.filter(user => user.userType === 'manager' && user.isActive);
  }
}

export const storage = new MemStorage();
