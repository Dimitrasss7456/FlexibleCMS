import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface LeasingCalculatorProps {
  onValuesChange?: (values: CalculatorValues) => void;
  initialValues?: Partial<CalculatorValues>;
}

interface CalculatorValues {
  objectCost: number;
  downPayment: number;
  leasingTerm: number;
  interestRate: number;
}

export default function LeasingCalculator({ onValuesChange, initialValues }: LeasingCalculatorProps) {
  const [values, setValues] = useState<CalculatorValues>({
    objectCost: initialValues?.objectCost || 1500000,
    downPayment: initialValues?.downPayment || 20,
    leasingTerm: initialValues?.leasingTerm || 36,
    interestRate: initialValues?.interestRate || 8.5,
  });

  const updateValue = (key: keyof CalculatorValues, value: number) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onValuesChange?.(newValues);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate leasing payments
  const downPaymentAmount = (values.objectCost * values.downPayment) / 100;
  const leasingAmount = values.objectCost - downPaymentAmount;
  const monthlyRate = values.interestRate / 100 / 12;
  const monthlyPayment = leasingAmount * (monthlyRate * Math.pow(1 + monthlyRate, values.leasingTerm)) / 
    (Math.pow(1 + monthlyRate, values.leasingTerm) - 1);
  const totalAmount = downPaymentAmount + (monthlyPayment * values.leasingTerm);
  const overpayment = totalAmount - values.objectCost;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Калькулятор лизинга
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Object Cost */}
        <div className="space-y-2">
          <Label htmlFor="objectCost">Стоимость объекта</Label>
          <Input
            id="objectCost"
            type="number"
            value={values.objectCost}
            onChange={(e) => updateValue('objectCost', Number(e.target.value) || 0)}
            placeholder="1 500 000"
          />
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <Label htmlFor="downPayment">Первоначальный взнос (%)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="downPayment"
              type="number"
              min="0"
              max="100"
              value={values.downPayment}
              onChange={(e) => updateValue('downPayment', Number(e.target.value) || 0)}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              = {formatCurrency(downPaymentAmount)}
            </span>
          </div>
        </div>

        {/* Leasing Term */}
        <div className="space-y-2">
          <Label htmlFor="leasingTerm">Срок лизинга</Label>
          <Select 
            value={values.leasingTerm.toString()} 
            onValueChange={(value) => updateValue('leasingTerm', Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 месяцев</SelectItem>
              <SelectItem value="24">24 месяца</SelectItem>
              <SelectItem value="36">36 месяцев</SelectItem>
              <SelectItem value="48">48 месяцев</SelectItem>
              <SelectItem value="60">60 месяцев</SelectItem>
              <SelectItem value="72">72 месяца</SelectItem>
              <SelectItem value="84">84 месяца</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="interestRate">Процентная ставка (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.1"
            min="0"
            max="30"
            value={values.interestRate}
            onChange={(e) => updateValue('interestRate', Number(e.target.value) || 0)}
          />
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Расчет платежей</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Первоначальный взнос:</span>
              <span className="font-medium">{formatCurrency(downPaymentAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Сумма лизинга:</span>
              <span className="font-medium">{formatCurrency(leasingAmount)}</span>
            </div>
            
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Ежемесячный платеж:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(monthlyPayment)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Общая сумма выплат:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Переплата:</span>
              <span className={`font-medium ${overpayment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(overpayment)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
