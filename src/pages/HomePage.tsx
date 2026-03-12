import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { CourtCard } from '../components/courts/CourtCard';
import { CourtDetail } from '../components/courts/CourtDetail';

type Court = Database['public']['Tables']['courts']['Row'];

interface CourtWithImages extends Court {
  court_images: { image_url: string }[];
  amenities: { name: string }[];
}

export function HomePage() {
  const [courts, setCourts] = useState<CourtWithImages[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<CourtWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select(`
          *,
          court_images (image_url),
          amenities (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !sportFilter || court.sport_type === sportFilter;
    const matchesCity = !cityFilter || court.city?.toLowerCase().includes(cityFilter.toLowerCase());

    return matchesSearch && matchesSport && matchesCity;
  });

  const sportTypes = {
    futebol_society: 'Futebol Society',
    futevolei: 'Futevôlei',
    beach_tennis: 'Beach Tennis',
    volei: 'Vôlei'
  };

  if (selectedCourt) {
    return <CourtDetail court={selectedCourt} onBack={() => setSelectedCourt(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Encontre a Quadra Perfeita</h1>
          <p className="text-xl text-blue-100 mb-8">Reserve sua quadra esportiva de forma rápida e fácil</p>

          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Todas as modalidades</option>
                  <option value="futebol_society">Futebol Society</option>
                  <option value="futevolei">Futevôlei</option>
                  <option value="beach_tennis">Beach Tennis</option>
                  <option value="volei">Vôlei</option>
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cidade..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando quadras...</p>
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhuma quadra encontrada</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredCourts.length} {filteredCourts.length === 1 ? 'Quadra encontrada' : 'Quadras encontradas'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  onClick={() => setSelectedCourt(court)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
