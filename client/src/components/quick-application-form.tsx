import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const applicationSchema = z.object({
  leasingType: z.string().min(1, "Выберите тип лизинга"),
  objectCost: z.string().min(1, "Укажите стоимость объекта").transform(val => parseFloat(val.replace(/\s/g, ""))),
  leasingTerm: z.string().min(1, "Выберите срок лизинга").transform(val => parseInt(val)),
  downPayment: z.string().min(1, "Укажите размер аванса").transform(val => parseFloat(val)),
  clientPhone: z.string().min(10, "Укажите корректный номер телефона"),
  clientInn: z.string().min(10, "Укажите корректный ИНН"),
  isNewObject: z.boolean().default(true),
  isForRental: z.boolean().default(false),
  comment: z.string().optional(),
  agreement: z.boolean().refine(val => val === true, "Необходимо согласие на обработку данных"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function QuickApplicationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [objectType, setObjectType] = useState<'new' | 'used'>('new');

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      leasingType: "",
      objectCost: "",
      leasingTerm: "",
      downPayment: "",
      clientPhone: "",
      clientInn: "",
      isNewObject: true,
      isForRental: false,
      comment: "",
      agreement: false,
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: Omit<ApplicationFormData, 'agreement'>) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Заявка создана",
        description: `Заявка №${data.id} успешно отправлена. Ожидайте предложения от лизинговых компаний.`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявку. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    const { agreement, ...applicationData } = data;
    createApplicationMutation.mutate({
      ...applicationData,
      isNewObject: objectType === 'new',
    });
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <section id="quick-application" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Быстрая заявка на лизинг</h2>
          <p className="text-gray-600">Заполните форму и получите предложения в течение 15 минут</p>
        </div>
        <Card className="bg-gray-50">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип лизинга</label>
                  <Select onValueChange={(value) => form.setValue('leasingType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Автомобили</SelectItem>
                      <SelectItem value="equipment">Оборудование</SelectItem>
                      <SelectItem value="real_estate">Недвижимость</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.leasingType && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.leasingType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Стоимость объекта</label>
                  <Input
                    placeholder="от 500 000 руб."
                    {...form.register('objectCost')}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      form.setValue('objectCost', formatted);
                    }}
                  />
                  {form.formState.errors.objectCost && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.objectCost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Срок лизинга</label>
                  <Select onValueChange={(value) => form.setValue('leasingTerm', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите срок" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 месяцев</SelectItem>
                      <SelectItem value="24">24 месяца</SelectItem>
                      <SelectItem value="36">36 месяцев</SelectItem>
                      <SelectItem value="48">48 месяцев</SelectItem>
                      <SelectItem value="60">60 месяцев</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.leasingTerm && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.leasingTerm.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Аванс (%)</label>
                  <Input 
                    placeholder="от 10%"
                    {...form.register('downPayment')}
                  />
                  {form.formState.errors.downPayment && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.downPayment.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <Input 
                    type="tel" 
                    placeholder="+7 (999) 999-99-99"
                    {...form.register('clientPhone')}
                  />
                  {form.formState.errors.clientPhone && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.clientPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ИНН организации</label>
                  <Input 
                    placeholder="1234567890"
                    {...form.register('clientInn')}
                  />
                  {form.formState.errors.clientInn && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.clientInn.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Состояние объекта</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={objectType === 'new'}
                        onChange={() => setObjectType('new')}
                        className="mr-2"
                      />
                      Новый
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={objectType === 'used'}
                        onChange={() => setObjectType('used')}
                        className="mr-2"
                      />
                      Б/у
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rental"
                    checked={form.watch('isForRental')}
                    onCheckedChange={(checked) => form.setValue('isForRental', !!checked)}
                  />
                  <label htmlFor="rental" className="text-sm text-gray-700">
                    Будет использоваться в аренде или такси
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий (необязательно)</label>
                <Input 
                  placeholder="Дополнительная информация"
                  {...form.register('comment')}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="agreement"
                  checked={form.watch('agreement')}
                  onCheckedChange={(checked) => form.setValue('agreement', !!checked)}
                />
                <label htmlFor="agreement" className="text-sm text-gray-700">
                  Согласен на обработку персональных данных и с{' '}
                  <a href="#" className="text-primary hover:underline">условиями использования</a>
                </label>
              </div>
              {form.formState.errors.agreement && (
                <p className="text-sm text-red-600">{form.formState.errors.agreement.message}</p>
              )}

              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-semibold"
                disabled={createApplicationMutation.isPending}
              >
                {createApplicationMutation.isPending 
                  ? "Отправка..." 
                  : "Получить предложения от всех лизинговых компаний"
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
