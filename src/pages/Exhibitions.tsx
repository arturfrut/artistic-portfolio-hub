import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { Exhibition } from '@/data/portfolio'
import { GalleryModal } from '@/components/gallery/GalleryModal'
import { useTranslation } from 'react-i18next'

const Exhibitions = () => {
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  const { data: exhibitions, loading } = usePortfolioData<Exhibition>(
    'exposiciones.json',
    'exposiciones'
  )
  const { t, i18n } = useTranslation()
  const isEN = i18n.language === 'en'

  const soloExhibitions = exhibitions

  if (loading)
    return (
      <Layout>
        <div className='py-12 text-center'>...</div>
      </Layout>
    )

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-6'>
          <h1 className='section-title opacity-0 animate-fade-in-up'>
            {t('exhibitions.title')}
          </h1>

          <div className='mb-20'>
            <h2 className='font-display text-2xl mb-8 text-primary opacity-0 animate-fade-in-up stagger-1'>
              {t('exhibitions.solo')}
            </h2>
            <div className='space-y-12'>
              {soloExhibitions.map((exhibition, index) => {
                const description = isEN && exhibition.description_en
                  ? exhibition.description_en
                  : exhibition.description

                return (
                  <div
                    key={exhibition.id}
                    className='grid grid-cols-1 md:grid-cols-2 gap-8 opacity-0 animate-fade-in-up'
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    {exhibition.imageUrl && (
                      <div
                        className='gallery-item aspect-[16/10] cursor-pointer'
                        onClick={() => setSelectedExhibition(exhibition)}
                      >
                        <img
                          src={exhibition.imageUrl}
                          alt={exhibition.title}
                          loading='lazy'
                        />
                      </div>
                    )}
                    <div className={`flex flex-col justify-center ${!exhibition.imageUrl ? 'md:col-span-2' : ''}`}>
                      <p className='text-muted-foreground text-sm mb-2'>
                        {exhibition.date}
                      </p>
                      <h3 className='font-display text-3xl mb-2'>
                        {exhibition.title}
                      </h3>
                      <p className='text-muted-foreground'>
                        {exhibition.venue}, {exhibition.location}
                      </p>
                      {description && (
                        <p className='text-muted-foreground mt-4 text-sm'>
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <GalleryModal
        item={
          selectedExhibition
            ? { ...selectedExhibition, itemType: 'exhibition' as const }
            : null
        }
        onClose={() => setSelectedExhibition(null)}
      />
    </Layout>
  )
}

export default Exhibitions