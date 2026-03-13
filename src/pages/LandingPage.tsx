import { useState } from 'react';
import { CheckCircle, MapPin, Calendar, Users, Zap, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  window.addEventListener('scroll', () => {
    setScrolled(window.scrollY > 50);
  });

  return (
    <div className="min-h-screen bg-white">
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Reserva Fácil</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onLoginClick}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  scrolled
                    ? 'text-gray-700 hover:text-blue-600'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={onRegisterClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cadastre-se
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-20 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Reserve sua Quadra Esportiva de Forma Fácil
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Encontre as melhores quadras de futebol society, futevôlei, beach tennis e vôlei. Agende em poucos cliques e comece a jogar!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onRegisterClick}
                  className="flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-bold text-lg"
                >
                  <span>Saiba Mais</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Futebol Society"
                className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />
              <img
                src="https://images.pexels.com/photos/3961998/pexels-photo-3961998.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Vôlei"
                className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />
              <img
                src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Beach Tennis"
                className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />
              <img
                src="https://images.pexels.com/photos/3621812/pexels-photo-3621812.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Futevôlei"
                className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Reserva Fácil?
            </h2>
            <p className="text-xl text-gray-600">
              Oferecemos a melhor experiência para reservar quadras esportivas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Localização</h3>
              <p className="text-gray-600">
                Encontre quadras próximas a você com filtros por cidade e bairro. Visualize a localização exata no mapa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Agendamento Rápido</h3>
              <p className="text-gray-600">
                Reserve em poucos cliques. Escolha data, horário e receba confirmação instantânea por e-mail.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Muitas Opções</h3>
              <p className="text-gray-600">
                Escolha entre diferentes modalidades: futebol society, futevôlei, beach tennis e vôlei.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pagamento Facilitado</h3>
              <p className="text-gray-600">
                Veja o preço total com antecedência. Pague de forma segura e receba confirmação instantânea.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Segurança</h3>
              <p className="text-gray-600">
                Seus dados estão protegidos com os mais altos padrões de segurança e criptografia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão Completa</h3>
              <p className="text-gray-600">
                Proprietários têm controle total sobre suas quadras e reservas. Gerenciar tudo é simples.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Três passos simples para reservar sua quadra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Busque</h3>
              <p className="text-gray-600">
                Procure por quadras usando nossos filtros de localização, modalidade e preço.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reserve</h3>
              <p className="text-gray-600">
                Escolha a data, horário e forneça seus dados para garantir a reserva.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jogue</h3>
              <p className="text-gray-600">
                Comparecça no horário agendado e divirta-se com seus amigos!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Para Proprietários
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Monetize suas quadras e aumente seu faturamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Gerenciar Quadras</h4>
                  <p className="text-gray-600">Cadastre várias quadras com imagens, preços e horários personalizados</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Aumentar Visibilidade</h4>
                  <p className="text-gray-600">Destaque sua quadra para atingir mais clientes e aumentar receita</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Controlar Reservas</h4>
                  <p className="text-gray-600">Visualize todas as reservas, confirme ou cancele com facilidade</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Planos Flexíveis</h4>
                  <p className="text-gray-600">Escolha entre planos básico, premium ou profissional</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nossos Planos</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-gray-900">Básico</h4>
                  <p className="text-gray-600 text-sm mb-2">Perfeito para começar</p>
                  <p className="text-2xl font-bold text-blue-600">Grátis</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-blue-600">
                  <h4 className="font-bold text-lg text-gray-900">Premium</h4>
                  <p className="text-gray-600 text-sm mb-2">Com destaque em busca</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 99,90<span className="text-sm text-gray-600">/mês</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-gray-900">Profissional</h4>
                  <p className="text-gray-600 text-sm mb-2">Para múltiplas quadras</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 199,90<span className="text-sm text-gray-600">/mês</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de proprietários e clientes que já usam a Reserva Fácil
          </p>
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-4 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg"
          >
            <span>Cadastre-se Gratuitamente</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Q</span>
                </div>
                <span className="font-bold text-white">Reserva Fácil</span>
              </div>
              <p className="text-sm">Sua plataforma de reserva de quadras esportivas</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Sobre</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Para Clientes</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Buscar Quadras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Para Proprietários</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Cadastrar Quadra</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nossos Planos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Suporte</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Reserva Fácil Quadras. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
