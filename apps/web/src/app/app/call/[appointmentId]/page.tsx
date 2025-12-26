'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { callsApi } from '@/lib/api';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

interface CallData {
  callId: string;
  roomName: string;
  token: string;
  livekitUrl: string;
  appointment: {
    id: string;
    lead: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    closer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    scheduledAt: string;
  };
}

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const appointmentId = params?.appointmentId as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Vérifier les rôles autorisés
    const allowedRoles = ['ADMIN', 'MANAGER', 'CLOSER', 'SETTER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      setError('Vous n\'avez pas la permission d\'accéder à cette page');
      setLoading(false);
      return;
    }

    const joinCall = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await callsApi.joinCall(appointmentId);
        setCallData(response.data);
      } catch (err: any) {
        console.error('Erreur lors de la connexion au call:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Impossible de se connecter au call';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      joinCall();
    }
  }, [appointmentId, user, isAuthenticated, router]);

  const handleDisconnect = async () => {
    if (callData) {
      try {
        await callsApi.stopCall(callData.callId);
      } catch (err) {
        console.error('Erreur lors de la déconnexion:', err);
      }
    }
    router.push('/scheduling');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-900 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connexion au call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-600 text-gray-900 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push('/scheduling')}
            className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100"
          >
            Retour au planning
          </button>
        </div>
      </div>
    );
  }

  if (!callData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <LiveKitRoom
        video={true}
        audio={true}
        token={callData.token}
        serverUrl={callData.livekitUrl}
        connect={true}
        data-lk-theme="default"
        onDisconnected={handleDisconnect}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-gray-100 text-gray-900 p-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">
                Call avec {callData.appointment.lead.firstName || ''}{' '}
                {callData.appointment.lead.lastName || ''}
              </h1>
              <p className="text-sm text-gray-700">
                {callData.appointment.closer.firstName} {callData.appointment.closer.lastName}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Quitter
            </button>
          </div>

          {/* Video Conference */}
          <div className="flex-1">
            <VideoConference />
            <RoomAudioRenderer />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}




