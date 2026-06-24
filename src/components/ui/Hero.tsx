import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, EffectFade } from 'swiper/modules';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  link?: string;
}

interface HeroProps {
  slides: HeroSlide[];
}

export default function Hero({ slides }: HeroProps) {
  return (
    <div className="relative h-[650px] w-full overflow-hidden group">
      <Swiper
        modules={[Autoplay, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          nextEl: '.hero-next',
          prevEl: '.hero-prev',
        }}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-6">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-brush text-7xl md:text-9xl mb-4 drop-shadow-2xl text-center"
              >
                {slide.title}
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-4"
              >
                <span className="h-px w-12 bg-white/50" />
                <p className="font-headings font-bold text-2xl md:text-3xl tracking-wide uppercase">
                  {slide.subtitle.split(' ')[0]} <span className="font-extrabold">{slide.subtitle.split(' ').slice(1).join(' ')}</span>
                </p>
                <span className="h-px w-12 bg-white/50" />
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button className="hero-prev absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-primary hover:bg-primary-dark text-slate-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
        <HiChevronLeft size={28} />
      </button>
      <button className="hero-next absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-primary hover:bg-primary-dark text-slate-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
        <HiChevronRight size={28} />
      </button>

      {/* Yellow Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary z-30" />

    </div>
  );
}
