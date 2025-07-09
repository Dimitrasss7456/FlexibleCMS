import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Car, Calendar, Settings, Fuel } from "lucide-react";
import { useState } from "react";

interface CarCardProps {
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    price: string;
    engine?: string;
    transmission?: string;
    drive?: string;
    status: string;
    isNew: boolean;
    images?: any;
    specifications?: any;
  };
  onLeasingClick?: (carId: number) => void;
}

export default function CarCard({ car, onLeasingClick }: CarCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculateMonthlyPayment = (price: string) => {
    const numPrice = parseFloat(price);
    // Approximate monthly payment calculation (20% down, 36 months, 8.5% rate)
    const downPayment = numPrice * 0.2;
    const leasingAmount = numPrice - downPayment;
    const monthlyRate = 0.085 / 12;
    const months = 36;
    const monthlyPayment = leasingAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlyPayment);
  };

  const getStatusBadge = () => {
    switch (car.status) {
      case 'available':
        return <Badge className="bg-success text-white">В наличии</Badge>;
      case 'reserved':
        return <Badge variant="outline">Зарезервирован</Badge>;
      case 'sold':
        return <Badge variant="destructive">Продан</Badge>;
      default:
        return <Badge variant="secondary">Под заказ</Badge>;
    }
  };

  const handleLeasingClick = () => {
    if (onLeasingClick) {
      onLeasingClick(car.id);
    } else {
      // Scroll to application form with car data
      const formElement = document.getElementById('quick-application');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Car Image */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="h-16 w-16 text-gray-400" />
        </div>
        <div className="absolute top-4 right-4">
          {getStatusBadge()}
        </div>
        <div className="absolute top-4 left-4">
          {car.isNew ? (
            <Badge variant="default" className="bg-primary text-white">Новый</Badge>
          ) : (
            <Badge variant="outline">С пробегом</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Car Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {car.brand} {car.model}
        </h3>
        
        {/* Car Specifications */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{car.year} год</span>
          </div>
          {car.engine && (
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span>{car.engine}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{car.transmission}</span>
            </div>
          )}
        </div>

        {car.drive && (
          <p className="text-sm text-gray-600 mb-4">
            Привод: {car.drive}
          </p>
        )}
        
        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(car.price)}
            </span>
            <p className="text-gray-500 text-sm">
              Лизинг от {calculateMonthlyPayment(car.price)}/мес
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            onClick={handleLeasingClick}
            disabled={car.status === 'sold'}
          >
            Оформить лизинг
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className={isFavorite ? "text-red-500 border-red-500" : ""}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Additional Info */}
        {car.specifications && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Дополнительные характеристики доступны при просмотре
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
