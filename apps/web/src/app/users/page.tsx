'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usersApi, invitationsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function UsersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Rôles que l'utilisateur peut inviter selon les permissions (mémorisé)
  const availableRoles = useMemo(() => {
    if (user?.role === 'ADMIN') {
      // ADMIN peut inviter MANAGER, CLOSER, SETTER dans son organisation
      return ['MANAGER', 'CLOSER', 'SETTER'];
    }
    if (user?.role === 'MANAGER') {
      // MANAGER peut inviter seulement CLOSER et SETTER
      return ['CLOSER', 'SETTER'];
    }
    // Autres rôles ne peuvent pas inviter d'utilisateurs
    return [];
  }, [user?.role]);
  
  // Rôle par défaut : premier rôle disponible
  const defaultRole = availableRoles.length > 0 ? availableRoles[0] : 'CLOSER';

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: defaultRole,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');

  // Fonction pour traduire le statut de l'utilisateur
  const getUserStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      PENDING: 'En attente',
    };
    return statusMap[status] || status;
  };

  // Fonction fetchData mémorisée pour éviter les re-créations
  const fetchData = useCallback(async () => {
    try {
      console.log('[UsersPage] Récupération des utilisateurs pour:', user?.role);
      const usersResponse = await usersApi.getAll();
      
      console.log('[UsersPage] Utilisateurs reçus:', usersResponse.data?.length || 0);
      console.log('[UsersPage] Données:', usersResponse.data);
      setUsers(usersResponse.data || []);
      
        // Récupérer les invitations pour ADMIN, MANAGER et SUPER_ADMIN
        if (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') {
          try {
            const invitationsResponse = await invitationsApi.getAll();
            setInvitations(invitationsResponse.data || []);
          } catch (invError) {
            console.error('Error fetching invitations:', invError);
            // Ne pas bloquer l'affichage si les invitations échouent
            setInvitations([]);
          }
        }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Vérifier les permissions (ADMIN ou Manager)
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER' && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [isAuthenticated, user?.role, router, fetchData]);

  // S'assurer que le rôle sélectionné est toujours valide (séparé pour éviter les boucles)
  useEffect(() => {
    if (user && availableRoles.length > 0 && !availableRoles.includes(formData.role)) {
      setFormData(prev => ({
        ...prev,
        role: availableRoles[0],
      }));
    }
  }, [user, availableRoles, formData.role]);

  // Initialiser le formulaire quand on ouvre le modal d'édition
  useEffect(() => {
    if (showEditModal && editingUser) {
      setFormData({
        email: editingUser.email,
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        role: editingUser.role,
      });
    }
  }, [showEditModal, editingUser]);

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      CLOSER: 'Closer',
      SETTER: 'Setter',
      SUPER_ADMIN: 'Super Admin',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-slate-100 text-slate-800',
      MANAGER: 'bg-slate-100 text-slate-800',
      CLOSER: 'bg-slate-100 text-slate-800',
      SETTER: 'bg-slate-100 text-slate-800',
      SUPER_ADMIN: 'bg-slate-100 text-slate-800',
    };
    return colors[role] || 'bg-slate-100 text-slate-800';
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingUserId(userId);
      setError(null);
      
      await usersApi.delete(userId);
      
      // Recharger la liste
      const response = await usersApi.getAll();
      setUsers(response.data);
      
      setShowDeleteConfirm(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de l\'utilisateur';
      setError(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);

    // Validation frontend : s'assurer que le rôle est autorisé
    if (!availableRoles.includes(formData.role)) {
      setError(`Vous n'avez pas la permission de modifier un utilisateur avec le rôle ${formData.role}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Préparer les données à mettre à jour (uniquement les champs modifiés)
      const updateData: any = {};
      if (formData.firstName !== editingUser.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName !== editingUser.lastName) updateData.lastName = formData.lastName;
      if (formData.role !== editingUser.role) updateData.role = formData.role;
      // Le mot de passe peut être modifié séparément si nécessaire
      // (pour l'instant, on ne modifie pas le mot de passe via ce formulaire)

      await usersApi.update(editingUser.id, updateData);
      
      // Recharger la liste
      const response = await usersApi.getAll();
      setUsers(response.data);
      
      // Réinitialiser
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: defaultRole,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation frontend : s'assurer que le rôle est autorisé
    if (!availableRoles.includes(formData.role)) {
      setError(`Vous n'avez pas la permission d'inviter un utilisateur avec le rôle ${formData.role}`);
      return;
    }

    try {
      setSubmitting(true);
      // Utiliser l'API d'invitations au lieu de créer directement l'utilisateur
      await invitationsApi.create({
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      // Recharger toutes les données (utilisateurs et invitations)
      await fetchData();
      
      // Réinitialiser le formulaire avec le premier rôle disponible
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: availableRoles.length > 0 ? availableRoles[0] : 'CLOSER',
      });
      setShowCreateModal(false);
      
      // Afficher un message de succès
      alert('Invitation envoyée avec succès ! L\'utilisateur recevra un email pour créer son compte.');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi de l\'invitation';
      setError(errorMessage);
      
      // Si c'est une erreur de quota, afficher un message plus explicite
      if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        setError(`${errorMessage}. Veuillez passer à un plan supérieur dans les paramètres.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Si l'utilisateur ne peut pas inviter d'utilisateurs, rediriger
  if (!loading && availableRoles.length === 0 && user?.role !== 'ADMIN' && user?.role !== 'MANAGER' && user?.role !== 'SUPER_ADMIN') {
    router.push('/dashboard');
    return null;
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Utilisateurs</h1>
              {user?.role === 'SUPER_ADMIN' && (
                <span className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-full">
                  VUE SUPER_ADMIN
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-2">
              {activeTab === 'users'
                ? user?.role === 'SUPER_ADMIN'
                  ? 'Gérez tous les utilisateurs de toutes les organisations'
                  : user?.role === 'ADMIN' 
                  ? `Gérez tous les membres de l'organisation ${user?.organizationName || ''}`
                  : user?.role === 'MANAGER'
                  ? `Gérez les membres de l'organisation ${user?.organizationName || ''}`
                  : `Membres de l'organisation ${user?.organizationName || ''}`
                : 'Gérez les invitations envoyées'}
            </p>
          </div>
          {activeTab === 'users' && availableRoles.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm bg-black hover:bg-gray-800"
            >
              + Inviter un utilisateur
            </button>
          )}
        </div>

        {/* Onglets */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invitations'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invitations
              </button>
            </nav>
          </div>
        )}

        {error && (
          <div className="p-4 bg-slate-100 border border-slate-300 text-slate-800 rounded">
            {error}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'users' ? (
          /* Liste des utilisateurs */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                {user?.role === 'SUPER_ADMIN' && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Organisation</th>
                )}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Créé le</th>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
                <tbody className="bg-white divide-y divide-slate-200">
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {userItem.firstName} {userItem.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{userItem.email}</div>
                  </td>
                  {user?.role === 'SUPER_ADMIN' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userItem.organization?.name || 'N/A'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${getRoleColor(userItem.role)}`}>
                      {getRoleLabel(userItem.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        userItem.status === 'ACTIVE'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {getUserStatusLabel(userItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(userItem.createdAt), 'd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  {((user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') || 
                    (user?.role === 'MANAGER' && (userItem.role === 'CLOSER' || userItem.role === 'SETTER'))) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(userItem);
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1 text-sm rounded-md transition-colors"
                          style={{ color: '#dd7200' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#b85f00';
                            e.currentTarget.style.backgroundColor = '#fef3e7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#dd7200';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Modifier
                        </button>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => setShowDeleteConfirm(userItem.id)}
                            disabled={deletingUserId === userItem.id}
                            className="px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: '#dd7200' }}
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.color = '#b85f00';
                                e.currentTarget.style.backgroundColor = '#fef3e7';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#dd7200';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {deletingUserId === userItem.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun utilisateur pour le moment</p>
            </div>
          )}
        </div>
        ) : (
          /* Liste des invitations */
          (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
              <p className="text-sm text-gray-600 mt-1">Invitations envoyées (en attente, acceptées, expirées)</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Envoyée le</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {invitations
                  .filter((invitation) => {
                    // Filtrer les invitations refusées
                    if (invitation.status === 'DECLINED') return false;
                    // MANAGER ne voit que les invitations pour CLOSER et SETTER
                    if (user?.role === 'MANAGER') {
                      return invitation.role === 'CLOSER' || invitation.role === 'SETTER';
                    }
                    // ADMIN et SUPER_ADMIN voient toutes les invitations
                    return true;
                  })
                  .map((invitation) => {
                  const getStatusColor = (status: string) => {
                    const colors: Record<string, string> = {
                      INVITED: 'bg-slate-200 text-slate-800',
                      ACCEPTED: 'bg-slate-800 text-white',
                      DECLINED: 'bg-slate-400 text-white',
                      EXPIRED: 'bg-slate-300 text-slate-800',
                      CONFLICT: 'bg-slate-500 text-white',
                    };
                    return colors[status] || 'bg-slate-100 text-slate-800';
                  };

                  const getStatusLabel = (status: string) => {
                    const labels: Record<string, string> = {
                      INVITED: 'En attente',
                      ACCEPTED: 'Acceptée',
                      DECLINED: 'Refusée',
                      EXPIRED: 'Expirée',
                      CONFLICT: 'Conflit',
                    };
                    return labels[status] || status;
                  };

                  return (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {invitation.firstName && invitation.lastName 
                            ? `${invitation.firstName} ${invitation.lastName}`
                            : 'Non renseigné'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getRoleColor(invitation.role)}`}>
                          {getRoleLabel(invitation.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(invitation.status)}`}>
                          {getStatusLabel(invitation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(invitation.createdAt), 'd MMM yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          {(invitation.status === 'INVITED' || invitation.status === 'EXPIRED') && (
                            <button
                              onClick={async () => {
                                try {
                                  await invitationsApi.resend(invitation.id);
                                  await fetchData();
                                  alert('Invitation renvoyée avec succès !');
                                } catch (err: any) {
                                  setError(err.response?.data?.message || 'Erreur lors du renvoi de l\'invitation');
                                }
                              }}
                              className="px-3 py-1 text-sm rounded-md transition-colors"
                              style={{ color: '#dd7200' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#b85f00';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#dd7200';
                              }}
                            >
                              Renvoyer
                            </button>
                          )}
                          {invitation.status === 'INVITED' && (
                            <button
                              onClick={async () => {
                                if (confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
                                  try {
                                    await invitationsApi.cancel(invitation.id);
                                    await fetchData();
                                  } catch (err: any) {
                                    setError(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'invitation');
                                  }
                                }
                              }}
                              className="px-3 py-1 text-sm rounded-md transition-colors"
                              style={{ color: '#dd7200' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#b85f00';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#dd7200';
                              }}
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {invitations.filter((inv) => {
              if (inv.status === 'DECLINED') return false;
              // MANAGER ne voit que les invitations pour CLOSER et SETTER
              if (user?.role === 'MANAGER') {
                return inv.role === 'CLOSER' || inv.role === 'SETTER';
              }
              return true;
            }).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">Aucune invitation active</p>
              </div>
            )}
          </div>
          ) : null
        )}

        {/* Modal de modification */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Modifier les informations de {editingUser.firstName} {editingUser.lastName}
                </p>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 text-slate-500 rounded-lg cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Rôle *
                  </label>
                  <select
                    required
                    value={availableRoles.includes(formData.role) ? formData.role : (availableRoles[0] || '')}
                    onChange={(e) => {
                      if (availableRoles.includes(e.target.value)) {
                        setFormData({ ...formData, role: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  >
                    {availableRoles.length === 0 ? (
                      <option value="">Aucun rôle disponible</option>
                    ) : (
                      availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setFormData({
                        email: '',
                        firstName: '',
                        lastName: '',
                        role: defaultRole,
                      });
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
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
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deletingUserId !== null}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  disabled={deletingUserId !== null}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingUserId ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Inviter un utilisateur</h2>
                {user?.role === 'ADMIN' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Envoyez une invitation par email. L'utilisateur créera son compte avec son propre mot de passe.
                  </p>
                )}
                {user?.role === 'MANAGER' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Envoyez une invitation par email. L'utilisateur créera son compte avec son propre mot de passe.
                  </p>
                )}
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  />
                </div>


                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Rôle *
                  </label>
                  <select
                    required
                    value={availableRoles.includes(formData.role) ? formData.role : (availableRoles[0] || '')}
                    onChange={(e) => {
                      // Valider que le rôle sélectionné est autorisé
                      if (availableRoles.includes(e.target.value)) {
                        setFormData({ ...formData, role: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  >
                    {availableRoles.length === 0 ? (
                      <option value="">Aucun rôle disponible</option>
                    ) : (
                      availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))
                    )}
                  </select>
                  {user?.role === 'ADMIN' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Vous pouvez inviter tous les rôles (sauf Admin)
                    </p>
                  )}
                  {user?.role === 'MANAGER' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Vous pouvez inviter seulement des Closers et Setters
                    </p>
                  )}
                </div>


                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  >
                    {submitting ? 'Envoi...' : 'Inviter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

