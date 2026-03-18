import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Court = Database['public']['Tables']['courts']['Row'];

interface CourtFormProps {
  court?: Court | null;
  onClose: () => void;
  onSuccess: () => void;
}

const amenitiesList = [
  'Churrasqueira', 'Estacionamento', 'Vestiários', 'Chuveiros',
  'Bar/Lanchonete', 'Wi-Fi', 'Iluminação', 'Bolas', 'Redes',
  'Cadeiras/Arquibancadas'
];

export function CourtForm({ court, onClose, onSuccess }: CourtFormProps) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: court?.name || '',
    sport_type: court?.sport_type || 'futebol_society',
    description: court?.description || '',
    street: court?.street || '',
    number: court?.number || '',
    neighborhood: court?.neighborhood || '',
    city: court?.city || '',
    state: court?.state || '',
    zip_code: court?.zip_code || '',
    contact_phone: court?.contact_phone || '',
    price_per_hour: court?.price_per_hour || 0,
    status: court?.status || 'active',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // Buscar o usuário atual quando o componente montar
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        console.log('Usuário atual:', session.user.email);
      } else {
        console.error('Nenhum usuário logado');
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (court) {
      loadCourtData();
    }
  }, [court]);

  const loadCourtData = async () => {
    if (!court) return;

    try {
      const { data: amenities } = await supabase
        .from('amenities')
        .select('name')
        .eq('court_id', court.id);

      if (amenities) {
        setSelectedAmenities(amenities.map(a => a.name));
      }

      const { data: images } = await supabase
        .from('court_images')
        .select('image_url')
        .eq('court_id', court.id)
        .order('order');

      if (images && images.length > 0) {
        setImageUrls(images.map(i => i.image_url));
      }
    } catch (error) {
      console.error('Erro ao carregar dados da quadra:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Usuário não está logado. Faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      console.log('Salvando quadra para o usuário:', userId);

      if (court) {
        // EDITAR quadra existente
        const { error: updateError } = await supabase
          .from('courts')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', court.id);

        if (updateError) throw updateError;

        // Atualizar amenities
        await supabase.from('amenities').delete().eq('court_id', court.id);
        
        if (selectedAmenities.length > 0) {
          const { error: amenitiesError } = await supabase
            .from('amenities')
            .insert(selectedAmenities.map(name => ({ court_id: court.id, name })));

          if (amenitiesError) throw amenitiesError;
        }

        // Atualizar imagens
        await supabase.from('court_images').delete().eq('court_id', court.id);
        
        const validImageUrls = imageUrls.filter(url => url.trim() !== '');
        if (validImageUrls.length > 0) {
          const { error: imagesError } = await supabase
            .from('court_images')
            .insert(validImageUrls.map((url, idx) => ({
              court_id: court.id,
              image_url: url,
              order: idx
            })));

          if (imagesError) throw imagesError;
        }
      } else {
        // CRIAR nova quadra
        const { data: newCourt, error: insertError } = await supabase
          .from('courts')
          .insert({
            ...formData,
            owner_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao inserir:', insertError);
          
          // Se for erro de foreign key, verificar se o perfil existe
          if (insertError.message.includes('foreign key')) {
            // Verificar se o usuário tem perfil
            const { data: profile } = await supabase
              .from('profilesS')
              .select('id')
              .eq('id', userId)
              .maybeSingle();
            
            if (!profile) {
              // Criar o perfil automaticamente
              const { data: user } = await supabase.auth.getUser();
              
              await supabase
                .from('profilesS')
                .insert({
                  id: userId,
                  email: user.user?.email,
                  full_name: user.user?.user_metadata?.full_name || user.user?.email?.split('@')[0],
                  user_type: 'owner',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              // Tentar inserir novamente
              const { data: retryCourt, error: retryError } = await supabase
                .from('courts')
                .insert({
                  ...formData,
                  owner_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (retryError) throw retryError;
              
              // Inserir amenities e imagens para a nova quadra
              if (selectedAmenities.length > 0) {
                await supabase
                  .from('amenities')
                  .insert(selectedAmenities.map(name => ({ court_id: retryCourt.id, name })));
              }

              const validImageUrls = imageUrls.filter(url => url.trim() !== '');
              if (validImageUrls.length > 0) {
                await supabase
                  .from('court_images')
                  .insert(validImageUrls.map((url, idx) => ({
                    court_id: retryCourt.id,
                    image_url: url,
                    order: idx
                  })));
              }
            }
          } else {
            throw insertError;
          }
        } else {
          // Inserir amenities e imagens para a nova quadra
          if (selectedAmenities.length > 0) {
            await supabase
              .from('amenities')
              .insert(selectedAmenities.map(name => ({ court_id: newCourt.id, name })));
          }

          const validImageUrls = imageUrls.filter(url => url.trim() !== '');
          if (validImageUrls.length > 0) {
            await supabase
              .from('court_images')
              .insert(validImageUrls.map((url, idx) => ({
                court_id: newCourt.id,
                image_url: url,
                order: idx
              })));
          }
        }
      }

      alert('Quadra salva com sucesso!');
      onSuccess();
      
    } catch (error: any) {
      console.error('Erro:', error);
      alert('Erro ao salvar quadra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {court ? 'Editar Quadra' : 'Nova Quadra'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restante do formulário permanece igual ao seu código original */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ... todos os campos do formulário (copie do seu código original) ... */}
            </div>

            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Quadra'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}