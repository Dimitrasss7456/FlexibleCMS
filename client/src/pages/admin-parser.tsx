import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, Globe, Database, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminParser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [source, setSource] = useState("sample");
  const [url, setUrl] = useState("");
  const [parseResult, setParseResult] = useState<any>(null);

  const parseCarsMutation = useMutation({
    mutationFn: async (data: { source: string; url?: string }) => {
      return apiRequest("POST", "/api/admin/parse-cars", data);
    },
    onSuccess: (data) => {
      setParseResult(data);
      toast({ 
        title: "Парсинг завершен", 
        description: data.message 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cars"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка парсинга", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleStartParsing = () => {
    const data = { source, ...(url && { url }) };
    parseCarsMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Парсер автомобильных каталогов</h1>
          <p className="text-gray-600">
            Автоматическая загрузка автомобилей из внешних источников
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parser Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Настройка парсера</span>
              </CardTitle>
              <CardDescription>
                Выберите источник и настройте параметры парсинга
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Источник данных</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sample">Образцы данных</SelectItem>
                    <SelectItem value="avito">Avito.ru</SelectItem>
                    <SelectItem value="auto_ru">Auto.ru</SelectItem>
                    <SelectItem value="drom">Drom.ru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {source !== "sample" && (
                <div className="space-y-2">
                  <Label htmlFor="url">URL страницы (опционально)</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={handleStartParsing}
                disabled={parseCarsMutation.isPending}
                className="w-full"
              >
                {parseCarsMutation.isPending ? (
                  <>
                    <Download className="w-4 h-4 mr-2 animate-spin" />
                    Парсинг...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Начать парсинг
                  </>
                )}
              </Button>

              {parseCarsMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Загрузка данных...</span>
                    <span>~30 сек</span>
                  </div>
                  <Progress value={45} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Результаты парсинга</span>
              </CardTitle>
              <CardDescription>
                Информация о загруженных автомобилях
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parseResult ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {parseResult.message}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Загруженные автомобили:</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {parseResult.cars?.slice(0, 10).map((car: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{car.brand} {car.model}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {car.year} год
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={car.isNew ? "default" : "secondary"}>
                              {car.isNew ? "Новый" : "Б/У"}
                            </Badge>
                            <span className="text-sm font-medium">
                              {parseFloat(car.price).toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {parseResult.cars?.length > 10 && (
                      <p className="text-sm text-gray-500">
                        И еще {parseResult.cars.length - 10} автомобилей...
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Запустите парсинг для просмотра результатов</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Инструкции по использованию</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Источники данных:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Образцы данных</strong> - Тестовые автомобили для демонстрации</li>
                  <li>• <strong>Avito.ru</strong> - Популярная площадка объявлений</li>
                  <li>• <strong>Auto.ru</strong> - Специализированный автопортал</li>
                  <li>• <strong>Drom.ru</strong> - Региональные автомобильные объявления</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Рекомендации:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Начните с образцов данных для тестирования</li>
                  <li>• Парсинг может занять до 30 секунд</li>
                  <li>• Проверьте загруженные данные в разделе "Автомобили"</li>
                  <li>• При ошибках попробуйте другой источник</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}