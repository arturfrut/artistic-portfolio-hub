import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()

  const isEN = i18n.language === 'en'

  const toggleLanguage = () => {
    const next = isEN ? 'es' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('language', next)
  }

  const navItems = [
    { label: t('nav.portfolio'), path: '/portfolio' },
    { label: t('nav.exhibitions'), path: '/exhibitions' },
    { label: t('nav.prints'), path: '/prints' },
    { label: t('nav.press'), path: '/press' },
    { label: t('nav.contact'), path: '/contact' }
  ]

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md'>
      <div className='container mx-auto px-6 py-6'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link
            to='/'
            className='font-display text-2xl md:text-3xl font-light tracking-wider hover:text-primary transition-colors duration-300'
          >
            Ignacio Crevecoeur
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-10'>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className='flex items-center gap-1.5 text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors'
            >
              <Languages size={15} />
              {isEN ? 'ES' : 'EN'}
            </button>
          </nav>

          {/* Mobile right side */}
          <div className='flex items-center gap-4 md:hidden'>
            {/* Language toggle mobile */}
            <button
              onClick={toggleLanguage}
              className='text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors'
            >
              {isEN ? 'ES' : 'EN'}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-foreground hover:text-primary transition-colors'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className='md:hidden mt-6 pb-6 border-t border-border pt-6 animate-fade-in'>
            <div className='flex flex-col space-y-4'>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
