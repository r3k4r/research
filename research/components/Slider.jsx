'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const fadeInAnimation = 'animate-fadeIn';
const fadeInClass = `opacity-0 ${fadeInAnimation}`;

const slides = [
  {
    title: 'Welcome to Second Serve',
    text: 'We\'re on a mission to reduce food waste and create a more sustainable future.',
    image: '/welcome/one.jpg',
  },
  {
    title: 'How It Works',
    text: 'Connect with local restaurants and stores to rescue surplus food at discounted prices.',
    image: '/welcome/two.jpg',
  },
  {
    title: 'Join Us Today',
    text: 'Sign up now to start making a difference in your community and save money on great food.',
    image: '/welcome/three.jpg',
  },
]

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push('/signin')
    }
  }

  const prevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1))
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="w-full md:w-1/2 space-y-4 mb-4 md:mb-0 relative h-64">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
              <p className="text-lg mb-4">{slide.text}</p>
            </div>
          ))}
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-96 relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-8 w-full">
        <button
          onClick={prevSlide}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
          disabled={currentSlide === 0}
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  )
}

