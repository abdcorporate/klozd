'use client';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  optionsJson?: string | null;
}

interface FormVisualPreviewProps {
  formName: string;
  formDescription: string | null;
  formFields: FormField[];
  backgroundColor?: string | null;
  textColor?: string | null;
  primaryButtonColor?: string | null;
  fontFamily?: string | null;
  borderRadius?: string | null;
}

export function FormVisualPreview({
  formName,
  formDescription,
  formFields,
  backgroundColor,
  textColor,
  primaryButtonColor,
  fontFamily,
  borderRadius,
}: FormVisualPreviewProps) {
  // Styles pour le conteneur
  const containerStyle: React.CSSProperties = {
    backgroundColor: (backgroundColor && backgroundColor.trim() !== '' && backgroundColor !== '#f9fafb')
      ? (backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`)
      : '#ffffff',
    borderRadius: (borderRadius && borderRadius.trim() !== '') ? borderRadius : '8px',
    fontFamily: (fontFamily && fontFamily.trim() !== '') ? fontFamily : undefined,
  };

  // Styles pour les inputs
  const inputStyle: React.CSSProperties = {
    borderRadius: (borderRadius && borderRadius.trim() !== '') ? borderRadius : '8px',
  };

  // Styles pour le bouton
  const buttonStyle: React.CSSProperties = {
    backgroundColor: (primaryButtonColor && primaryButtonColor.trim() !== '')
      ? (primaryButtonColor.startsWith('#') ? primaryButtonColor : `#${primaryButtonColor}`)
      : '#4b5563',
    borderRadius: (borderRadius && borderRadius.trim() !== '') ? borderRadius : '8px',
  };

  const textColorStyle = (textColor && textColor.trim() !== '')
    ? (textColor.startsWith('#') ? textColor : `#${textColor}`)
    : '#111827';

  const textColorSecondary = (textColor && textColor.trim() !== '')
    ? (() => {
        const color = textColor.startsWith('#') ? textColor : `#${textColor}`;
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
      })()
    : '#4b5563';

  return (
    <div className="shadow-lg p-8 max-w-2xl mx-auto" style={containerStyle}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: textColorStyle }}>
        {formName}
      </h2>
      {formDescription && (
        <p className="mb-6" style={{ color: textColorSecondary }}>
          {formDescription}
        </p>
      )}

      <form className="space-y-4">
        {formFields
          .sort((a, b) => (a as any).order - (b as any).order)
          .map((field) => {
            const options = field.optionsJson ? JSON.parse(field.optionsJson) : [];

            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: textColorStyle }}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'TEXT' && (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    placeholder={`Saisissez ${field.label.toLowerCase()}`}
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'EMAIL' && (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    placeholder="exemple@email.com"
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'PHONE' && (
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    placeholder="+33 6 12 34 56 78"
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'NUMBER' && (
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    placeholder="0"
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'SELECT' && (
                  <select
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                    disabled
                    style={{
                      ...inputStyle,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Sélectionnez une option</option>
                    {options.map((opt: string, i: number) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'RADIO' && (
                  <div className="space-y-2">
                    {options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="radio"
                          name={field.id}
                          disabled
                          className="mr-2"
                        />
                        <span style={{ color: textColorStyle }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'CHECKBOX' && (
                  <div className="space-y-2">
                    {options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          disabled
                          className="mr-2"
                        />
                        <span style={{ color: textColorStyle }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'TEXTAREA' && (
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    placeholder={`Saisissez ${field.label.toLowerCase()}`}
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'DATE' && (
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                    disabled
                    style={inputStyle}
                  />
                )}

                {field.type === 'BUDGET' && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black"
                      placeholder="0.00"
                      disabled
                      style={inputStyle}
                    />
                  </div>
                )}

                {field.type === 'RATING' && (
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-2xl" style={{ color: '#d1d5db' }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {formFields.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Aucun champ défini
          </p>
        )}

        {formFields.length > 0 && (
          <div className="pt-4">
            <button
              type="button"
              className="w-full px-4 py-2 text-white transition-colors"
              disabled
              style={buttonStyle}
            >
              Soumettre
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

