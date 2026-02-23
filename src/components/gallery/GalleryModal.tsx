import { Exhibition, Print } from '@/data/portfolio'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { GalleryItem } from './GalleryGrid'

// Union type for all possible modal items
type ModalItem =
  | (GalleryItem & { itemType: 'artwork' })
  | (Print & { itemType: 'print' })
  | (Exhibition & { itemType: 'exhibition' })

interface GalleryModalProps {
  item: ModalItem | null
  onClose: () => void
}

// Helper function to check if URL is a YouTube video
function isYouTubeUrl(url: string): boolean {
  return (
    url.includes('youtube.com/watch') ||
    url.includes('youtu.be/') ||
    url.includes('youtube.com/embed/')
  )
}

// Helper function to extract YouTube video ID and create embed URL
function getYouTubeEmbedUrl(url: string): string {
  let videoId = ''

  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1])
    videoId = urlParams.get('v') || ''
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1].split('?')[0]
  }

  return `https://www.youtube.com/embed/${videoId}`
}

// Helper function to build complete media array (imageUrl + gallery)
function buildMediaArray(item: ModalItem): string[] {
  const mediaArray: string[] = []

  // Add main image first
  if (item.imageUrl) {
    mediaArray.push(item.imageUrl)
  }

  // Add gallery items
  if (item.gallery && item.gallery.length > 0) {
    item.gallery.forEach(media => {
      if (media.type === 'image' && media.image) {
        mediaArray.push(media.image)
      } else if (media.type === 'video' && media.videoUrl) {
        mediaArray.push(media.videoUrl)
      }
    })
  }

  return mediaArray
}

export function GalleryModal({ item, onClose }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate media array and related values (safe even if item is null)
  const mediaArray = item ? buildMediaArray(item) : []
  const currentMedia = mediaArray[currentIndex] || ''
  const isVideo = currentMedia ? isYouTubeUrl(currentMedia) : false
  const hasMultipleMedia = mediaArray.length > 1

  // Navigation functions with infinite carousel logic
  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % mediaArray.length)
  }

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + mediaArray.length) % mediaArray.length)
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  // Zoom handlers (only for desktop) - IN-PLACE zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    // Only enable zoom on desktop (check if device supports hover)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setShowZoom(true)
    }
  }

  const handleMouseLeave = () => {
    setShowZoom(false)
  }

  // ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (item) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [item, onClose])

  // Reset index when item changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [item])

  // Keyboard navigation (arrows)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!hasMultipleMedia) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    if (item) {
      document.addEventListener('keydown', handleKeyboard)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboard)
    }
  }, [item, hasMultipleMedia, currentIndex])

  if (!item) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in'
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className='absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-50'
        aria-label='Close modal'
      >
        <X size={32} />
      </button>

      <div
        className='max-w-5xl max-h-[90vh] mx-6 flex flex-col gap-4 animate-fade-in-up'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Media display area with navigation arrows */}
          <div className='flex-1 flex items-center justify-center relative'>
            {/* Navigation arrows - only show if multiple media */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={goToPrev}
                  className='absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all hover:scale-110'
                  aria-label='Previous'
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className='absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all hover:scale-110'
                  aria-label='Next'
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Media content */}
            {isVideo ? (
              <iframe
                src={getYouTubeEmbedUrl(currentMedia)}
                title={item.title}
                className='w-full aspect-video max-h-[65vh]'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            ) : (
              <div
                ref={containerRef}
                className='relative overflow-hidden cursor-crosshair'
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  ref={imageRef}
                  src={currentMedia}
                  alt={item.title}
                  className='max-h-[65vh] w-auto object-contain transition-transform duration-200'
                  style={{
                    transform: showZoom ? 'scale(1.4)' : 'scale(1)',
                    transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`
                  }}
                />
              </div>
            )}
          </div>

          {/* Item information */}
          <div className='md:w-72 flex flex-col justify-end pb-8'>
            <h2 className='font-display text-3xl mb-4'>{item.title}</h2>

            {/* Artwork specific info */}
            {item.itemType === 'artwork' && (
              <>
                {item.year && (
                  <p className='text-muted-foreground mb-2'>{item.year}</p>
                )}
                {item.medium && (
                  <p className='text-muted-foreground text-sm mb-1'>
                    {item.medium}
                  </p>
                )}
                {item.dimensions && (
                  <p className='text-muted-foreground text-sm'>
                    {item.dimensions}
                  </p>
                )}
              </>
            )}

            {/* Print specific info */}
            {item.itemType === 'print' && (
              <>
                <p className='text-muted-foreground text-sm mb-1'>
                  {item.edition}
                </p>
                {item.description && (
                  <p className='text-muted-foreground text-sm mt-4 leading-relaxed'>
                    {item.description}
                  </p>
                )}
                <p className='text-muted-foreground text-sm mb-2'>
                  {item.size}
                </p>
                {item.price && item.available && (
                  <p className='text-primary font-medium mb-4'>{item.price}</p>
                )}
                {!item.available && (
                  <p className='text-muted-foreground text-sm mb-4'>Agotado</p>
                )}

                {item.available && (
                  <a
                    href={`https://wa.me/5491234567890?text=${encodeURIComponent(`Hola, me interesa el print: ${item.title}`)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center gap-2 text-sm uppercase tracking-[0.15em] border border-primary text-primary px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300'
                  >
                    Consultar por WhatsApp
                  </a>
                )}
              </>
            )}

            {/* Exhibition specific info */}
            {item.itemType === 'exhibition' && (
              <>
                <p className='text-muted-foreground text-sm mb-2'>
                  {item.date}
                </p>
                <p className='text-muted-foreground mb-2'>
                  {item.venue}, {item.location}
                </p>
                {item.description && (
                  <p className='text-muted-foreground text-sm mt-4 leading-relaxed'>
                    {item.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Thumbnails - only show if multiple media */}
        {hasMultipleMedia && (
          <div className='flex gap-2 justify-center overflow-x-auto pb-2 px-4'>
            {mediaArray.map((media, index) => {
              const isThumbVideo = isYouTubeUrl(media)
              const isActive = index === currentIndex

              return (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                    isActive
                      ? 'border-primary scale-110'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {isThumbVideo ? (
                    <div className='w-full h-full bg-muted flex items-center justify-center'>
                      <Play size={24} className='text-muted-foreground' />
                    </div>
                  ) : (
                    <img
                      src={media}
                      alt={`Thumbnail ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
