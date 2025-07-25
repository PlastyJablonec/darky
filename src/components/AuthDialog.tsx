import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog } from './Dialog'
import { Gift, Star } from 'lucide-react'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  action: string // "rezervovat dárek", "zobrazit cenu", atd.
}

export function AuthDialog({ isOpen, onClose, action }: AuthDialogProps) {
  const [showBenefits, setShowBenefits] = useState(false)
  const location = useLocation()

  // Zachovat současnou URL pro návrat po přihlášení
  const currentPath = location.pathname + location.search
  const loginUrl = `/login?returnTo=${encodeURIComponent(currentPath)}`
  const registerUrl = `/register?returnTo=${encodeURIComponent(currentPath)}`

  const benefits = [
    '🎁 Rezervovat dárky pro přátele',
    '💰 Zobrazit přesné ceny a odkazy',
    '📋 Vytvořit vlastní seznamy přání',
    '🔗 Sdílet seznamy s rodinou',
    '⚡ Real-time aktualizace',
    '🎯 Prioritní dárky a kategorie'
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Pro ${action} se musíte přihlásit`}
      type="info"
      actions={
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Zrušit
          </button>
          <div className="flex space-x-2">
            <Link
              to={loginUrl}
              className="btn-outline"
              onClick={onClose}
            >
              Přihlásit se
            </Link>
            <Link
              to={registerUrl}
              className="btn-primary"
              onClick={onClose}
            >
              Registrovat se
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Gift className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Odemkněte všechny funkce!</h3>
            <p className="text-sm text-gray-600">
              Registrace je rychlá a zdarma
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowBenefits(!showBenefits)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center mx-auto"
          >
            <Star className="h-4 w-4 mr-1" />
            {showBenefits ? 'Skrýt výhody' : 'Zobrazit všechny výhody'}
          </button>
        </div>

        {showBenefits && (
          <div className="grid grid-cols-1 gap-2 mt-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded">
          ⚡ Registrace trvá jen 30 sekund
        </div>
      </div>
    </Dialog>
  )
}