import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Court = Database['public']['Tables']['courts']['Row'];

interface CourtFormProps {
  court?: Court | null;
  onClose: () => void;
  onSuccess: () => void;
}

const amenitiesList = [
  'Churrasqueira',
  'Estacionamento',
  'Vestiários',
  'Chuveiros',
  'Bar/Lanchonete',
  'Wi-Fi',
  'Iluminação',
  'Bolas',
  'Redes',
  'Cadeiras/Arquibancadas'
];

export function CourtForm({ court, onClose, onSuccess }: CourtFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [profileVerified, setProfileVerified] = useState(false);
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

  useEffect(() => {
    if (court) {
      loadCourtData();
    }
  }, [court]);

  // Função para garantir que o perfil existe
  const ensureProfileExists = async () => {
    if (!profile) {
      console.log('❌ Profile não encontrado no ensureProfileExists');
      setInitializing(false);
      return false;
    }

    try {
      console.log('🔍 Verificando perfil:', profile.id);
      console.log('Profile completo:', profile);

      // ESTRATÉGIA 1: Tentar buscar o profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profilesS')
        .select('*')
        .eq('id', profile.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar profile:', fetchError);
      }

      console.log('Profile existente:', existingProfile);

      // Se não encontrou, tentar criar
      if (!existingProfile) {
        console.log('📝 Profile não encontrado, criando novo...');

        // Preparar dados do profile
        const profileData = {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.user_metadata?.full_name || profile.email?.split('@')[0] || 'Proprietário',
          phone: profile.user_metadata?.phone || '',
          user_type: 'owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Dados a serem inseridos:', profileData);

        const { data: insertData, error: insertError } = await supabase
          .from('profilesS')
          .insert(profileData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao inserir profile:', insertError);
          return false;
        }

        console.log('✅ Profile criado com sucesso:', insertData);
      } else {
        console.log('✅ Profile já existe:', existingProfile);
      }

      setProfileVerified(true);
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return false;
    } finally {
      setInitializing(false);
    }
  };

  // Verificar perfil ao carregar
  useEffect(() => {
    const verifyProfile = async () => {
      console.log('Verificando profile...');
      console.log('Profile do contexto:', profile);
      
      if (profile) {
        await ensureProfileExists();
      } else {
        console.log('Profile não disponível ainda');
        setInitializing(false);
      }
    };

    verifyProfile();
  }, [profile]);

  const loadCourtData = async () => {
    if (!court) return;

    try {
      console.log('Carregando dados da quadra:', court.id);
      
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
      console.error('Error loading court data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INICIANDO SUBMIT ===');
    console.log('Profile:', profile);
    
    if (!profile) {
      alert('Usuário não autenticado');
      return;
    }

    if (!profile.id) {
      alert('ID do usuário não encontrado');
      return;
    }

    setLoading(true);
    console.log('Loading set to true');

    try {
      console.log('🚀 Iniciando salvamento da quadra...');
      console.log('Profile ID:', profile.id);
      console.log('Form Data:', formData);
      console.log('Selected Amenities:', selectedAmenities);
      console.log('Image URLs:', imageUrls);

      // Verificar se o profile existe
      const { data: profileCheck, error: checkError } = await supabase
        .from('profilesS')
        .select('id')
        .eq('id', profile.id)
        .maybeSingle();

      console.log('Profile check:', { profileCheck, checkError });

      if (checkError || !profileCheck) {
        console.error('Profile não encontrado:', checkError);
        alert('Perfil não encontrado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }

      if (court) {
        // Editar quadra existente
        console.log('Editando quadra existente:', court.id);
        
        const { error: updateError } = await supabase
          .from('courts')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', court.id);

        if (updateError) {
          console.error('Erro ao atualizar quadra:', updateError);
          throw updateError;
        }

        console.log('Quadra atualizada, atualizando amenities...');
        
        // Atualizar amenities
        await supabase.from('amenities').delete().eq('court_id', court.id);
        
        if (selectedAmenities.length > 0) {
          const { error: amenitiesError } = await supabase
            .from('amenities')
            .insert(selectedAmenities.map(name => ({ court_id: court.id, name })));

          if (amenitiesError) throw amenitiesError;
        }

        console.log('Amenities atualizadas, atualizando imagens...');
        
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
        // Criar nova quadra
        console.log('Criando nova quadra com owner_id:', profile.id);
        
        const courtData = {
          ...formData,
          owner_id: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Dados da nova quadra:', courtData);

        const { data: newCourt, error: insertError } = await supabase
          .from('courts')
          .insert(courtData)
          .select()
          .single();

        if (insertError) {
          console.error('Erro detalhado ao inserir quadra:', insertError);
          alert('Erro ao criar quadra: ' + insertError.message);
          setLoading(false);
          return;
        }

        console.log('✅ Quadra criada com sucesso:', newCourt);

        // Inserir amenities
        if (newCourt && selectedAmenities.length > 0) {
          console.log('Inserindo amenities...');
          
          const { error: amenitiesError } = await supabase
            .from('amenities')
            .insert(selectedAmenities.map(name => ({ court_id: newCourt.id, name })));

          if (amenitiesError) {
            console.error('Erro ao inserir amenities:', amenitiesError);
            throw amenitiesError;
          }
        }

        // Inserir imagens
        const validImageUrls = imageUrls.filter(url => url.trim() !== '');
        if (newCourt && validImageUrls.length > 0) {
          console.log('Inserindo imagens...');
          
          const { error: imagesError } = await supabase
            .from('court_images')
            .insert(validImageUrls.map((url, idx) => ({
              court_id: newCourt.id,
              image_url: url,
              order: idx
            })));

          if (imagesError) {
            console.error('Erro ao inserir imagens:', imagesError);
            throw imagesError;
          }
        }
      }

      console.log('✅ Quadra salva com sucesso!');
      alert('Quadra salva com sucesso!');
      onSuccess();
      
    } catch (error: any) {
      console.error('❌ Error saving court:', error);
      alert('Erro ao salvar quadra: ' + error.message);
    } finally {
      console.log('Finalizando submit, loading set to false');
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

  // Tela de inicialização
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  // Se não conseguiu verificar o perfil
  if (!profileVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Erro de Perfil</h3>
          <p className="text-gray-600 mb-6">
            Não foi possível verificar ou criar seu perfil de proprietário.
            Por favor, tente novamente ou contate o suporte.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar se o profile existe
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 mb-4">Usuário não autenticado</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
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
            {/* Restante do formulário permanece igual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Quadra
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidade Esportiva
                </label>
                <select
                  value={formData.sport_type}
                  onChange={(e) => setFormData({ ...formData, sport_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="futebol_society">Futebol Society</option>
                  <option value="futevolei">Futevôlei</option>
                  <option value="beach_tennis">Beach Tennis</option>
                  <option value="volei">Vôlei</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço por Hora (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva os detalhes da quadra (tipo de piso, iluminação, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone de Contato
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comodidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URLs das Imagens
                </label>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Adicionar mais uma imagem
                  </button>
                </div>
              </div>
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