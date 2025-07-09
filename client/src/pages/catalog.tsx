import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CarCard from "@/components/car-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";

export default function Catalog() {
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    year: "",
    minPrice: "",
    maxPrice: "",
    isNew: undefined as boolean | undefined,
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["/api/cars", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/cars?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cars');
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      model: "",
      year: "",
      minPrice: "",
      maxPrice: "",
      isNew: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Каталог автомобилей</h1>
          <p className="text-gray-600">Автоматическое обновление через настраиваемые парсеры</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Марка</label>
                <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все марки" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все марки</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Модель</label>
                <Select value={filters.model} onValueChange={(value) => handleFilterChange('model', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все модели" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все модели</SelectItem>
                    <SelectItem value="X5">X5</SelectItem>
                    <SelectItem value="3 Series">3 Series</SelectItem>
                    <SelectItem value="5 Series">5 Series</SelectItem>
                    <SelectItem value="E-Class">E-Class</SelectItem>
                    <SelectItem value="Q7">Q7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Год</label>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Любой</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена от</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена до</label>
                <Input
                  type="number"
                  placeholder="10 000 000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.reload()}
                >
                  Найти
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Сбросить
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="condition"
                  checked={filters.isNew === undefined}
                  onChange={() => handleFilterChange('isNew', undefined)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Все</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="condition"
                  checked={filters.isNew === true}
                  onChange={() => handleFilterChange('isNew', true)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Новые</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="condition"
                  checked={filters.isNew === false}
                  onChange={() => handleFilterChange('isNew', false)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">С пробегом</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Автомобили не найдены</h3>
            <p className="text-gray-500 mb-6">Попробуйте изменить параметры поиска</p>
            <Button onClick={clearFilters}>Сбросить фильтры</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Найдено {cars.length} автомобилей</p>
              <Select defaultValue="price-asc">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                  <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                  <SelectItem value="year-desc">Год: сначала новые</SelectItem>
                  <SelectItem value="year-asc">Год: сначала старые</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car: any) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Загрузить еще
              </Button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
