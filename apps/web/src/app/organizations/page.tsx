'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { organizationsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  currency: string;
  createdAt: string;
  _count: {
    users: number;
  };
  settings: {
    subscriptionPlan: string;
    monthlyPrice: number;
  } | null;
}

export default function OrganizationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timezone: 'Europe/Paris',
    currency: 'EUR',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Seul le SUPER_ADMIN peut accéder à cette page
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchOrganizations();
  }, [user, isAuthenticated, router]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsApi.getAll();
      setOrganizations(response.data || []);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError('Erreur lors du chargement des organisations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      timezone: org.timezone,
      currency: org.currency,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      setSubmitting(true);
      setError(null);
      
      // Préparer les données à envoyer (uniquement les champs modifiés)
      const updateData: any = {};
      if (formData.name !== editingOrg.name) updateData.name = formData.name;
      if (formData.slug !== editingOrg.slug) updateData.slug = formData.slug;
      if (formData.timezone !== editingOrg.timezone) updateData.timezone = formData.timezone;
      if (formData.currency !== editingOrg.currency) updateData.currency = formData.currency;

      console.log('[OrganizationsPage] Updating organization:', { id: editingOrg.id, updateData });
      
      await organizationsApi.update(editingOrg.id, updateData);
      await fetchOrganizations();
      setShowEditModal(false);
      setEditingOrg(null);
    } catch (err: any) {
      console.error('[OrganizationsPage] Update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    try {
      setDeletingOrgId(orgId);
      setError(null);
      console.log('[OrganizationsPage] Deleting organization:', orgId);
      await organizationsApi.delete(orgId);
      console.log('[OrganizationsPage] Delete success');
      await fetchOrganizations();
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('[OrganizationsPage] Delete error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
    } finally {
      setDeletingOrgId(null);
    }
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      solo: 'Solo',
      team: 'Team',
      enterprise: 'Enterprise',
    };
    return labels[plan] || plan;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organisations</h1>
            <p className="text-gray-600 mt-2">
              Gérez toutes les organisations de la plateforme
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Liste des organisations */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateurs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{org.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {getPlanLabel(org.settings?.subscriptionPlan || 'solo')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{org._count.users}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(org.createdAt), 'd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(org)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(org.id)}
                        disabled={deletingOrgId === org.id || org._count.users > 0}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingOrgId === org.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune organisation pour le moment</p>
            </div>
          )}
        </div>

        {/* Modal de modification */}
        {showEditModal && editingOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier l'organisation</h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuseau horaire
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                    <option value="Europe/London">Europe/London (UTC+0/+1)</option>
                    <option value="Europe/Berlin">Europe/Berlin (UTC+1/+2)</option>
                    <option value="Europe/Madrid">Europe/Madrid (UTC+1/+2)</option>
                    <option value="Europe/Rome">Europe/Rome (UTC+1/+2)</option>
                    <option value="Europe/Amsterdam">Europe/Amsterdam (UTC+1/+2)</option>
                    <option value="Europe/Brussels">Europe/Brussels (UTC+1/+2)</option>
                    <option value="Europe/Zurich">Europe/Zurich (UTC+1/+2)</option>
                    <option value="America/New_York">America/New_York (UTC-5/-4)</option>
                    <option value="America/Chicago">America/Chicago (UTC-6/-5)</option>
                    <option value="America/Denver">America/Denver (UTC-7/-6)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (UTC-8/-7)</option>
                    <option value="America/Toronto">America/Toronto (UTC-5/-4)</option>
                    <option value="America/Montreal">America/Montreal (UTC-5/-4)</option>
                    <option value="America/Mexico_City">America/Mexico_City (UTC-6/-5)</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3/-2)</option>
                    <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                    <option value="Asia/Hong_Kong">Asia/Hong_Kong (UTC+8)</option>
                    <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                    <option value="Asia/Mumbai">Asia/Mumbai (UTC+5:30)</option>
                    <option value="Australia/Sydney">Australia/Sydney (UTC+10/+11)</option>
                    <option value="Australia/Melbourne">Australia/Melbourne (UTC+10/+11)</option>
                    <option value="Pacific/Auckland">Pacific/Auckland (UTC+12/+13)</option>
                    <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
                    <option value="Africa/Casablanca">Africa/Casablanca (UTC+0/+1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Devise
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
                  >
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="NZD">NZD - New Zealand Dollar</option>
                    <option value="JPY">JPY - Japanese Yen (¥)</option>
                    <option value="CNY">CNY - Chinese Yuan (¥)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="BRL">BRL - Brazilian Real (R$)</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="DKK">DKK - Danish Krone</option>
                    <option value="PLN">PLN - Polish Zloty</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="RUB">RUB - Russian Ruble</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrg(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmer la suppression</h2>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible.
                  L'organisation doit être vide (aucun utilisateur) pour être supprimée.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deletingOrgId !== null}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingOrgId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingOrgId ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

