import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Briefcase, Store, Users } from "lucide-react";

const userTypes = [
  {
    id: 'client',
    title: 'Клиент',
    description: 'Хочу оформить лизинг на транспорт, оборудование или недвижимость',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'manager',
    title: 'Менеджер',
    description: 'Менеджер лизинговой компании, хочу получать заявки от клиентов',
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'supplier',
    title: 'Поставщик',
    description: 'Продаю транспорт, оборудование или недвижимость',
    icon: Store,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'agent',
    title: 'Агент',
    description: 'Знаю потребности в лизинге и готов передать заявки',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function UserTypeSelection() {
  const handleUserTypeSelect = (userType: string) => {
    // Redirect to login with user type parameter
    window.location.href = `/api/login?userType=${userType}`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Выберите свою роль</h2>
          <p className="text-gray-600">Разные возможности для разных участников рынка</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id}
                className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                onClick={() => handleUserTypeSelect(type.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 ${type.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`h-8 w-8 ${type.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                    <Button variant="ghost" className="text-primary font-medium hover:underline">
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
