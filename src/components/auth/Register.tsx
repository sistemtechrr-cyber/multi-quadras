import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

interface RegisterProps {
  onToggle: () => void;
}

export function Register({ onToggle }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'customer' | 'owner'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. Primeiro, criar o usuário na autenticação
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('Usuário criado com ID:', authData.user.id);

      // 2. Depois, criar o perfil manualmente na tabela profilesS
      const { error: profileError } = await supabase
        .from('"profilesS"')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          user_type: userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erro detalhado ao criar perfil:', profileError);
        
        // Se falhou ao criar o perfil, vamos tentar novamente com mais dados
        const { error: retryError } = await supabase
          .from('"profilesS"')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            phone: '',
            user_type: userType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (retryError) {
          console.error('Erro na segunda tentativa:', retryError);
          throw new Error('Erro ao criar perfil do usuário: ' + retryError.message);
        }
      }

      console.log('Perfil criado com sucesso!');
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Erro completo:', err);
      
      // Tratamento de erros mais específico
      if (err.message?.includes('Database error')) {
        setError('Erro ao salvar dados do usuário. Por favor, tente novamente.');
      } else if (err.message?.includes('duplicate key')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(err.message || 'Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Conta criada com sucesso!</h2>
          <p className="text-gray-600 mb-6">Você já pode fazer login</p>
          <button
            onClick={onToggle}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <UserPlus className="w-10 h-10 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Criar Conta</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Conta
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                userType === 'customer'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Cliente</div>
              <div className="text-xs mt-1">Buscar e reservar quadras</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('owner')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                userType === 'owner'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Proprietário</div>
              <div className="text-xs mt-1">Cadastrar quadras</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <button
          onClick={onToggle}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Fazer login
        </button>
      </p>
    </div>
  );
}