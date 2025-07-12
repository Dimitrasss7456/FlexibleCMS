import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, Calculator } from 'lucide-react';

interface Application {
  id: number;
  clientId: number;
  agentId?: number;
  objectCost: string;
  downPayment: string;
  leasingTerm: number;
  leasingType: string;
  clientPhone: string;
  clientInn: string;
  isNewObject: boolean;
  isForRental: boolean;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Offer {
  id: number;
  applicationId: number;
  companyId: number;
  managerId?: number;
  monthlyPayment: string;
  firstPayment: string;
  buyoutPayment: string;
  totalCost: string;
  interestRate?: string;
  isSelected: boolean;
  createdAt: string;
}

interface CreateOfferData {
  applicationId: number;
  companyId: number;
  monthlyPayment: string;
  firstPayment: string;
  buyoutPayment: string;
  totalCost: string;
  interestRate?: string;
}

const statusTranslations: Record<string, string> = {
  'pending': 'Ожидает проверки',
  'approved_by_admin': 'Одобрена админом',
  'collecting_offers': 'Сбор предложений',
  'reviewing_offers': 'Рассмотрение предложений',
  'collecting_documents': 'Сбор документов',
  'approved': 'Одобрена',
  'needs_revision': 'Требует доработки',
  'issued': 'Выдана',
  'rejected': 'Отклонена'
};

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'approved_by_admin': 'bg-blue-100 text-blue-800',
  'collecting_offers': 'bg-purple-100 text-purple-800',
  'reviewing_offers': 'bg-indigo-100 text-indigo-800',
  'collecting_documents': 'bg-orange-100 text-orange-800',
  'approved': 'bg-green-100 text-green-800',
  'needs_revision': 'bg-red-100 text-red-800',
  'issued': 'bg-emerald-100 text-emerald-800',
  'rejected': 'bg-gray-100 text-gray-800'
};

export default function ManagerDashboard() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [offerData, setOfferData] = useState<Partial<CreateOfferData>>({
    monthlyPayment: '',
    firstPayment: '',
    buyoutPayment: '',
    totalCost: '',
    interestRate: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/applications'],
    queryFn: async () => {
      const response = await fetch('/api/applications', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    }
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    }
  });

  const createOfferMutation = useMutation({
    mutationFn: async (offer: CreateOfferData) => {
      return apiRequest('/api/offers', {
        method: 'POST',
        body: JSON.stringify(offer)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setSelectedApplication(null);
      setOfferData({
        monthlyPayment: '',
        firstPayment: '',
        buyoutPayment: '',
        totalCost: '',
        interestRate: ''
      });
      toast({
        title: "Предложение создано",
        description: "Ваше предложение успешно отправлено клиенту",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать предложение",
        variant: "destructive",
      });
    }
  });

  // Calculate fields automatically
  const calculatePayments = () => {
    if (!selectedApplication || !offerData.interestRate) return;

    const objectCost = parseFloat(selectedApplication.objectCost);
    const downPaymentPercent = parseFloat(selectedApplication.downPayment);
    const term = selectedApplication.leasingTerm;
    const interestRate = parseFloat(offerData.interestRate) / 100;

    // First payment calculation
    const firstPayment = (objectCost * downPaymentPercent) / 100;
    
    // Financing amount
    const financingAmount = objectCost - firstPayment;
    
    // Monthly payment calculation (simple calculation for demo)
    const monthlyInterest = interestRate / 12;
    const monthlyPayment = (financingAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, term))) / 
                          (Math.pow(1 + monthlyInterest, term) - 1);
    
    // Buyout payment (typically 1% of object cost)
    const buyoutPayment = objectCost * 0.01;
    
    // Total cost
    const totalCost = firstPayment + (monthlyPayment * term) + buyoutPayment;

    setOfferData({
      ...offerData,
      firstPayment: firstPayment.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
      buyoutPayment: buyoutPayment.toFixed(2),
      totalCost: totalCost.toFixed(2)
    });
  };

  const availableApplications = applications.filter((app: Application) => 
    app.status === 'collecting_offers' || app.status === 'approved_by_admin'
  );

  if (isLoading) {
    return <div className="p-6">Загрузка заявок...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Панель менеджера</h1>
        <div className="text-sm text-gray-600">
          Доступных заявок: {availableApplications.length}
        </div>
      </div>

      {/* Available Applications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Заявки для формирования предложений</h2>
        
        {availableApplications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Нет доступных заявок для формирования предложений</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableApplications.map((application: Application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-sm">
                    <span>Заявка №{application.id}</span>
                    <Badge className={statusColors[application.status]}>
                      {statusTranslations[application.status]}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p><strong>Тип:</strong> {application.leasingType}</p>
                    <p><strong>Сумма:</strong> {Number(application.objectCost).toLocaleString()} ₽</p>
                    <p><strong>Первый взнос:</strong> {application.downPayment}%</p>
                    <p><strong>Срок:</strong> {application.leasingTerm} мес.</p>
                    <p><strong>Телефон:</strong> {application.clientPhone}</p>
                    {application.comment && (
                      <p><strong>Комментарий:</strong> {application.comment}</p>
                    )}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedApplication(application);
                          setOfferData({
                            applicationId: application.id,
                            companyId: companies[0]?.id || 1,
                            monthlyPayment: '',
                            firstPayment: '',
                            buyoutPayment: '',
                            totalCost: '',
                            interestRate: ''
                          });
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Создать предложение
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Создать предложение для заявки №{application.id}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Application Summary */}
                        <div className="bg-gray-50 p-4 rounded">
                          <h3 className="font-semibold mb-2">Информация о заявке:</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><strong>Объект:</strong> {application.leasingType}</p>
                            <p><strong>Стоимость:</strong> {Number(application.objectCost).toLocaleString()} ₽</p>
                            <p><strong>Первый взнос:</strong> {application.downPayment}%</p>
                            <p><strong>Срок:</strong> {application.leasingTerm} месяцев</p>
                          </div>
                        </div>

                        {/* Offer Form */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="companyId">Компания</Label>
                              <select
                                id="companyId"
                                value={offerData.companyId || ''}
                                onChange={(e) => setOfferData({...offerData, companyId: parseInt(e.target.value)})}
                                className="w-full p-2 border rounded"
                              >
                                {companies.map((company: any) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="interestRate">Процентная ставка (%)</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="interestRate"
                                  type="number"
                                  step="0.1"
                                  value={offerData.interestRate || ''}
                                  onChange={(e) => setOfferData({...offerData, interestRate: e.target.value})}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={calculatePayments}
                                  disabled={!offerData.interestRate}
                                >
                                  <Calculator className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstPayment">Первоначальный взнос (₽)</Label>
                              <Input
                                id="firstPayment"
                                type="number"
                                value={offerData.firstPayment || ''}
                                onChange={(e) => setOfferData({...offerData, firstPayment: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="monthlyPayment">Ежемесячный платеж (₽)</Label>
                              <Input
                                id="monthlyPayment"
                                type="number"
                                value={offerData.monthlyPayment || ''}
                                onChange={(e) => setOfferData({...offerData, monthlyPayment: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="buyoutPayment">Выкупная стоимость (₽)</Label>
                              <Input
                                id="buyoutPayment"
                                type="number"
                                value={offerData.buyoutPayment || ''}
                                onChange={(e) => setOfferData({...offerData, buyoutPayment: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="totalCost">Общая стоимость (₽)</Label>
                              <Input
                                id="totalCost"
                                type="number"
                                value={offerData.totalCost || ''}
                                onChange={(e) => setOfferData({...offerData, totalCost: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => createOfferMutation.mutate(offerData as CreateOfferData)}
                              disabled={
                                !offerData.monthlyPayment || 
                                !offerData.firstPayment || 
                                !offerData.buyoutPayment || 
                                !offerData.totalCost ||
                                createOfferMutation.isPending
                              }
                              className="flex-1"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Отправить предложение
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Applications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Все заявки</h2>
        <div className="grid gap-4">
          {applications.map((application: Application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Заявка №{application.id}</span>
                      <Badge className={statusColors[application.status]}>
                        {statusTranslations[application.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Тип</p>
                        <p className="font-medium">{application.leasingType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Сумма</p>
                        <p className="font-medium">{Number(application.objectCost).toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Срок</p>
                        <p className="font-medium">{application.leasingTerm} мес.</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Дата создания</p>
                        <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}