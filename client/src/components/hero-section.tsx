import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToForm = () => {
    const formElement = document.getElementById('quick-application');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Лизинг за 15 минут
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Получите коммерческие предложения от всех лизинговых компаний одновременно. 
              Экономьте время и деньги на выборе лучших условий.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                onClick={scrollToForm}
              >
                Подать заявку
              </Button>
              <Button 
                variant="outline"
                className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-30 transition-colors border-white border-opacity-30"
                onClick={() => window.location.href = "/api/login"}
              >
                Стать партнером
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">15 мин</div>
                    <div className="text-sm opacity-80">Быстро</div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm opacity-80">Гарантия</div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 h-32 col-span-2 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold">Лучшие условия от всех лизинговых компаний</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
