"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function CalculatorLovable() {
  const { language } = useLanguage();
  const [stackValue, setStackValue] = useState(220);
  const [leadsPerMonth, setLeadsPerMonth] = useState(100);
  const calculator = translations.calculator;

  const klozdPrice = 97;
  const savings = stackValue - klozdPrice;
  const annualSavings = savings * 12;
  const showRate = 30;

  return (
    <section id="calculator" className="section-padding bg-gradient-to-b from-klozd-gray-100 to-white">
      <div className="container-klozd">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="tag-badge mb-4 inline-block">
              {calculator.badge[language]}
            </div>
            <h2 className="headline-section mb-4">
              {calculator.headline[language]}{" "}
              <span className="text-klozd-yellow">{calculator.headlineSub[language]}</span>
            </h2>
            <p className="body-normal max-w-2xl mx-auto">
              {calculator.description[language]}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-border">
            <div className="mb-8">
              <label className="block text-sm font-medium text-klozd-gray-600 mb-2">
                {calculator.currentStack[language]}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={stackValue}
                onChange={(e) => setStackValue(Number(e.target.value))}
                className="w-full h-2 bg-klozd-gray-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-klozd-gray-600">50€</span>
                <span className="text-2xl font-bold text-klozd-black">{formatNumber(stackValue)}€</span>
                <span className="text-sm text-klozd-gray-600">500€</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-klozd-gray-600 mb-2">
                {calculator.leadsLabel[language]}
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={leadsPerMonth}
                onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-klozd-gray-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-klozd-gray-600">10</span>
                <span className="text-2xl font-bold text-klozd-black">{leadsPerMonth}</span>
                <span className="text-sm text-klozd-gray-600">1000</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-klozd-yellow/10 to-klozd-yellow/5 rounded-2xl p-6 text-center">
                <div className="text-sm text-klozd-gray-600 mb-2">{calculator.timeSaved[language]}</div>
                <p className="text-4xl font-bold text-klozd-black mb-1">{formatNumber(savings)}€</p>
                <p className="text-klozd-gray-600 text-sm">économisés/mois</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-6 text-center">
                <div className="text-sm text-klozd-gray-600 mb-2">{calculator.moneySaved[language]}</div>
                <p className="text-4xl font-bold text-klozd-black mb-1">{formatNumber(annualSavings)}€</p>
                <p className="text-klozd-gray-600 text-sm">d'économies/an</p>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center">
                <div className="text-sm text-klozd-gray-600 mb-2">{calculator.conversionBoost[language]}</div>
                <p className="text-4xl font-bold text-klozd-black mb-1">+{showRate}%</p>
                <p className="text-klozd-gray-600 text-sm">taux de show</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button className="btn-primary">
                {calculator.cta[language]}
              </Button>
              <p className="text-xs text-klozd-gray-600 mt-4">
                {calculator.note[language]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
