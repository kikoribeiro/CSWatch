import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/cs2.jpg"
          alt="Counter-Strike gameplay"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="container relative z-20 text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          <span className="text-orange-500">CS WATCH</span>
          <span className="block mt-2">THE ICONIC TACTICAL SHOOTER</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
          Aqui na CS WATCH você pode encontrar tudo sobre CS2, desde skins até agentes.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M12 5v14"></path>
          <path d="m19 12-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  );
}
