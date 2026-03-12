import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Home, LayoutDashboard, Calendar } from 'lucide-react';

export function Header() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Reserva Fácil Quadras</h1>
          </div>

          <nav className="flex items-center space-x-4">
            {user && profile ? (
              <>
                <a
                  href="#home"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Início</span>
                </a>
                {profile.user_type === 'owner' && (
                  <a
                    href="#dashboard"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Meu Painel</span>
                  </a>
                )}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{profile.full_name || 'Usuário'}</div>
                    <div className="text-gray-500 text-xs">
                      {profile.user_type === 'owner' ? 'Proprietário' : 'Cliente'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
