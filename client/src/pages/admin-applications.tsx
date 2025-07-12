import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

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

export default function AdminApplications() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState('');
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

  const approveMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return apiRequest(`/api/applications/${applicationId}/approve`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Заявка одобрена",
        description: "Заявка успешно одобрена и передана менеджерам",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить заявку",
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: number; reason: string }) => {
      return apiRequest(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setRejectReason('');
      toast({
        title: "Заявка отклонена",
        description: "Заявка успешно отклонена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить заявку",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return <div className="p-6">Загрузка заявок...</div>;
  }

  const pendingApplications = applications.filter((app: Application) => app.status === 'pending');
  const otherApplications = applications.filter((app: Application) => app.status !== 'pending');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управление заявками</h1>
        <div className="text-sm text-gray-600">
          Всего заявок: {applications.length}
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Заявки на проверке ({pendingApplications.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingApplications.map((application: Application) => (
              <Card key={application.id} className="border-l-4 border-l-yellow-500">
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
                    <p><strong>Срок:</strong> {application.leasingTerm} мес.</p>
                    <p><strong>Телефон:</strong> {application.clientPhone}</p>
                    <p><strong>ИНН:</strong> {application.clientInn}</p>
                    {application.comment && (
                      <p><strong>Комментарий:</strong> {application.comment}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(application.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Одобрить
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Отклонить заявку №{application.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Причина отклонения *
                            </label>
                            <Textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Укажите причину отклонения заявки..."
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => rejectMutation.mutate({
                                applicationId: application.id,
                                reason: rejectReason
                              })}
                              disabled={!rejectReason.trim() || rejectMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              Отклонить заявку
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Applications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Все заявки ({applications.length})</h2>
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
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Подробно
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Заявка №{selectedApplication.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Статус</p>
                  <Badge className={statusColors[selectedApplication.status]}>
                    {statusTranslations[selectedApplication.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Дата создания</p>
                  <p>{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Тип лизинга</p>
                  <p className="font-medium">{selectedApplication.leasingType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Стоимость объекта</p>
                  <p className="font-medium">{Number(selectedApplication.objectCost).toLocaleString()} ₽</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Первоначальный взнос</p>
                  <p className="font-medium">{selectedApplication.downPayment}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Срок лизинга</p>
                  <p className="font-medium">{selectedApplication.leasingTerm} месяцев</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Телефон клиента</p>
                  <p className="font-medium">{selectedApplication.clientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ИНН клиента</p>
                  <p className="font-medium">{selectedApplication.clientInn}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600">Новый объект</p>
                  <p className="font-medium">{selectedApplication.isNewObject ? 'Да' : 'Нет'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Для сдачи в аренду</p>
                  <p className="font-medium">{selectedApplication.isForRental ? 'Да' : 'Нет'}</p>
                </div>
              </div>
              
              {selectedApplication.comment && (
                <div>
                  <p className="text-sm text-gray-600">Комментарий</p>
                  <p className="font-medium">{selectedApplication.comment}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}