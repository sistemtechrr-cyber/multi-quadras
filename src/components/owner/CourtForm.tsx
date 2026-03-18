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
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
      console.log('=== BUSCANDO USUÁRIO ATUAL ===');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        console.log('Usuário encontrado:', {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        });
      } else {
        console.error('NENHUM USUÁRIO LOGADO!');
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
      console.log('Carregando dados da quadra existente:', court.id);
      
      const { data: amenities, error: amenitiesError } = await supabase
        .from('amenities')
        .select('name')
        .eq('court_id', court.id);

      if (amenitiesError) {
        console.error('Erro ao carregar amenities:', amenitiesError);
      } else {
        console.log('Amenities carregadas:', amenities);
        if (amenities) {
          setSelectedAmenities(amenities.map(a => a.name));
        }
      }

      const { data: images, error: imagesError } = await supabase
        .from('court_images')
        .select('image_url')
        .eq('court_id', court.id)
        .order('order');

      if (imagesError) {
        console.error('Erro ao carregar imagens:', imagesError);
      } else {
        console.log('Imagens carregadas:', images);
        if (images && images.length > 0) {
          setImageUrls(images.map(i => i.image_url));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da quadra:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INICIANDO SUBMIT ===');
    console.log('Dados do formulário:', formData);
    console.log('Amenities selecionadas:', selectedAmenities);
    console.log('URLs das imagens:', imageUrls);
    
    if (!userId) {
      console.error('ERRO: userId não encontrado');
      alert('Usuário não está logado. Faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      // PASSO 1: Verificar se o usuário tem perfil
      console.log('PASSO 1 - Verificando perfil do usuário:', userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profilesS')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Resultado da busca de perfil:', { profile, profileError });

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Se não tiver perfil, criar
      if (!profile) {
        console.log('PASSO 2 - Perfil não encontrado, criando novo perfil...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profilesS')
          .insert({
            id: userId,
            email: userEmail || '',
            full_name: 'Proprietário',
            user_type: 'owner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        console.log('Resultado da criação de perfil:', { newProfile, createError });

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          throw new Error('Erro ao criar perfil do proprietário');
        }
      }

      // PASSO 3: Verificar/Criar a quadra
      if (court) {
        // EDITAR quadra existente
        console.log('PASSO 3 - Editando quadra existente:', court.id);
        
        const updateData = {
          ...formData,
          updated_at: new Date().toISOString()
        };
        
        console.log('Dados para atualização:', updateData);

        const { data: updatedCourt, error: updateError } = await supabase
          .from('courts')
          .update(updateData)
          .eq('id', court.id)
          .select();

        console.log('Resultado da atualização:', { updatedCourt, updateError });

        if (updateError) throw updateError;

        // Atualizar amenities
        console.log('PASSO 4 - Atualizando amenities');
        await supabase.from('amenities').delete().eq('court_id', court.id);
        
        if (selectedAmenities.length > 0) {
          const amenitiesData = selectedAmenities.map(name => ({ court_id: court.id, name }));
          console.log('Inserindo amenities:', amenitiesData);
          
          const { data: amenitiesResult, error: amenitiesError } = await supabase
            .from('amenities')
            .insert(amenitiesData);

          console.log('Resultado da inserção de amenities:', { amenitiesResult, amenitiesError });
          if (amenitiesError) throw amenitiesError;
        }

        // Atualizar imagens
        console.log('PASSO 5 - Atualizando imagens');
        await supabase.from('court_images').delete().eq('court_id', court.id);
        
        const validImageUrls = imageUrls.filter(url => url.trim() !== '');
        if (validImageUrls.length > 0) {
          const imagesData = validImageUrls.map((url, idx) => ({
            court_id: court.id,
            image_url: url,
            order: idx
          }));
          
          console.log('Inserindo imagens:', imagesData);
          
          const { data: imagesResult, error: imagesError } = await supabase
            .from('court_images')
            .insert(imagesData);

          console.log('Resultado da inserção de imagens:', { imagesResult, imagesError });
          if (imagesError) throw imagesError;
        }
      } else {
        // CRIAR nova quadra
        console.log('PASSO 3 - Criando nova quadra');
        
        const courtData = {
          ...formData,
          owner_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Dados da nova quadra:', courtData);

        const { data: newCourt, error: insertError } = await supabase
          .from('courts')
          .insert(courtData)
          .select()
          .single();

        console.log('Resultado da inserção da quadra:', { newCourt, insertError });

        if (insertError) {
          console.error('Erro detalhado ao inserir quadra:', insertError);
          throw insertError;
        }

        console.log('✅ QUADRA CRIADA COM SUCESSO! ID:', newCourt.id);

        // Inserir amenities
        if (selectedAmenities.length > 0) {
          console.log('PASSO 4 - Inserindo amenities');
          const amenitiesData = selectedAmenities.map(name => ({ court_id: newCourt.id, name }));
          
          console.log('Dados das amenities:', amenitiesData);
          
          const { data: amenitiesResult, error: amenitiesError } = await supabase
            .from('amenities')
            .insert(amenitiesData);

          console.log('Resultado da inserção de amenities:', { amenitiesResult, amenitiesError });
          if (amenitiesError) throw amenitiesError;
        }

        // Inserir imagens
        const validImageUrls = imageUrls.filter(url => url.trim() !== '');
        if (validImageUrls.length > 0) {
          console.log('PASSO 5 - Inserindo imagens');
          const imagesData = validImageUrls.map((url, idx) => ({
            court_id: newCourt.id,
            image_url: url,
            order: idx
          }));
          
          console.log('Dados das imagens:', imagesData);
          
          const { data: imagesResult, error: imagesError } = await supabase
            .from('court_images')
            .insert(imagesData);

          console.log('Resultado da inserção de imagens:', { imagesResult, imagesError });
          if (imagesError) throw imagesError;
        }
      }

      console.log('✅ TODAS AS OPERAÇÕES CONCLUÍDAS COM SUCESSO!');
      
      // Verificar se a quadra foi realmente salva
      const { data: verifyCourt, error: verifyError } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('VERIFICAÇÃO FINAL - Última quadra do usuário:', { verifyCourt, verifyError });

      alert('Quadra salva com sucesso!');
      onSuccess();
      
    } catch (error: any) {
      console.error('❌ ERRO NO PROCESSO:', error);
      alert('Erro ao salvar quadra: ' + error.message);
    } finally {
      setLoading(false);
      console.log('=== FIM DO SUBMIT ===');
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