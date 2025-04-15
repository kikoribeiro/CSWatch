import { Shield, Target, Users, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Target className="h-10 w-10 text-orange-500" />,
      title: 'REST API',
    },
    {
      icon: <Users className="h-10 w-10 text-orange-500" />,
      title: 'SOAP API',
    },
    {
      icon: <Shield className="h-10 w-10 text-orange-500" />,
      title: 'GraphQL API',
    },
    {
      icon: <Zap className="h-10 w-10 text-orange-500" />,
      title: 'gRPC API',
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O que torna CS WATCH único?
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            CS Watch contém uma interface intuitiva e fácil de usar, permitindo que todos os
            jogadores tenham informações sobre skins, agentes e muito mais. A nossa plataforma é
            construída com as mais recentes tecnologias, garantindo desempenho e segurança. Além
            disso, oferecemos uma variedade de APIs para atender às suas necessidades específicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors flex flex-col h-full"
            >
              <div className="flex items-center justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-400 text-center flex-grow">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
