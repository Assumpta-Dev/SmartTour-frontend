import { useNavigate } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';
import { HiLocationMarker, HiPhone, HiMail } from 'react-icons/hi';
import { MdNfc, MdQrCodeScanner } from 'react-icons/md';

export default function Footer() {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-dark text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <RiLeafLine size={28} className="text-primary" />
            <span className="font-headings font-extrabold text-2xl tracking-tighter">
              Smart<span className="text-primary">Tour</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Experience Rwanda like never before. Our digital guides bring the beauty of the thousand hills to your fingertips.
          </p>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-gray-300">
              <MdNfc size={16} /> NFC Enabled
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-gray-300">
              <MdQrCodeScanner size={16} /> QR Guides
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-headings font-bold text-sm uppercase tracking-widest text-primary mb-8">Navigation</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            {['Home', 'Destinations', 'Tours', 'About Us', 'Contact'].map((item) => (
              <li key={item}>
                <button className="hover:text-primary transition-colors">{item}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-headings font-bold text-sm uppercase tracking-widest text-primary mb-8">Destinations</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            {['Volcanoes Park', 'Akagera Park', 'Nyungwe Forest', 'Lake Kivu', 'Kigali City'].map((item) => (
              <li key={item}>
                <button className="hover:text-primary transition-colors">{item}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-headings font-bold text-sm uppercase tracking-widest text-primary mb-8">Contact Info</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <HiLocationMarker size={18} className="text-primary mt-0.5" />
              <span>Kigali City<br />Kigali, Rwanda</span>
            </li>
            <li className="flex items-center gap-3">
              <HiPhone size={18} className="text-primary" />
              <span>+250 780 19 37 87</span>
            </li>
            <li className="flex items-center gap-3">
              <HiMail size={18} className="text-primary" />
              <span>info@smarttour.rw</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} Smart Tourism Rwanda. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-white transition">Privacy Policy</button>
            <button className="hover:text-white transition">Terms of Service</button>
            <p>Powered by <span className="text-primary">Icumu Tech</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
