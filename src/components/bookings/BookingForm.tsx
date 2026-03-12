import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, DollarSign, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Court = Database['public']['Tables']['courts']['Row'];

interface BookingFormProps {
  court: Court;
  onBack: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const CONVENIENCE_FEE_PERCENT = 0.05;

export function BookingForm({ court, onBack }: BookingFormProps) {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [customerEmail, setCustomerEmail] = useState(profile?.email || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    if (selectedDate) {
      loadExistingBookings();
    }
  }, [selectedDate]);

  const loadExistingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('court_id', court.id)
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled');

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculateTotal = () => {
    const hours = calculateHours();
    return hours * court.price_per_hour;
  };

  const calculateConvenienceFee = () => {
    return calculateTotal() * CONVENIENCE_FEE_PERCENT;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (calculateHours() <= 0) {
      alert('O horário final deve ser posterior ao horário inicial');
      setLoading(false);
      return;
    }

    try {
      const totalPrice = calculateTotal();
      const convenienceFee = calculateConvenienceFee();

      const { error } = await supabase
        .from('bookings')
        .insert({
          court_id: court.id,
          customer_id: user?.id || null,
          booking_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          total_price: totalPrice,
          convenience_fee: convenienceFee,
          status: 'pending',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        });

      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Erro ao criar reserva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Reserva Solicitada!</h2>
          <p className="text-gray-600 mb-6">
            Sua reserva foi enviada e está aguardando confirmação do proprietário.
            Você receberá um e-mail assim que for confirmada.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fazer Reserva</h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{court.name}</h3>
            <p className="text-gray-600">
              {court.city} - {court.state}
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              R$ {court.price_per_hour.toFixed(2)}/hora
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário Início
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário Fim
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Seus Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {startTime && endTime && calculateHours() > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Resumo da Reserva</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Duração:</span>
                    <span className="font-medium">{calculateHours()} hora(s)</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Valor da quadra:</span>
                    <span className="font-medium">R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Taxa de conveniência (5%):</span>
                    <span className="font-medium">R$ {calculateConvenienceFee().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        R$ {(calculateTotal() + calculateConvenienceFee()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDate || !startTime || !endTime}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
