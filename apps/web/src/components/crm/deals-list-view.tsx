'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  lead: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DealsListViewProps {
  deals: Deal[];
  onDealUpdate: (dealId: string, newStage: string) => Promise<void>;
  onExportCSV: () => void;
}

type SortField = 'title' | 'value' | 'stage' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const stageLabels: Record<string, string> = {
  QUALIFIED: 'Qualifié',
  APPOINTMENT_SCHEDULED: 'RDV planifié',
  PROPOSAL_SENT: 'Proposition envoyée',
  NEGOTIATION: 'Négociation',
  WON: 'Gagné',
  LOST: 'Perdu',
};

const stageColors: Record<string, string> = {
  QUALIFIED: 'bg-blue-100 text-blue-800',
  APPOINTMENT_SCHEDULED: 'bg-yellow-100 text-yellow-800',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

export function DealsListView({ deals, onDealUpdate, onExportCSV }: DealsListViewProps) {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    lead: true,
    value: true,
    stage: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  });

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setShowColumnsMenu(false);
      }
    };

    if (showColumnsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnsMenu]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'value') {
      aValue = a.value;
      bValue = b.value;
    } else if (sortField === 'title') {
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
    } else if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-600">↕</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {deals.length} deal{deals.length > 1 ? 's' : ''} au total
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExportCSV}
            className="px-5 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
          >
            Exporter CSV
          </button>
          <div className="relative" ref={columnsMenuRef}>
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Colonnes
            </button>
            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-100 rounded-md shadow-lg z-10 border border-gray-300 p-2">
              <div className="space-y-2">
                {Object.entries(visibleColumns).map(([key, visible]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) =>
                        setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      style={{
                        accentColor: '#dd7200',
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      {key === 'title' ? 'Titre' :
                       key === 'lead' ? 'Lead' :
                       key === 'value' ? 'Valeur' :
                       key === 'stage' ? 'Étape' :
                       key === 'createdBy' ? 'Créé par' :
                       key === 'createdAt' ? 'Date création' :
                       'Date mise à jour'}
                    </span>
                  </label>
                ))}
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {visibleColumns.title && (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Titre</span>
                      <SortIcon field="title" />
                    </div>
                  </th>
                )}
                {visibleColumns.lead && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                )}
                {visibleColumns.value && (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Valeur</span>
                      <SortIcon field="value" />
                    </div>
                  </th>
                )}
                {visibleColumns.stage && (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('stage')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Étape</span>
                      <SortIcon field="stage" />
                    </div>
                  </th>
                )}
                {visibleColumns.createdBy && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé par
                  </th>
                )}
                {visibleColumns.createdAt && (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date création</span>
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                )}
                {visibleColumns.updatedAt && (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Dernière mise à jour</span>
                      <SortIcon field="updatedAt" />
                    </div>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-100">
                  {visibleColumns.title && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/crm/deals/${deal.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-orange transition-colors"
                      >
                        {deal.title}
                      </Link>
                    </td>
                  )}
                  {visibleColumns.lead && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {deal.lead.firstName} {deal.lead.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{deal.lead.email}</div>
                    </td>
                  )}
                  {visibleColumns.value && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(deal.value)}
                      </div>
                    </td>
                  )}
                  {visibleColumns.stage && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={deal.stage}
                        onChange={(e) => onDealUpdate(deal.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${stageColors[deal.stage] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {Object.entries(stageLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  {visibleColumns.createdBy && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deal.createdBy.firstName} {deal.createdBy.lastName}
                    </td>
                  )}
                  {visibleColumns.createdAt && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(deal.createdAt), 'PPp', { locale: fr })}
                    </td>
                  )}
                  {visibleColumns.updatedAt && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(deal.updatedAt), 'PPp', { locale: fr })}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/crm/deals/${deal.id}`}
                      className="text-black hover:text-gray-600 transition-colors"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

