import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { CourtForm } from '../components/owner/CourtForm';
import { BookingsManagement } from '../components/owner/BookingsManagement';

type Court = Database['public']['Tables']['courts']['Row'];

export function OwnerDashboard() {
  const { profile } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [activeTab, setActiveTab] = useState<'courts' | 'bookings'>('courts');

  useEffect(() => {
    if (profile) {
      loadCourts();
    }
  }, [profile]);

  const loadCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courtId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta quadra?')) return;

    try {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', courtId);

      if (error) throw error;
      loadCourts();
    } catch (error) {
      console.error('Error deleting court:', error);
      alert('Erro ao excluir quadra');
    }
  };

  const sportLabels = {
    futebol_society: 'Futebol Society',
    futevolei: 'Futevôlei',
    beach_tennis: 'Beach Tennis',
    volei: 'Vôlei'
  };

  if (showForm) {
    return (
      <CourtForm
        court={editingCourt}
        onClose={() => {
          setShowForm(false);
          setEditingCourt(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingCourt(null);
          loadCourts();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel do Proprietário</h1>
              <p className="text-gray-600 mt-1">Gerencie suas quadras e reservas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('courts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'courts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Minhas Quadras ({courts.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reservas
              </button>
            </nav>
          </div>

          {activeTab === 'courts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Suas Quadras</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Quadra</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : courts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Você ainda não cadastrou nenhuma quadra</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Cadastrar primeira quadra
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{court.name}</h3>
                          <span className="text-sm text-gray-600">
                            {sportLabels[court.sport_type]}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            court.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {court.status === 'active' ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>

                      <div className="text-gray-600 text-sm mb-4">
                        <p>{court.city} - {court.state}</p>
                        <p className="font-bold text-blue-600 text-lg mt-2">
                          R$ {court.price_per_hour.toFixed(2)}/hora
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCourt(court);
                            setShowForm(true);
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(court.id)}
                          className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && <BookingsManagement />}
        </div>
      </div>
    </div>
  );
}
