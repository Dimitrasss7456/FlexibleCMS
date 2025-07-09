import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { HandHeart, Bell } from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <HandHeart className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">Лизинг.ОРГ</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === "/" ? "text-gray-900" : "text-gray-500 hover:text-primary"
                  }`}>
                    Главная
                  </a>
                </Link>
                <Link href="/catalog">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === "/catalog" ? "text-gray-900" : "text-gray-500 hover:text-primary"
                  }`}>
                    Каталог
                  </a>
                </Link>
                <a href="#how-it-works" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Как это работает
                </a>
                <a href="#partners" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Партнеры
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User menu */}
                <Link href="/dashboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </span>
                  </Button>
                </Link>

                {/* Admin link */}
                {user.userType === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Админ
                    </Button>
                  </Link>
                )}

                {/* Logout */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  asChild
                >
                  <Link href="/login">Войти</Link>
                </Button>
                <Button 
                  asChild
                >
                  <Link href="/register">Регистрация</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
