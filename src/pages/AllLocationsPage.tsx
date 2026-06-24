import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker } from 'react-icons/hi';
import { fetchLocations, fetchItems, type Location } from '../services/tourismService';
import TripCard from '../components/ui/TripCard';

export default function AllLocationsPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchLocations().then(locs => {
      setLocations(locs as Location[]);
    }).catch(() => null);

    fetchItems({ limit: 200 }).then(res => {
      const counts: Record<number, number> = {};
      res.data.forEach(item => {
        counts[item.location.id] = (counts[item.location.id] ?? 0) + 1;
      });
      setItemCounts(counts);
    }).catch(() => null);
  }, []);

  return (
    <div className="space-y-16 pb-24">

      {/* Page header */}
      <div className="bg-slate-900 pt-24 pb-16 px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-yellow-400 font-headings font-bold text-sm uppercase tracking-widest block mb-3"
        >
          Explore Rwanda
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-headings font-extrabold text-white tracking-tight"
        >
          All Destinations
        </motion.h1>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400" />
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {locations.length === 0 ? (
          <div className="py-24 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            No destinations yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {locations.map(loc => (
              <TripCard
                key={loc.id}
                name={loc.name}
                description={loc.description}
                image={loc.coverImage ?? undefined}
                location="Rwanda"
                duration={`${itemCounts[loc.id] ?? 0} Features`}
                onClick={() => navigate(`/locations/${loc.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
