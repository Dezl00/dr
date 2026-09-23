'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface HeroSlideshowProps {
  images: string[]
  animationType: 'fade' | 'slider'
}

export function HeroSlideshow({ images, animationType }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setIsTransitioning(false)
    }, animationType === 'fade' ? 500 : 300)
  }, [images.length, animationType])

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [images.length, nextSlide])

  if (images.length === 0) return null

  if (animationType === 'fade') {
    return (
      <div className="absolute inset-0 w-full h-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
            style={{ opacity: idx === currentIndex ? 1 : 0 }}
          >
            <Image src={img} alt={`Hero slide ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    )
  }

  // Slider
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative min-w-full h-full shrink-0">
            <Image src={img} alt={`Hero slide ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}
