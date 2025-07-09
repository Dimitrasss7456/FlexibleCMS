import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Building, Car, CreditCard, CheckCircle } from "lucide-react";

const applicationSchema = z.object({
  clientInn: z.string().min(10, "ИНН должен содержать минимум 10 цифр"),
  clientKpp: z.string().optional(),
  companyName: z.string().min(2, "Название компании обязательно"),
  contactPerson: z.string().min(2, "Контактное лицо обязательно"),
  contactPhone: z.string().min(10, "Номер телефона обязателен"),
  contactEmail: z.string().email("Некорректный email"),
  leasingType: z.enum(["equipment", "vehicle", "real_estate"]),
  objectCost: z.number().min(100000, "Минимальная сумма 100 000 рублей"),
  downPayment: z.number().min(0, "Первоначальный взнос не может быть отрицательным"),
  leasingTerm: z.number().min(12, "Минимальный срок 12 месяцев").max(84, "Максимальный срок 84 месяца"),
  description: z.string().min(10, "Описание обязательно"),
  additionalInfo: z.string().optional(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export default function ApplicationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      leasingType: "equipment",
      downPayment: 0,
      leasingTerm: 36,
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      return apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Заявка отправлена",
        description: "Ваша заявка успешно создана и передана на рассмотрение",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      form.reset();
      setCurrentStep(0);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationData) => {
    createApplicationMutation.mutate(data);
  };

  const steps = [
    { id: "company", title: "Данные компании", icon: Building },
    { id: "object", title: "Предмет лизинга", icon: Car },
    { id: "finance", title: "Финансовые условия", icon: CreditCard },
    { id: "review", title: "Проверка и отправка", icon: CheckCircle },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Подача заявки на лизинг</h1>
          <p className="text-gray-600">Заполните форму для получения предложений от лизинговых компаний</p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-full h-1 mx-4 ${
                        index < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              Шаг {currentStep + 1} из {steps.length}: {steps[currentStep].title}
            </p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && "Укажите данные вашей компании"}
                  {currentStep === 1 && "Опишите предмет лизинга"}
                  {currentStep === 2 && "Выберите финансовые условия"}
                  {currentStep === 3 && "Проверьте данные перед отправкой"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="clientInn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ИНН компании *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientKpp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>КПП (при наличии)</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Название компании *</FormLabel>
                          <FormControl>
                            <Input placeholder="ООО Ромашка" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Контактное лицо *</FormLabel>
                          <FormControl>
                            <Input placeholder="Иванов Иван Иванович" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон *</FormLabel>
                          <FormControl>
                            <Input placeholder="+7 (999) 123-45-67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="info@company.ru" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="leasingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип лизинга *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите тип лизинга" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="equipment">Оборудование</SelectItem>
                              <SelectItem value="vehicle">Транспорт</SelectItem>
                              <SelectItem value="real_estate">Недвижимость</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="objectCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Стоимость предмета лизинга (руб.) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1000000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание предмета лизинга *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Подробно опишите предмет лизинга: марка, модель, технические характеристики..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дополнительная информация</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Любая дополнительная информация..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Первоначальный взнос (руб.)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="300000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leasingTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок лизинга (месяцев) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="36" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Проверьте данные заявки:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Компания:</strong> {form.watch("companyName")}</p>
                      <p><strong>ИНН:</strong> {form.watch("clientInn")}</p>
                      <p><strong>Контакт:</strong> {form.watch("contactPerson")} ({form.watch("contactPhone")})</p>
                      <p><strong>Тип лизинга:</strong> {form.watch("leasingType")}</p>
                      <p><strong>Стоимость:</strong> {form.watch("objectCost")?.toLocaleString()} руб.</p>
                      <p><strong>Срок:</strong> {form.watch("leasingTerm")} месяцев</p>
                      <p><strong>Первоначальный взнос:</strong> {form.watch("downPayment")?.toLocaleString()} руб.</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Назад
                  </Button>
                  
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      Далее
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createApplicationMutation.isPending}
                    >
                      {createApplicationMutation.isPending ? "Отправка..." : "Отправить заявку"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}