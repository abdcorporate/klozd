'use client';

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usersApi, invitationsApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCursorPagination } from '@/lib/pagination/useCursorPagination';

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

function UsersPageContent() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pagination = useCursorPagination<User>();
  const { items: users, pageInfo, loading, error: paginationError, limit, cursor, sortBy, sortOrder, q, setQuery, setSort, nextPage, setLoading, setError, setItems, setPageInfo } = pagination;
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
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
  
  // Rôles disponibles pour l'édition (inclut le rôle actuel de l'utilisateur édité)
  const editAvailableRoles = useMemo(() => {
    if (!editingUser) return availableRoles;
    // Inclure le rôle actuel de l'utilisateur même s'il n'est pas dans availableRoles
    const currentRole = editingUser.role;
    if (availableRoles.includes(currentRole)) {
      return availableRoles;
    }
    // Ajouter le rôle actuel en premier pour qu'il soit visible
    return [currentRole, ...availableRoles];
  }, [availableRoles, editingUser?.role]);
  
  // Rôle par défaut : premier rôle disponible
  const defaultRole = availableRoles.length > 0 ? availableRoles[0] : 'CLOSER';

  const [formData, setFormData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password?: string;
  }>({
    email: '',
    firstName: '',
    lastName: '',
    role: defaultRole,
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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

  // Fetch users with pagination
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await usersApi.getAll({
          limit,
          cursor: cursor || undefined,
          sortBy,
          sortOrder,
          q: q || undefined,
        });
        
        // Handle new paginated response format: { items, pageInfo }
        if (response.data.items && response.data.pageInfo) {
          setItems(response.data.items);
          setPageInfo(response.data.pageInfo);
        } else {
          // Fallback for old format
          const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          setItems(items);
          setPageInfo({
            limit: items.length,
            nextCursor: null,
            hasNextPage: false,
          });
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [limit, cursor, sortBy, sortOrder, q, isAuthenticated, user]);

  // Fetch invitations (only once, not paginated)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') {
      const fetchInvitations = async () => {
        try {
          const invitationsResponse = await invitationsApi.getAll();
          setInvitations(invitationsResponse.data || []);
        } catch (invError) {
          console.error('Error fetching invitations:', invError);
          setInvitations([]);
        }
      };
      fetchInvitations();
    }
  }, [user?.role, isAuthenticated]);

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
  }, [isAuthenticated, user?.role, router]);

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
        password: '',
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
      setFormError(null);
      
      await usersApi.delete(userId);
      
      // Recharger la liste avec les mêmes paramètres
      const response = await usersApi.getAll({
        limit,
        cursor: cursor || undefined,
        sortBy,
        sortOrder,
        q: q || undefined,
      });
      
      if (response.data.items && response.data.pageInfo) {
        setItems(response.data.items);
        setPageInfo(response.data.pageInfo);
      } else {
        const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setItems(items);
      }
      
      setShowDeleteConfirm(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de l\'utilisateur';
      setFormError(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    // Validation frontend : s'assurer que le rôle est autorisé
    if (!availableRoles.includes(formData.role)) {
      setFormError(`Vous n'avez pas la permission de modifier un utilisateur avec le rôle ${formData.role}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Préparer les données à mettre à jour (uniquement les champs modifiés)
      const updateData: any = {};
      if (formData.firstName !== editingUser.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName !== editingUser.lastName) updateData.lastName = formData.lastName;
      if (formData.role !== editingUser.role) updateData.role = formData.role;
      // Inclure le mot de passe seulement s'il est défini et non vide
      if (formData.password && formData.password.trim().length > 0) {
        updateData.password = formData.password;
      }

      await usersApi.update(editingUser.id, updateData);
      
      // Recharger la liste avec les mêmes paramètres
      const response = await usersApi.getAll({
        limit,
        cursor: cursor || undefined,
        sortBy,
        sortOrder,
        q: q || undefined,
      });
      
      if (response.data.items && response.data.pageInfo) {
        setItems(response.data.items);
        setPageInfo(response.data.pageInfo);
      } else {
        const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setItems(items);
      }
      
      // Réinitialiser
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: defaultRole,
        password: '',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation frontend : s'assurer que le rôle est autorisé
    if (!availableRoles.includes(formData.role)) {
      setFormError(`Vous n'avez pas la permission d'inviter un utilisateur avec le rôle ${formData.role}`);
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
      
      // Recharger les utilisateurs avec les mêmes paramètres
      const response = await usersApi.getAll({
        limit,
        cursor: cursor || undefined,
        sortBy,
        sortOrder,
        q: q || undefined,
      });
      
      if (response.data.items && response.data.pageInfo) {
        setItems(response.data.items);
        setPageInfo(response.data.pageInfo);
      } else {
        const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setItems(items);
      }
      
      // Recharger les invitations
      if (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') {
        try {
          const invitationsResponse = await invitationsApi.getAll();
          setInvitations(invitationsResponse.data || []);
        } catch (invError) {
          console.error('Error fetching invitations:', invError);
        }
      }
      
      // Réinitialiser le formulaire avec le premier rôle disponible
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: availableRoles.length > 0 ? availableRoles[0] : 'CLOSER',
        password: '',
      });
      setShowCreateModal(false);
      
      // Afficher un message de succès
      alert('Invitation envoyée avec succès ! L\'utilisateur recevra un email pour créer son compte.');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi de l\'invitation';
      setFormError(errorMessage);
      
      // Si c'est une erreur de quota, afficher un message plus explicite
      if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        setFormError(`${errorMessage}. Veuillez passer à un plan supérieur dans les paramètres.`);
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

        {(paginationError || formError) && (
          <div className="p-4 bg-slate-100 border border-slate-300 text-slate-800 rounded">
            {paginationError?.message || formError}
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
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => {
                            setEditingUser(userItem);
                            setShowEditModal(true);
                          }}
                          className="group relative p-2.5 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-300 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-white/80 backdrop-blur-sm"
                          title="Modifier"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-[-5deg]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-100/0 via-gray-100/50 to-gray-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
                        </button>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => setShowDeleteConfirm(userItem.id)}
                            disabled={deletingUserId === userItem.id}
                            className="group relative p-2.5 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-300 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-white/80 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                            title={deletingUserId === userItem.id ? 'Suppression...' : 'Supprimer'}
                          >
                            {deletingUserId === userItem.id ? (
                              <svg
                                className="animate-spin h-4.5 w-4.5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )}
                            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-100/0 via-gray-100/50 to-gray-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
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
                                  // Recharger les invitations
                                  const invitationsResponse = await invitationsApi.getAll();
                                  setInvitations(invitationsResponse.data || []);
                                  alert('Invitation renvoyée avec succès !');
                                } catch (err: any) {
                                  setFormError(err.response?.data?.message || 'Erreur lors du renvoi de l\'invitation');
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
                                    // Recharger les invitations
                                    const invitationsResponse = await invitationsApi.getAll();
                                    setInvitations(invitationsResponse.data || []);
                                  } catch (err: any) {
                                    setFormError(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'invitation');
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
                    value={formData.password || ''}
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
                    value={formData.role}
                    onChange={(e) => {
                      // Vérifier que le rôle sélectionné est autorisé ou est le rôle actuel
                      const newRole = e.target.value;
                      if (editAvailableRoles.includes(newRole)) {
                        setFormData({ ...formData, role: newRole });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
                  >
                    {editAvailableRoles.length === 0 ? (
                      <option value="">Aucun rôle disponible</option>
                    ) : (
                      editAvailableRoles.map((role) => (
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

export default function UsersPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </AppLayout>
    }>
      <UsersPageContent />
    </Suspense>
  );
}
