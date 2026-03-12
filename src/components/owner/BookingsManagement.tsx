import { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  courts: { name: string };
};

export function BookingsManagement() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    if (profile) {
      loadBookings();
    }
  }, [profile]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts!inner (name, owner_id)
        `)
        .eq('courts.owner_id', profile?.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Erro ao atualizar reserva');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const statusLabels = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Concluída'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gerenciar Reservas</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmadas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{booking.courts.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Cliente</p>
                      <p>{booking.customer_name}</p>
                      <p>{booking.customer_email}</p>
                      <p>{booking.customer_phone}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-1">Reserva</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                      </div>
                      <p className="font-bold text-blue-600 mt-2">
                        R$ {booking.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar</span>
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
