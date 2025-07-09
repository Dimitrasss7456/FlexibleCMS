import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Edit, 
  FileText, 
  Settings, 
  Users, 
  Plus, 
  Download,
  Trash2
} from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== 'admin')) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав доступа к административной панели",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user && user.userType === 'admin',
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user && user.userType === 'admin',
  });

  if (isLoading || !isAuthenticated || user?.userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      collecting_offers: { label: "Сбор предложений", variant: "secondary" as const },
      reviewing_offers: { label: "Рассмотрение предложений", variant: "outline" as const },
      collecting_documents: { label: "Сбор документов", variant: "default" as const },
      document_review: { label: "Доработка документов", variant: "destructive" as const },
      approved: { label: "Одобрено", variant: "default" as const, className: "bg-success text-white" },
      rejected: { label: "Отказ", variant: "destructive" as const },
      issued: { label: "Выдано", variant: "default" as const, className: "bg-success text-white" },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.collecting_offers;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Mock table structure for demonstration
  const mockTableFields = [
    { name: 'id', type: 'INTEGER', required: true, defaultValue: 'AUTO_INCREMENT' },
    { name: 'client_inn', type: 'VARCHAR(12)', required: true, defaultValue: '' },
    { name: 'object_cost', type: 'DECIMAL(15,2)', required: true, defaultValue: '' },
    { name: 'status', type: 'VARCHAR(50)', required: true, defaultValue: 'collecting_offers' },
    { name: 'created_at', type: 'TIMESTAMP', required: true, defaultValue: 'NOW()' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="bg-secondary text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Административная панель</h1>
              <p className="text-gray-300">WordPress-подобное управление с расширенными возможностями</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">Администратор</span>
              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <a href="#dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-white bg-primary rounded-lg">
                    <Database className="mr-3 h-4 w-4" />
                    Дашборд
                  </a>
                  <a href="#database" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Database className="mr-3 h-4 w-4" />
                    База данных
                  </a>
                  <a href="#forms" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Edit className="mr-3 h-4 w-4" />
                    Формы
                  </a>
                  <a href="#pages" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    <FileText className="mr-3 h-4 w-4" />
                    Страницы
                  </a>
                  <a href="#parsers" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Settings className="mr-3 h-4 w-4" />
                    Парсеры
                  </a>
                  <a href="#users" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Users className="mr-3 h-4 w-4" />
                    Пользователи
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Admin Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="database">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="database">База данных</TabsTrigger>
                <TabsTrigger value="applications">Заявки</TabsTrigger>
                <TabsTrigger value="companies">Компании</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>

              <TabsContent value="database" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Редактор базы данных</CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Добавить столбец
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Экспорт
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600">Управление структурой таблиц и данными</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-3">Таблица: leasing_applications</h5>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Поле</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Обязательное</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">По умолчанию</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {mockTableFields.map((field, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <Input value={field.name} className="text-sm" />
                              </td>
                              <td className="px-4 py-3">
                                <Select defaultValue={field.type}>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INTEGER">INTEGER</SelectItem>
                                    <SelectItem value="VARCHAR">VARCHAR</SelectItem>
                                    <SelectItem value="TEXT">TEXT</SelectItem>
                                    <SelectItem value="DATE">DATE</SelectItem>
                                    <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  className="rounded"
                                  readOnly
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input value={field.defaultValue} className="text-sm" />
                              </td>
                              <td className="px-4 py-3">
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline">Отменить</Button>
                      <Button>Сохранить изменения</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление заявками</CardTitle>
                    <p className="text-gray-600">Просмотр и редактирование всех заявок в системе</p>
                  </CardHeader>
                  <CardContent>
                    {applicationsLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет заявок</h3>
                        <p className="mt-1 text-sm text-gray-500">Пока что заявки в системе отсутствуют</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Заявка
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Клиент ИНН
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Сумма
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Статус
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Дата
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((application: any) => (
                              <tr key={application.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">#{application.id}</div>
                                  <div className="text-sm text-gray-500">{application.leasingType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {application.clientInn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₽{parseFloat(application.objectCost).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(application.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="companies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Лизинговые компании</CardTitle>
                    <p className="text-gray-600">Управление партнерами и их условиями</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {companies.map((company: any) => (
                        <Card key={company.id} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{company.name}</h4>
                              <Badge variant={company.isActive ? "default" : "secondary"} className={company.isActive ? "bg-success text-white" : ""}>
                                {company.isActive ? "Активна" : "Неактивна"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{company.description}</p>
                            <div className="space-y-1 text-xs text-gray-500">
                              {company.minAmount && (
                                <p>Мин. сумма: ₽{parseFloat(company.minAmount).toLocaleString()}</p>
                              )}
                              {company.maxAmount && (
                                <p>Макс. сумма: ₽{parseFloat(company.maxAmount).toLocaleString()}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {company.workWithAuto && <Badge variant="outline" className="text-xs">Авто</Badge>}
                                {company.workWithEquipment && <Badge variant="outline" className="text-xs">Оборудование</Badge>}
                                {company.workWithRealEstate && <Badge variant="outline" className="text-xs">Недвижимость</Badge>}
                                {company.workWithUsed && <Badge variant="outline" className="text-xs">Б/У</Badge>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Системные настройки</CardTitle>
                    <p className="text-gray-600">Конфигурация системы и парсеров</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Настройки парсеров</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <h5 className="font-medium text-sm">Парсер автомобилей</h5>
                              <p className="text-xs text-gray-500">Автоматическое обновление каталога автомобилей</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" className="bg-success text-white">Активен</Badge>
                              <Button variant="outline" size="sm">Настроить</Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <h5 className="font-medium text-sm">Парсер оборудования</h5>
                              <p className="text-xs text-gray-500">Обновление каталога промышленного оборудования</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">Неактивен</Badge>
                              <Button variant="outline" size="sm">Настроить</Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Email уведомления</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-900">Уведомления о новых заявках</label>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-900">Уведомления о смене статуса</label>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-900">Ежедневные отчеты</label>
                            <input type="checkbox" className="rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
