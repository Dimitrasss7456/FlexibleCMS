import { HandHeart, Phone, Mail, MapPin } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaVk } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <HandHeart className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold">Лизинг.ОРГ</span>
            </div>
            <p className="text-gray-300 mb-4">
              Платформа для быстрого оформления лизинга с лучшими условиями от всех лизинговых компаний.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTelegram className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaWhatsapp className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaVk className="text-xl" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Услуги</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Лизинг автомобилей
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Лизинг оборудования
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Лизинг недвижимости
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Для агентов
                </a>
              </li>
            </ul>
          </div>
          
          {/* Partners */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Партнерам</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Лизинговым компаниям
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Автосалонам
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Дилерам оборудования
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  API документация
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Часто задаваемые вопросы
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Контакты
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Обратная связь
                </a>
              </li>
              <li>
                <a 
                  href="mailto:123-org@mail.ru" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  123-org@mail.ru
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Лизинг.ОРГ. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
              Пользовательское соглашение
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
