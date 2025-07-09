import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Search, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Package 
} from "lucide-react";

interface ApplicationStatusProps {
  status: string;
  applicationId?: number;
  createdAt?: string;
  showProgress?: boolean;
}

const statusConfig = {
  collecting_offers: {
    label: "Сбор предложений",
    description: "Заявка создана и получена менеджерами лизинговых компаний",
    icon: Search,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    badgeVariant: "secondary" as const,
    progress: 20,
  },
  reviewing_offers: {
    label: "Рассмотрение предложений",
    description: "Предложения всех лизинговых компаний загружены в систему",
    icon: FileText,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    badgeVariant: "outline" as const,
    progress: 40,
  },
  collecting_documents: {
    label: "Сбор документов",
    description: "Клиент выбрал лизинговую компанию для подачи документов",
    icon: FileCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    badgeVariant: "default" as const,
    progress: 60,
  },
  document_review: {
    label: "Доработка документов",
    description: "Менеджер лизинга запрашивает дополнительные документы",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    badgeVariant: "destructive" as const,
    progress: 75,
  },
  approved: {
    label: "Одобрено",
    description: "Клиент получил одобрение по сделке в лизинговой компании",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    badgeVariant: "default" as const,
    badgeClassName: "bg-success text-white",
    progress: 90,
  },
  rejected: {
    label: "Отказ",
    description: "Заявка отклонена лизинговой компанией",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    badgeVariant: "destructive" as const,
    progress: 100,
  },
  issued: {
    label: "Выдано",
    description: "Акт приема-передачи подписан менеджером лизинговой компании",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
    badgeVariant: "default" as const,
    badgeClassName: "bg-success text-white",
    progress: 100,
  },
};

export default function ApplicationStatus({ 
  status, 
  applicationId, 
  createdAt,
  showProgress = true 
}: ApplicationStatusProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.collecting_offers;
  const IconComponent = config.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`p-2 ${config.bgColor} rounded-lg`}>
              <IconComponent className={`h-5 w-5 ${config.color}`} />
            </div>
            Статус заявки
            {applicationId && (
              <span className="text-sm font-normal text-gray-600">#{applicationId}</span>
            )}
          </CardTitle>
          <Badge 
            variant={config.badgeVariant} 
            className={config.badgeClassName}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-700 mb-2">{config.description}</p>
          {createdAt && (
            <p className="text-sm text-gray-500">
              Создана: {new Date(createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Прогресс</span>
              <span className="font-medium">{config.progress}%</span>
            </div>
            <Progress value={config.progress} className="h-2" />
          </div>
        )}

        {/* Status-specific additional info */}
        {status === 'collecting_offers' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Следующий шаг:</strong> Ожидание предложений от лизинговых компаний. 
              Обычно это занимает 15-30 минут.
            </p>
          </div>
        )}

        {status === 'reviewing_offers' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Следующий шаг:</strong> Просмотрите полученные предложения и выберите 
              наиболее подходящую лизинговую компанию.
            </p>
          </div>
        )}

        {status === 'collecting_documents' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <strong>Следующий шаг:</strong> Подготовьте и загрузите требуемые документы 
              для рассмотрения заявки.
            </p>
          </div>
        )}

        {status === 'document_review' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Требуется действие:</strong> Предоставьте дополнительные документы 
              согласно запросу менеджера.
            </p>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Поздравляем!</strong> Ваша заявка одобрена. Свяжитесь с менеджером 
              для оформления документов.
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Заявка отклонена.</strong> Вы можете подать новую заявку с 
              исправленными данными или обратиться к другим лизинговым компаниям.
            </p>
          </div>
        )}

        {status === 'issued' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Сделка завершена!</strong> Объект лизинга передан. Спасибо за 
              использование нашего сервиса.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
