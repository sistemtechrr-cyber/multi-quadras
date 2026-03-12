import { MapPin, DollarSign, Calendar } from 'lucide-react';
import type { Database } from '../../types/database';

type Court = Database['public']['Tables']['courts']['Row'] & {
  court_images: { image_url: string }[];
  amenities: { name: string }[];
};

interface CourtCardProps {
  court: Court;
  onClick: () => void;
}

const sportLabels = {
  futebol_society: 'Futebol Society',
  futevolei: 'Futevôlei',
  beach_tennis: 'Beach Tennis',
  volei: 'Vôlei'
};

export function CourtCard({ court, onClick }: CourtCardProps) {
  const firstImage = court.court_images[0]?.image_url || 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={firstImage}
          alt={court.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {sportLabels[court.sport_type]}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{court.name}</h3>

        <div className="flex items-start space-x-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            {court.neighborhood && `${court.neighborhood}, `}
            {court.city} - {court.state}
          </span>
        </div>

        {court.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {court.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity.name}
              </span>
            ))}
            {court.amenities.length > 3 && (
              <span className="text-xs text-gray-500">+{court.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-1 text-blue-600 font-bold">
            <DollarSign className="w-5 h-5" />
            <span>{court.price_per_hour.toFixed(2)}/hora</span>
          </div>
          <button className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span>Reservar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
