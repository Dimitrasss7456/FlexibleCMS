
import { db } from "./db";
import { users } from "../shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function updateAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");
    
    const [updatedAdmin] = await db
      .update(users)
      .set({
        password: hashedPassword,
        userType: "admin",
        isActive: true
      })
      .where(eq(users.username, "admin"))
      .returning();
    
    if (updatedAdmin) {
      console.log("Пароль администратора обновлен:", updatedAdmin.username);
    } else {
      console.log("Администратор не найден, создаем нового...");
      const [newAdmin] = await db
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
      console.log("Новый администратор создан:", newAdmin.username);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Ошибка обновления администратора:", error);
    process.exit(1);
  }
}

updateAdmin();
