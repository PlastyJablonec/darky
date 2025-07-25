import { Link } from 'react-router-dom'
import { Gift, Users, Share2, Heart } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="h-10 w-10 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">DárekList</h1>
            </div>
            <div className="space-x-4">
              <Link
                to="/login"
                className="btn-outline"
              >
                Přihlásit se
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Registrovat se
              </Link>
            </div>
          </div>
        </header>

        <main className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Sdílejte své přání
              <br />
              <span className="text-primary-600">jednoduše a elegantně</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vytvářejte seznamy přání, sdílejte je s přáteli a rodinou, 
              a koordinujte dárky pro každou příležitost.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3"
              >
                Začít zdarma
              </Link>
              <Link
                to="/demo"
                className="btn-outline text-lg px-8 py-3"
              >
                Vyzkoušet demo
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vytvářejte seznamy
              </h3>
              <p className="text-gray-600">
                Jednoduše přidávejte dárky, které si přejete. 
                Včetně fotek, cen a odkazů na e-shopy.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sdílejte s ostatními
              </h3>
              <p className="text-gray-600">
                Pošlete odkaz na svůj seznam přáním přátelům a rodině. 
                Oni si mohou rezervovat dárky.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Koordinujte dárky
              </h3>
              <p className="text-gray-600">
                Vyhnete se duplicitním dárkům. Všichni vědí, 
                co už bylo koupeno nebo rezervováno.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Perfektní pro každou příležitost
                </h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Narozeniny a jmeniny
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Vánoce a svátky
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Svatby a výročí
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Baby shower a křtiny
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Promoce a úspěchy
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-8 text-center">
                <Users className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Skupinové dárky
                </h4>
                <p className="text-gray-600">
                  Umožněte více lidem přispět na jeden větší dárek. 
                  Perfektní pro drahé věci.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 DárekList. Vytvořeno s ❤️ pro sdílení radosti.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}