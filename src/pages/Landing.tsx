import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  BarChart3, 
  FileOutput, 
  CheckCircle,
  ArrowRight,
  Users,
  Globe,
  Target
} from 'lucide-react';
import Button from '../components/UI/Button';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Recherche IA Approfondie',
      description: 'Explorez et analysez des données complexes avec notre moteur de recherche intelligent alimenté par l\'IA.'
    },
    {
      icon: FileText,
      title: 'Génération de Formulaires',
      description: 'Créez automatiquement des formulaires personnalisés et collectez des données structurées.'
    },
    {
      icon: BarChart3,
      title: 'Analyse de Données',
      description: 'Transformez vos données brutes en insights exploitables avec des visualisations interactives.'
    },
    {
      icon: FileOutput,
      title: 'Rapports Automatisés',
      description: 'Générez des rapports professionnels complets avec mise en forme automatique.'
    }
  ];

  const benefits = [
    'Gestion centralisée de toutes vos missions stratégiques',
    'Interface intuitive et responsive pour tous les appareils',
    'Intégration complète avec les outils d\'analyse modernes',
    'Sécurité et confidentialité des données garanties',
    'Support technique et formation inclus'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-black">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AC</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Afrique Conseil
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Se connecter
            </Link>
            <Link to="/signup">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Révolutionnez vos
              <span className="text-orange-500 block">missions stratégiques</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Plateforme intelligente de gestion de missions avec recherche IA, 
              génération de formulaires, analyse de données et création de rapports automatisés.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Voir la démo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Avancées
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez comment notre plateforme transforme votre approche des missions stratégiques
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Pourquoi choisir Afrique Conseil ?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Notre plateforme combine l'expertise africaine avec les technologies les plus avancées 
                pour vous offrir une solution complète et adaptée à vos besoins.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Clients satisfaits</div>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">25+</div>
                <div className="text-gray-600 dark:text-gray-300">Pays couverts</div>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">98%</div>
                <div className="text-gray-600 dark:text-gray-300">Taux de réussite</div>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <FileOutput className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1000+</div>
                <div className="text-gray-600 dark:text-gray-300">Rapports générés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à transformer vos missions ?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Rejoignez des centaines d'organisations qui font confiance à Afrique Conseil 
            pour leurs missions stratégiques.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full sm:w-auto bg-white text-orange-500 hover:bg-gray-100"
              >
                Créer un compte gratuit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-orange-500"
            >
              Contacter l'équipe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-xl font-bold">Afrique Conseil</span>
          </div>
          <p className="text-gray-400 mb-6">
            Révolutionnons ensemble l'avenir des missions stratégiques en Afrique
          </p>
          <div className="text-sm text-gray-500">
            © 2024 Afrique Conseil. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
