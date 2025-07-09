
import { db } from "./db";
import { users } from "../shared/schema";
import { hashPassword } from "./auth";

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");
    
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        userType: "admin",
        firstName: "Администратор",
        lastName: "Системы",
        email: "admin@example.com",
        isActive: true
      })
      .returning();
    
    console.log("Администратор создан:", admin);
    process.exit(0);
  } catch (error) {
    console.error("Ошибка создания администратора:", error);
    process.exit(1);
  }
}

createAdmin();
