import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Restez informé de nos actualités
          </h2>
          <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg">
            Recevez les dernières informations sur nos formations, événements et opportunités directement dans votre boîte mail. 
            Rejoignez notre communauté de plus de 1000 étudiants !
          </p>
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg"
              />
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                S'abonner
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              Nous respectons votre vie privée. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
