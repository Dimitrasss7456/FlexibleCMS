import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database, Users, Building, Car, FileText, Bell, Plus, Edit, Trash2 } from "lucide-react";

interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
}

interface LeasingCompany {
  id: number;
  name: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: string;
  isNew: boolean;
  status: string;
  supplierId?: number;
}

export default function AdminDatabase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTable, setActiveTable] = useState("users");
  const [editingItem, setEditingItem] = useState<any>(null);

  // Users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: activeTable === "users",
  });

  // Companies data
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/admin/companies"],
    enabled: activeTable === "companies",
  });

  // Cars data
  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["/api/admin/cars"],
    enabled: activeTable === "cars",
  });

  // Applications data
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: activeTable === "applications",
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("PATCH", `/api/admin/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      toast({ title: "Пользователь обновлен" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({ title: "Пользователь удален" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      return apiRequest("POST", "/api/admin/companies", companyData);
    },
    onSuccess: () => {
      toast({ title: "Компания создана" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveUser = (userData: any) => {
    updateUserMutation.mutate(userData);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const renderUsersTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Управление пользователями</h3>
        <Button onClick={() => setEditingItem({ userType: "client", isActive: true })}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "-"}</TableCell>
              <TableCell>
                <Badge variant={user.userType === "admin" ? "destructive" : "secondary"}>
                  {user.userType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Активен" : "Неактивен"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.userType === "admin"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCompaniesTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Лизинговые компании</h3>
        <Button onClick={() => setEditingItem({ isActive: true })}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить компанию
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Мин. сумма</TableHead>
            <TableHead>Макс. сумма</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company: LeasingCompany) => (
            <TableRow key={company.id}>
              <TableCell>{company.id}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.minAmount ? `${company.minAmount.toLocaleString()} ₽` : "-"}</TableCell>
              <TableCell>{company.maxAmount ? `${company.maxAmount.toLocaleString()} ₽` : "-"}</TableCell>
              <TableCell>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Активна" : "Неактивна"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => setEditingItem(company)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCarsTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Каталог автомобилей</h3>
        <Button onClick={() => setEditingItem({ isNew: true, status: "available" })}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить автомобиль
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Марка</TableHead>
            <TableHead>Модель</TableHead>
            <TableHead>Год</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Состояние</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.map((car: Car) => (
            <TableRow key={car.id}>
              <TableCell>{car.id}</TableCell>
              <TableCell>{car.brand}</TableCell>
              <TableCell>{car.model}</TableCell>
              <TableCell>{car.year}</TableCell>
              <TableCell>{parseFloat(car.price).toLocaleString()} ₽</TableCell>
              <TableCell>
                <Badge variant={car.isNew ? "default" : "secondary"}>
                  {car.isNew ? "Новый" : "Б/У"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={car.status === "available" ? "default" : "secondary"}>
                  {car.status === "available" ? "Доступен" : "Недоступен"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => setEditingItem(car)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderApplicationsTable = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Заявки на лизинг</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app: any) => (
            <TableRow key={app.id}>
              <TableCell>{app.id}</TableCell>
              <TableCell>{app.clientId}</TableCell>
              <TableCell>{parseFloat(app.objectCost).toLocaleString()} ₽</TableCell>
              <TableCell>{app.leasingType}</TableCell>
              <TableCell>
                <Badge>{app.status}</Badge>
              </TableCell>
              <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">
                  Подробнее
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
          <p className="text-gray-600">Управление базой данных и контентом</p>
        </div>

        <Tabs value={activeTable} onValueChange={setActiveTable} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Компании</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Автомобили</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Заявки</span>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-6">
              <TabsContent value="users">{usersLoading ? "Загрузка..." : renderUsersTable()}</TabsContent>
              <TabsContent value="companies">{companiesLoading ? "Загрузка..." : renderCompaniesTable()}</TabsContent>
              <TabsContent value="cars">{carsLoading ? "Загрузка..." : renderCarsTable()}</TabsContent>
              <TabsContent value="applications">{applicationsLoading ? "Загрузка..." : renderApplicationsTable()}</TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? "Редактировать" : "Создать"} {
                  activeTable === "users" ? "пользователя" :
                  activeTable === "companies" ? "компанию" :
                  activeTable === "cars" ? "автомобиль" : "запись"
                }
              </DialogTitle>
            </DialogHeader>
            
            {editingItem && activeTable === "users" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Логин</Label>
                  <Input
                    id="username"
                    value={editingItem.username || ""}
                    onChange={(e) => setEditingItem({...editingItem, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingItem.email || ""}
                    onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="userType">Тип пользователя</Label>
                  <Select value={editingItem.userType} onValueChange={(value) => setEditingItem({...editingItem, userType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Клиент</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="supplier">Поставщик</SelectItem>
                      <SelectItem value="agent">Агент</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleSaveUser(editingItem)} className="w-full">
                  Сохранить
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}