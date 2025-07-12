import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Settings, 
  Database, 
  Bot, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalApplications: number;
  totalPages: number;
  totalForms: number;
  totalParsers: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/admin/applications"],
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["/api/admin/pages"],
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["/api/admin/forms"],
  });

  const { data: parsers = [] } = useQuery({
    queryKey: ["/api/admin/parsers"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Панель администратора
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Управление всеми аспектами лизинговой платформы
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заявки</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Страницы</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPages || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Формы</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalForms || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Парсеры</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalParsers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="applications">Заявки</TabsTrigger>
            <TabsTrigger value="pages">Страницы</TabsTrigger>
            <TabsTrigger value="forms">Формы</TabsTrigger>
            <TabsTrigger value="parsers">Парсеры</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление пользователями</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Поиск пользователей..."
                        className="pl-9 pr-3 py-2 border rounded-md w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => navigate("/admin/users/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать пользователя
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Имя пользователя</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Тип</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((user: any) =>
                          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user: any) => (
                          <tr key={user.id} className="border-b">
                            <td className="p-2">{user.id}</td>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.email || "—"}</td>
                            <td className="p-2">
                              <Badge variant={user.userType === "admin" ? "default" : "secondary"}>
                                {user.userType}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Активен" : "Неактивен"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление заявками</CardTitle>
                  <Button onClick={() => navigate("/admin/applications")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Подробная статистика
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Клиент</th>
                        <th className="text-left p-2">Стоимость</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Дата создания</th>
                        <th className="text-left p-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 10).map((application: any) => (
                        <tr key={application.id} className="border-b">
                          <td className="p-2">{application.id}</td>
                          <td className="p-2">{application.clientPhone}</td>
                          <td className="p-2">{Number(application.objectCost).toLocaleString()} ₽</td>
                          <td className="p-2">
                            <Badge variant="secondary">
                              {application.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/applications/${application.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/applications/${application.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление страницами</CardTitle>
                  <Button onClick={() => navigate("/admin/pages/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать страницу
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Заголовок</th>
                        <th className="text-left p-2">URL</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Обновлено</th>
                        <th className="text-left p-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page: any) => (
                        <tr key={page.id} className="border-b">
                          <td className="p-2">{page.id}</td>
                          <td className="p-2">{page.title}</td>
                          <td className="p-2">/{page.slug}</td>
                          <td className="p-2">
                            <Badge variant={page.isPublished ? "default" : "secondary"}>
                              {page.isPublished ? "Опубликовано" : "Черновик"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/${page.slug}`, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/pages/${page.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление формами</CardTitle>
                  <Button onClick={() => navigate("/admin/forms/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать форму
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Название</th>
                        <th className="text-left p-2">Заголовок</th>
                        <th className="text-left p-2">Поля</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((form: any) => (
                        <tr key={form.id} className="border-b">
                          <td className="p-2">{form.id}</td>
                          <td className="p-2">{form.name}</td>
                          <td className="p-2">{form.title}</td>
                          <td className="p-2">{form.fields?.length || 0} полей</td>
                          <td className="p-2">
                            <Badge variant={form.isActive ? "default" : "secondary"}>
                              {form.isActive ? "Активна" : "Неактивна"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/forms/${form.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parsers Tab */}
          <TabsContent value="parsers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление парсерами</CardTitle>
                  <Button onClick={() => navigate("/admin/parsers/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать парсер
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Название</th>
                        <th className="text-left p-2">URL источника</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Последний запуск</th>
                        <th className="text-left p-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsers.map((parser: any) => (
                        <tr key={parser.id} className="border-b">
                          <td className="p-2">{parser.id}</td>
                          <td className="p-2">{parser.name}</td>
                          <td className="p-2">
                            <a 
                              href={parser.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {parser.sourceUrl}
                            </a>
                          </td>
                          <td className="p-2">
                            <Badge variant={parser.isActive ? "default" : "secondary"}>
                              {parser.isActive ? "Активен" : "Неактивен"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {parser.lastRun ? new Date(parser.lastRun).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/parsers/${parser.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/parsers/${parser.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/settings/general")}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Settings className="h-8 w-8 mb-2" />
                      Общие настройки
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/database")}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Database className="h-8 w-8 mb-2" />
                      Управление БД
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}