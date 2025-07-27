import { Link } from 'react-router-dom'
import { Gift, Heart, ExternalLink } from 'lucide-react'
import { useBuildInfo } from '@/hooks/useBuildInfo'

export function Footer() {
  const { buildInfo, formatDate } = useBuildInfo()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo a popis */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">DárekList</span>
            </div>
            <p className="text-gray-600 mb-4">
              Aplikace pro správu seznamů přání s funkcí sdílení. 
              Vytvářejte seznamy, sdílejte je s přáteli a koordinujte dárky pro každou příležitost.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Vytvořeno s</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>pro radost z darování</span>
            </div>
          </div>

          {/* Navigace */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Navigace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Domů
                </Link>
              </li>
              <li>
                <Link to="/wishlists" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Moje seznamy
                </Link>
              </li>
              <li>
                <Link to="/shared-with-me" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Sdíleno se mnou
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Registrace
                </Link>
              </li>
            </ul>
          </div>

          {/* Informace o verzi */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Informace</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {buildInfo && (
                <>
                  <div>
                    <span className="font-medium">Verze:</span> v{buildInfo.version}
                  </div>
                  <div>
                    <span className="font-medium">Build:</span> {buildInfo.gitHash}
                  </div>
                  <div>
                    <span className="font-medium">Aktualizace:</span>
                    <div className="text-xs">{formatDate(buildInfo.lastCommitDate)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Spodní část */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} DárekList. Všechna práva vyhrazena.
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Vytvořil</span>
              <a 
                href="https://ivanvondracek.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center space-x-1"
              >
                <span>Ivan Vondráček</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}