import { Link } from 'react-router-dom'
import { Gift, Shield, Share2, Heart, CheckCircle, Users } from 'lucide-react'
import { Layout } from '@/components/Layout'

export function About() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        O DárekListu
                    </h1>
                    <p className="text-xl text-gray-600">
                        Jednoduchý způsob, jak sdílet přání a koordinovat dárky bez zbytečného stresu.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                            <Gift className="h-6 w-6 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Seznamy přání</h3>
                        <p className="text-gray-600">
                            Vytvořte si seznam pro každou příležitost. Vánoce, narozeniny, svatba...
                            Přidejte odkaz, cenu a popis, ať Ježíšek ví, co přesně sháníte.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Share2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Sdílení a rezervace</h3>
                        <p className="text-gray-600">
                            Pošlete odkaz rodině. Oni si dárky zarezervují, takže ostatní vidí,
                            že už je dárek zabraný. Vy (pokud chcete) nic nevidíte a máte překvapení.
                        </p>
                    </div>
                </div>

                {/* Wishlist Types Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Dva typy seznamů
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Gift className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Osobní seznam</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Ideální pro vaše vlastní přání</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Vy <strong>nevidíte</strong> rezervace (překvapení!)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Hosté vidí "Pssst" upozornění</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white/80 backdrop-blur rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Spravovaný seznam</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Pro děti nebo společné dárky</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Vy <strong>vidíte</strong> rezervace a kdo kupuje</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Přehled o tom, co je zajištěno</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* FAQ / How it works */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Jak to funguje?</h2>
                    </div>

                    <div className="relative">
                        <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-0.5 bg-gray-200 hidden md:block"></div>

                        <div className="space-y-12">
                            {[
                                {
                                    title: '1. Vytvořte seznam',
                                    desc: 'Zaregistrujte se a založte nový seznam. Vyberte si, jestli je Osobní nebo Spravovaný.',
                                    icon: <Gift className="h-6 w-6 text-white" />,
                                    color: 'bg-primary-600'
                                },
                                {
                                    title: '2. Přidejte dárky',
                                    desc: 'Vložte odkazy na e-shopy, přidejte fotky a popisy. Můžete nastavit i prioritu.',
                                    icon: <Heart className="h-6 w-6 text-white" />,
                                    color: 'bg-pink-500'
                                },
                                {
                                    title: '3. Sdílejte odkaz',
                                    desc: 'Pošlete unikátní odkaz komukoliv přes WhatsApp, Messenger nebo SMS.',
                                    icon: <Share2 className="h-6 w-6 text-white" />,
                                    color: 'bg-blue-500'
                                },
                                {
                                    title: '4. Rezervace',
                                    desc: 'Ostatní si dárky zarezervují. Vy si užijete Vánoce bez stresu a duplicitních dárků.',
                                    icon: <Users className="h-6 w-6 text-white" />,
                                    color: 'bg-green-500'
                                }
                            ].map((step, index) => (
                                <div key={index} className="relative flex items-center md:justify-center">
                                    <div className="flex flex-col md:flex-row items-center w-full max-w-3xl mx-auto">
                                        <div className="hidden md:block w-1/2 pr-12 text-right">
                                            {index % 2 === 0 && (
                                                <>
                                                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                                    <p className="text-gray-600">{step.desc}</p>
                                                </>
                                            )}
                                        </div>

                                        <div className={`
                      flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-10
                      ${step.color}
                    `}>
                                            {step.icon}
                                        </div>

                                        <div className="w-full md:w-1/2 pl-6 md:pl-12 text-left">
                                            <div className="md:hidden mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                            </div>
                                            {index % 2 !== 0 ? (
                                                <p className="text-gray-600">{step.desc}</p>
                                            ) : (
                                                <p className="text-gray-600 md:hidden">{step.desc}</p>
                                            )}

                                            <div className="hidden md:block">
                                                {index % 2 !== 0 && (
                                                    <div className="md:pl-8">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                                        <p className="text-gray-600">{step.desc}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Link to="/register" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1">
                        Založit seznam zdarma
                    </Link>
                </div>
            </div>
        </Layout>
    )
}
