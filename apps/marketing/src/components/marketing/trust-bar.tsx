export function TrustBar() {
  const logos = [
    { name: "Company 1", placeholder: "Logo 1" },
    { name: "Company 2", placeholder: "Logo 2" },
    { name: "Company 3", placeholder: "Logo 3" },
    { name: "Company 4", placeholder: "Logo 4" },
  ];

  return (
    <section className="py-12 md:py-16 border-y border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm md:text-base text-slate-500 mb-10 font-medium">
          Rejoint par des équipes qui font confiance à KLOZD
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-32 h-16 text-slate-400 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {logo.placeholder}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
