'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DealsFiltersProps {
  filters: {
    search: string;
    closerId: string;
    minValue: string;
    maxValue: string;
    startDate: string;
    endDate: string;
    stage: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function DealsFilters({ filters, onFiltersChange }: DealsFiltersProps) {
  const [closers, setClosers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchClosers = async () => {
      try {
        const response = await usersApi.getAll();
        const closersList = response.data.filter((user: any) => user.role === 'CLOSER');
        setClosers(closersList);
      } catch (err) {
        console.error('Erreur lors du chargement des closers:', err);
      }
    };
    fetchClosers();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      closerId: '',
      minValue: '',
      maxValue: '',
      startDate: '',
      endDate: '',
      stage: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Réinitialiser
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            {showFilters ? 'Masquer' : 'Afficher'} filtres
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Titre, lead, email..."
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            />
          </div>

          {/* Closer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closer
            </label>
            <select
              value={filters.closerId}
              onChange={(e) => handleFilterChange('closerId', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            >
              <option value="">Tous</option>
              {closers.map((closer) => (
                <option key={closer.id} value={closer.id}>
                  {closer.firstName} {closer.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Étape
            </label>
            <select
              value={filters.stage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            >
              <option value="">Toutes</option>
              <option value="QUALIFIED">Qualifié</option>
              <option value="APPOINTMENT_SCHEDULED">RDV planifié</option>
              <option value="PROPOSAL_SENT">Proposition envoyée</option>
              <option value="NEGOTIATION">Négociation</option>
              <option value="WON">Gagné</option>
              <option value="LOST">Perdu</option>
            </select>
          </div>

          {/* Valeur min */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valeur min (€)
            </label>
            <input
              type="number"
              value={filters.minValue}
              onChange={(e) => handleFilterChange('minValue', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            />
          </div>

          {/* Valeur max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valeur max (€)
            </label>
            <input
              type="number"
              value={filters.maxValue}
              onChange={(e) => handleFilterChange('maxValue', e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            />
          </div>

          {/* Date début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange placeholder-gray-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

