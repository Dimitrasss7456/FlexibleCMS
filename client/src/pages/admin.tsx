import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Users, Building, FileText, Car, Database, Download, Settings, BarChart3 } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/admin/companies"],
  });

  const { data: cars = [] } = useQuery({
    queryKey: ["/api/admin/cars"],
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
          <p className="text-gray-600">Добро пожаловать, {user?.firstName || user?.username}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/database">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Database className="h-10 w-10 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Управление БД</h3>
                    <p className="text-sm text-gray-600">Пользователи, компании, автомобили</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/parser">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Download className="h-10 w-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Парсер данных</h3>
                    <p className="text-sm text-gray-600">Загрузка автомобилей</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <BarChart3 className="h-10 w-10 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Аналитика</h3>
                  <p className="text-sm text-gray-600">Отчеты и статистика</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Зарегистрированных пользователей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заявки</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">Лизинговых заявок</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Компании</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">Лизинговых компаний</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Автомобили</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cars.length}</div>
              <p className="text-xs text-muted-foreground">В каталоге</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Последние пользователи</CardTitle>
            <CardDescription>Недавно зарегистрировавшиеся пользователи</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.userType}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Последние заявки</CardTitle>
            <CardDescription>Недавно поданные заявки на лизинг</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.slice(0, 5).map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>#{app.id}</TableCell>
                    <TableCell>{app.clientId}</TableCell>
                    <TableCell>{parseFloat(app.objectCost).toLocaleString()} ₽</TableCell>
                    <TableCell>{app.leasingType}</TableCell>
                    <TableCell>
                      <Badge>{app.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}