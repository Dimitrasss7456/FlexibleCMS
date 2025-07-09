import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, FileText, DollarSign, Eye, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему для доступа к личному кабинету",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  if (isLoading || !isAuthenticated) {
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

  const stats = {
    activeApplications: applications.filter((app: any) => 
      !['approved', 'rejected', 'issued'].includes(app.status)
    ).length,
    approvedApplications: applications.filter((app: any) => 
      ['approved', 'issued'].includes(app.status)
    ).length,
    pendingApplications: applications.filter((app: any) => 
      ['collecting_offers', 'reviewing_offers'].includes(app.status)
    ).length,
    totalEarnings: applications
      .filter((app: any) => app.status === 'issued')
      .reduce((sum: number, app: any) => sum + (parseFloat(app.objectCost) * 0.02), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="gradient-primary text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || 'Пользователь'
                  }
                </h1>
                <p className="text-blue-100">
                  {user?.companyName || 'Частное лицо'} • {user?.userType === 'client' ? 'Клиент' : 
                    user?.userType === 'manager' ? 'Менеджер' :
                    user?.userType === 'supplier' ? 'Поставщик' :
                    user?.userType === 'agent' ? 'Агент' : 'Администратор'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100 text-sm">
                Потенциальный доход: <span className="font-semibold text-white">₽{stats.totalEarnings.toLocaleString()}</span>
              </span>
              <Button 
                variant="outline" 
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              >
                Настройки
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Активные заявки</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Одобренные</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approvedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">На рассмотрении</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Заработано</p>
                  <p className="text-2xl font-semibold text-gray-900">₽{stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Последние заявки</CardTitle>
                  <Link href="/applications">
                    <Button variant="outline" size="sm">
                      Все заявки <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Нет заявок</h3>
                    <p className="mt-1 text-sm text-gray-500">Создайте первую заявку на лизинг</p>
                    <div className="mt-6">
                      <Link href="/">
                        <Button>Создать заявку</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Заявка #{application.id}</h4>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {application.leasingType} • ₽{parseFloat(application.objectCost).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Нет новых уведомлений</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <h5 className="font-medium text-sm text-gray-900">{notification.title}</h5>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
