import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Send, FileText, MessageCircle, DollarSign } from 'lucide-react';

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

interface Message {
  id: number;
  applicationId: number;
  senderId: number;
  message: string;
  isSystemMessage: boolean;
  createdAt: string;
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

export default function ApplicationDetail() {
  const [, params] = useRoute('/application/:id');
  const applicationId = params?.id ? parseInt(params.id) : null;
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['/api/applications', applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch application');
      return response.json();
    },
    enabled: !!applicationId
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/applications', applicationId, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/messages`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!applicationId
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['/api/applications', applicationId, 'offers'],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/offers`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
    enabled: !!applicationId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest(`/api/applications/${applicationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications', applicationId, 'messages'] });
      setNewMessage('');
      toast({
        title: "Сообщение отправлено",
        description: "Ваше сообщение успешно добавлено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  });

  const selectOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest(`/api/offers/${offerId}/select`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications', applicationId, 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications', applicationId] });
      toast({
        title: "Предложение выбрано",
        description: "Предложение успешно выбрано, переход к сбору документов",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось выбрать предложение",
        variant: "destructive",
      });
    }
  });

  if (!applicationId) {
    return <div className="p-6">Неверный ID заявки</div>;
  }

  if (applicationLoading) {
    return <div className="p-6">Загрузка заявки...</div>;
  }

  if (!application) {
    return <div className="p-6">Заявка не найдена</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Заявка №{application.id}</h1>
          <p className="text-gray-600">
            Создана {new Date(application.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge className={`${statusColors[application.status]} text-lg px-4 py-2`}>
          {statusTranslations[application.status]}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">
            <FileText className="w-4 h-4 mr-2" />
            Детали заявки
          </TabsTrigger>
          <TabsTrigger value="offers">
            <DollarSign className="w-4 h-4 mr-2" />
            Предложения ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="w-4 h-4 mr-2" />
            Переписка ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Документы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о заявке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Тип лизинга</p>
                  <p className="font-medium">{application.leasingType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Стоимость объекта</p>
                  <p className="font-medium">{Number(application.objectCost).toLocaleString()} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Первоначальный взнос</p>
                  <p className="font-medium">{application.downPayment}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Срок лизинга</p>
                  <p className="font-medium">{application.leasingTerm} месяцев</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Телефон клиента</p>
                  <p className="font-medium">{application.clientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ИНН клиента</p>
                  <p className="font-medium">{application.clientInn}</p>
                </div>
              </div>
              
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-600">Новый объект</p>
                  <p className="font-medium">{application.isNewObject ? 'Да' : 'Нет'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Для сдачи в аренду</p>
                  <p className="font-medium">{application.isForRental ? 'Да' : 'Нет'}</p>
                </div>
              </div>
              
              {application.comment && (
                <div>
                  <p className="text-sm text-gray-600">Комментарий</p>
                  <p className="font-medium bg-gray-50 p-3 rounded">{application.comment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Предложения пока не поступили</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer: Offer) => (
                <Card key={offer.id} className={`${offer.isSelected ? 'border-green-500 bg-green-50' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-sm">
                      <span>Предложение #{offer.id}</span>
                      {offer.isSelected && (
                        <Badge className="bg-green-600">Выбрано</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Ежемесячный платеж</p>
                        <p className="font-semibold text-lg">{Number(offer.monthlyPayment).toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Первый взнос</p>
                        <p className="font-medium">{Number(offer.firstPayment).toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Выкупная стоимость</p>
                        <p className="font-medium">{Number(offer.buyoutPayment).toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Общая стоимость</p>
                        <p className="font-medium">{Number(offer.totalCost).toLocaleString()} ₽</p>
                      </div>
                    </div>
                    
                    {offer.interestRate && (
                      <div>
                        <p className="text-gray-600 text-sm">Процентная ставка</p>
                        <p className="font-medium">{offer.interestRate}%</p>
                      </div>
                    )}
                    
                    {!offer.isSelected && application.status === 'reviewing_offers' && (
                      <Button
                        onClick={() => selectOfferMutation.mutate(offer.id)}
                        disabled={selectOfferMutation.isPending}
                        className="w-full"
                      >
                        Выбрать это предложение
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Переписка по заявке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messagesLoading ? (
                  <p>Загрузка сообщений...</p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-600">Сообщений пока нет</p>
                ) : (
                  messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded ${
                        message.isSystemMessage
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">
                          {message.isSystemMessage ? 'Система' : `Пользователь #${message.senderId}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              {/* New message form */}
              <div className="space-y-2 border-t pt-4">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  rows={3}
                />
                <Button
                  onClick={() => sendMessageMutation.mutate(newMessage)}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить сообщение
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Документы по заявке</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Функционал загрузки и просмотра документов будет добавлен</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}