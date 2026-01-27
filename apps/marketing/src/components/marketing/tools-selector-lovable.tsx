"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function ToolsSelectorLovable() {
  const { language } = useLanguage();
  const [selectedTools, setSelectedTools] = useState<Set<string>>(
    new Set(translations.tools.items.map((t) => t.name))
  );

  const toggleTool = (toolName: string) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolName)) {
      newSelected.delete(toolName);
    } else {
      newSelected.add(toolName);
    }
    setSelectedTools(newSelected);
  };

  const totalCost = Array.from(selectedTools).reduce((sum, toolName) => {
    const tool = translations.tools.items.find((t) => t.name === toolName);
    return sum + parseInt(tool?.price.replace("€", "") || "0");
  }, 0);

  const klozdPrice = 97;
  const savings = totalCost - klozdPrice;
  const annualSavings = savings * 12;

  return (
    <section className="section-padding bg-klozd-gray-100">
      <div className="container-klozd">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4 whitespace-pre-line">
              {translations.tools.headline[language]}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-klozd-yellow max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-klozd-yellow text-klozd-black px-4 py-1 rounded-bl-lg text-sm font-semibold">
              POPULAR
            </div>

            <div className="space-y-4 mb-8">
              {translations.tools.items.map((tool) => (
                <label
                  key={tool.name}
                  className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-klozd-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTools.has(tool.name)}
                      onChange={() => toggleTool(tool.name)}
                      className="w-5 h-5 text-klozd-yellow border-border rounded"
                    />
                    <div>
                      <div className="font-medium text-klozd-black">{tool.name}</div>
                      <div className="text-sm text-klozd-gray-600">
                        {tool.category[language]}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-klozd-black">{tool.price}</div>
                </label>
              ))}
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-klozd-gray-600">
                  {translations.tools.totalOld[language]}
                </span>
                <span className="text-2xl font-bold text-klozd-black">
                  {formatNumber(totalCost)}€
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-klozd-gray-600">KLOZD</span>
                <span className="text-2xl font-bold text-klozd-yellow">
                  {klozdPrice}€
                </span>
              </div>
              {savings > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                  </svg>
                  Économise {formatNumber(annualSavings)}€/an
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
