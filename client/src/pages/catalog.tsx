import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Car, Search, Filter, Calendar, Fuel, Settings } from "lucide-react";

interface CarData {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: string;
  engine?: string;
  transmission?: string;
  drive?: string;
  isNew: boolean;
  status: string;
  images?: any;
  specifications?: any;
}

export default function Catalog() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [yearRange, setYearRange] = useState([2020, 2024]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [isNewFilter, setIsNewFilter] = useState("");

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["/api/cars"],
  });

  // Filter cars based on search criteria
  const filteredCars = cars.filter((car: CarData) => {
    const matchesSearch = !searchTerm || 
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !selectedBrand || car.brand === selectedBrand;
    const matchesYear = car.year >= yearRange[0] && car.year <= yearRange[1];
    const carPrice = parseFloat(car.price);
    const matchesPrice = carPrice >= priceRange[0] && carPrice <= priceRange[1];
    const matchesCondition = !isNewFilter || 
      (isNewFilter === "new" && car.isNew) ||
      (isNewFilter === "used" && !car.isNew);

    return matchesSearch && matchesBrand && matchesYear && matchesPrice && matchesCondition;
  });

  // Get unique brands for filter
  const brands = [...new Set(cars.map((car: CarData) => car.brand))];

  const handleLeasingRequest = (carId: number) => {
    toast({
      title: "Переход к заявке",
      description: "Перенаправляем на страницу подачи заявки...",
    });
    // Redirect to application form with pre-selected car
    window.location.href = `/application?carId=${carId}`;
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBrand("");
    setYearRange([2020, 2024]);
    setPriceRange([0, 5000000]);
    setIsNewFilter("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Каталог автомобилей</h1>
          <p className="text-gray-600">
            Найдите идеальный автомобиль для лизинга из нашего каталога
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Фильтры</span>
                </CardTitle>
                <CardDescription>
                  Уточните параметры поиска
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Поиск</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Марка или модель..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <Label>Марка</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все марки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все марки</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Range */}
                <div className="space-y-2">
                  <Label>Год выпуска: {yearRange[0]} - {yearRange[1]}</Label>
                  <Slider
                    value={yearRange}
                    onValueChange={setYearRange}
                    min={2010}
                    max={2024}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>
                    Цена: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ₽
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={10000000}
                    step={100000}
                    className="w-full"
                  />
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <Label>Состояние</Label>
                  <Select value={isNewFilter} onValueChange={setIsNewFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любое" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Любое</SelectItem>
                      <SelectItem value="new">Новые</SelectItem>
                      <SelectItem value="used">Б/У</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Найдено {filteredCars.length} автомобилей
                </p>
                <Select defaultValue="price-asc">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                    <SelectItem value="year-desc">Год: сначала новые</SelectItem>
                    <SelectItem value="year-asc">Год: сначала старые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Автомобили не найдены
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Попробуйте изменить параметры фильтрации
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Сбросить фильтры
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car: CarData) => (
                  <Card key={car.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <Car className="w-16 h-16 text-gray-400" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={car.isNew ? "default" : "secondary"}>
                          {car.isNew ? "Новый" : "Б/У"}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={car.status === "available" ? "default" : "destructive"}>
                          {car.status === "available" ? "Доступен" : "Недоступен"}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-gray-600 flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {car.year}
                          </span>
                          {car.engine && (
                            <span className="flex items-center">
                              <Fuel className="w-4 h-4 mr-1" />
                              {car.engine}
                            </span>
                          )}
                        </p>
                      </div>

                      {car.specifications && (
                        <div className="mb-3 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Трансмиссия:</span>
                            <span>{car.transmission || "Не указано"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Привод:</span>
                            <span>{car.drive || "Не указано"}</span>
                          </div>
                          {car.specifications.power && (
                            <div className="flex justify-between">
                              <span>Мощность:</span>
                              <span>{car.specifications.power}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {parseFloat(car.price).toLocaleString()} ₽
                          </p>
                          <p className="text-sm text-gray-500">Стоимость</p>
                        </div>
                        <Button 
                          onClick={() => handleLeasingRequest(car.id)}
                          disabled={car.status !== "available"}
                          size="sm"
                        >
                          В лизинг
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}