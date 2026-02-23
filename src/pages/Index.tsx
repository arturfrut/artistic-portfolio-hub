import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ArrowRight } from 'lucide-react'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { GalleryItem } from '@/components/gallery/GalleryGrid'

interface CarouselSlide {
  id: string
  imageUrl: string
  caption?: string
}

const Index = () => {
  const { data: portfolioItems } = usePortfolioData<GalleryItem>(
    'obras.json',
    'obras'
  )
  const { data: carouselItems } = usePortfolioData<CarouselSlide>(
    'carrusel.json',
    'carrusel'
  )

  const featuredWorks = portfolioItems.slice(0, 4)

  return (
    <Layout>
      {/* Hero Section */}
      <section className='min-h-[80vh] flex items-center justify-center relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]' />
          <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px]' />
        </div>
        <div className='container mx-auto px-6 text-center relative z-10'>
          <h1 className='font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-wider mb-6 opacity-0 animate-fade-in-up'>
            Ignacio
            <br />
            <span className='text-gradient'>Crevecoeur</span>
          </h1>
          <p className='text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in-up stagger-2'>
            Artista visual explorando los límites entre abstracción y emoción
          </p>
          <Link
            to='/portfolio'
            className='inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300 opacity-0 animate-fade-in-up stagger-3'
          >
            Ver Portfolio
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Bio + Carousel Section */}
      <section className='py-24 bg-card'>
        <div className='container mx-auto px-6'>
          <Carousel
            opts={{ align: 'start', loop: true }}
            className='w-full'
          >
            <CarouselContent>
              {/* Slide de texto — siempre primero */}
              <CarouselItem>
                <div className='flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] px-4 md:px-16 text-center'>
                  <p className='font-display text-2xl md:text-3xl font-light leading-relaxed'>
                    Artista plástico argentino, marplatense y docente orientado al
                    realismo contemporáneo, con una obra de fuerte carga simbólica,
                    psicológica y social. Su producción se sustenta en el dominio de
                    técnicas clásicas de la pintura al óleo, aplicadas a una mirada
                    narrativa y actual. Cuenta con una trayectoria sostenida en
                    exposiciones, salones y concursos nacionales, con premios y
                    reconocimientos obtenidos.
                  </p>
                  <Link
                    to='/contact'
                    className='inline-flex items-center gap-2 mt-12 text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors'
                  >
                    Contacto
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </CarouselItem>

              {/* Slides de imágenes desde carrusel.json */}
              {carouselItems.slice(0, 4).map((slide) => (
                <CarouselItem key={slide.id}>
                  <div className='relative min-h-[400px] md:min-h-[500px] overflow-hidden'>
                    <img
                      src={slide.imageUrl}
                      alt={slide.caption || ''}
                      className='w-full h-full object-cover absolute inset-0'
                      loading='lazy'
                    />
                    {slide.caption && (
                      <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent'>
                        <p className='text-white font-display text-lg'>{slide.caption}</p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className='left-4' />
            <CarouselNext className='right-4' />
          </Carousel>
        </div>
      </section>

      {/* Featured Works */}
      <section className='py-24'>
        <div className='container mx-auto px-6'>
          <div className='flex items-end justify-between mb-12'>
            <h2 className='section-title mb-0'>Obras Destacadas</h2>
            <Link
              to='/portfolio'
              className='nav-link hidden md:flex items-center gap-2'
            >
              Ver todo
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {featuredWorks.map((work, index) => (
              <Link
                key={work.id}
                to='/portfolio'
                className='gallery-item aspect-[4/3] opacity-0 animate-fade-in-up group'
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <img src={work.imageUrl} alt={work.title} loading='lazy' />
                <div className='absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500'>
                  <h3 className='font-display text-2xl'>{work.title}</h3>
                  <p className='text-muted-foreground mt-1'>{work.year}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className='mt-8 text-center md:hidden'>
            <Link
              to='/portfolio'
              className='nav-link inline-flex items-center gap-2'
            >
              Ver todo
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Index