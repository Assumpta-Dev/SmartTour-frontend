import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiStar } from 'react-icons/hi';

interface TripCardProps {
  image?: string;
  name: string;
  description: string;
  price?: string;
  rating?: number;
  location: string;
  duration?: string;
  slug?: string;
  onClick?: () => void;
}

export default function TripCard({
  image,
  name,
  description,
  price,
  rating,
  location,
  slug,
  onClick
}: TripCardProps) {
  const localRating = slug ? Number(localStorage.getItem(`rating_${slug}`) ?? 0) : 0;
  const displayRating = localRating > 0 ? localRating : (rating ?? 0);
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white group cursor-pointer border border-gray-100 shadow-modern overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <HiOutlineLocationMarker size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headings font-bold text-xl text-slate-900 group-hover:text-primary-dark transition-colors">
            {name}
          </h3>
          {price && (
            <span className="text-accent font-headings font-bold text-xl">
              {price}
            </span>
          )}
        </div>
        
        {displayRating > 0 && (
          <div className="flex items-center gap-1.5 text-accent text-sm font-bold mb-4 italic">
            <span>{displayRating.toFixed(1)}</span>
            <span>{displayRating >= 9 ? 'Exceptional' : displayRating >= 8 ? 'Superb' : displayRating >= 5 ? 'Excellent' : 'Good'}</span>
          </div>
        )}

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="bg-primary p-4 flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
        <HiOutlineLocationMarker size={16} className="flex-shrink-0" />
        <span className="truncate">{location}</span>
      </div>
    </motion.div>
  );
}
