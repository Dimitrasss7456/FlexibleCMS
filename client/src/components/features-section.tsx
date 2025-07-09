import { Clock, Shield, DollarSign, EyeOff, Smartphone, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Быстро",
    description: "Получите коммерческие предложения от всех лизинговых компаний за 15-30 минут",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Надежно",
    description: "100% одобрение сделок и гарантия качества от проверенных партнеров",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: DollarSign,
    title: "Выгодно",
    description: "Экономия на затратах через конкурентный запрос во все подходящие компании",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: EyeOff,
    title: "Анонимно",
    description: "Полная анонимность агентов и прозрачность всех этапов сделки",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Smartphone,
    title: "Просто",
    description: "Заполните одну форму на сайте или в мобильном приложении",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: TrendingUp,
    title: "Доходно",
    description: "Агентское вознаграждение до 4% от стоимости предмета лизинга",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Преимущества нашего сервиса</h2>
          <p className="text-gray-600">Экономьте время и деньги с Лизинг.ОРГ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
