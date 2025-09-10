'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className = '' }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const openModal = (index: number) => {
    setSelectedImage(index)
    setCurrentIndex(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`mb-6 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-64 md:h-80">
          {/* First image - larger */}
          <div 
            className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openModal(0)}
          >
            <Image
              src={images[0]}
              alt={`${alt} - Photo principale`}
              width={600}
              height={400}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <div className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Voir en grand
              </div>
            </div>
          </div>

          {/* Other images */}
          {images.slice(1, 5).map((image, index) => {
            const isLast = index === 3; // Dernière position (index 3 = 4ème image)
            const remainingCount = images.length - 5;
            const showCounter = isLast && images.length > 5;
            
            return (
              <div
                key={index + 1}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openModal(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${alt} - Photo ${index + 2}`}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Overlay avec compteur sur la dernière image si nécessaire */}
                {showCounter ? (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-all group-hover:bg-opacity-50">
                    <div className="text-white text-2xl font-bold">
                      +{remainingCount}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-[1100] bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              closeModal()
            }}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div 
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Photo ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
}