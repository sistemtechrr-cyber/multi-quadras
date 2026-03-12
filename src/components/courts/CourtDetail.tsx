import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, DollarSign, Calendar, Clock } from 'lucide-react';
import type { Database } from '../../types/database';
import { BookingForm } from '../bookings/BookingForm';

type Court = Database['public']['Tables']['courts']['Row'] & {
  court_images: { image_url: string }[];
  amenities: { name: string }[];
};

interface CourtDetailProps {
  court: Court;
  onBack: () => void;
}

const sportLabels = {
  futebol_society: 'Futebol Society',
  futevolei: 'Futevôlei',
  beach_tennis: 'Beach Tennis',
  volei: 'Vôlei'
};

export function CourtDetail({ court, onBack }: CourtDetailProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = court.court_images.length > 0
    ? court.court_images.map(img => img.image_url)
    : ['https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'];

  if (showBookingForm) {
    return (
      <BookingForm
        court={court}
        onBack={() => setShowBookingForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para busca</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {sportLabels[court.sport_type]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      R$ {court.price_per_hour.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">por hora</div>
                  </div>
                </div>

                {court.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Descrição</h2>
                    <p className="text-gray-700 leading-relaxed">{court.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Endereço</div>
                      <div className="text-gray-600 text-sm">
                        {court.street}, {court.number}
                        <br />
                        {court.neighborhood}
                        <br />
                        {court.city} - {court.state}
                        <br />
                        CEP: {court.zip_code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Contato</div>
                      <div className="text-gray-600 text-sm">{court.contact_phone}</div>
                    </div>
                  </div>
                </div>

                {court.amenities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Comodidades</h2>
                    <div className="flex flex-wrap gap-2">
                      {court.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {amenity.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Faça sua reserva</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Escolha data e horário</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>Pagamento facilitado</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Confirmação imediata</span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Reservar Agora
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Taxa de conveniência pode ser aplicada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
