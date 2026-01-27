"use client";

import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { MockupImage } from "./mockup-image";

const features = [
  {
    key: "forms",
    image: "/assets/mockup-forms-D3TCSpJs.png",
    imageLeft: false, // Image à droite
  },
  {
    key: "scheduling",
    image: "/assets/mockup-scheduling-CicBjjrH.png",
    imageLeft: true, // Image à gauche
  },
  {
    key: "video",
    image: "/assets/mockup-video-CFUvIAfE.png",
    imageLeft: false, // Image à droite
  },
  {
    key: "crm",
    image: "/assets/mockup-crm-inbox-PKBX4j8L.png",
    imageLeft: true, // Image à gauche
  },
  {
    key: "ai",
    image: "/assets/mockup-ai-CQemrNr0.png",
    imageLeft: false, // Image à droite
  },
  {
    key: "salesPages",
    image: "/assets/mockup-forms-D3TCSpJs.png", // Utilise la même image que forms pour l'instant
    imageLeft: true, // Image à gauche
  },
  {
    key: "dashboard",
    image: "/assets/mockup-dashboard-BVSFSSnl.png",
    imageLeft: false, // Image à droite
  },
  {
    key: "gamification",
    image: "/assets/mockup-dashboard-BVSFSSnl.png", // Utilise la même image que dashboard pour l'instant
    imageLeft: true, // Image à gauche
  },
];

export function FeaturesLovable() {
  const { language } = useLanguage();
  const featuresData = translations.features;

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-klozd">
        {features.map((feature) => {
          const featureData = featuresData[feature.key as keyof typeof featuresData];
          const imageLeft = feature.imageLeft;

          return (
            <div
              key={feature.key}
              className={`grid lg:grid-cols-2 gap-12 items-center mb-20 last:mb-0 ${
                imageLeft ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div className={imageLeft ? "lg:col-start-2" : ""}>
                <div className="tag-badge mb-4 inline-block">
                  {featureData.tag[language]}
                </div>
                <h3 className="headline-section mb-4 whitespace-pre-line">
                  {featureData.headline[language]}
                </h3>
                <p className="body-normal mb-6">
                  {featureData.description[language]}
                </p>
                <ul className="space-y-3">
                  {featureData.benefits[language].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-klozd-yellow flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-klozd-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={imageLeft ? "lg:col-start-1 lg:row-start-1" : ""}>
                <div className="mockup-shadow rounded-2xl overflow-hidden">
                  <MockupImage
                    src={feature.image}
                    alt={featureData.headline[language]}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
