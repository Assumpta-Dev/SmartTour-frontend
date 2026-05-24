import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en', fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'Welcome',
        startTour: 'Start Tour',
        // object page
        category: 'Category',
        location: 'Location',
        listenNarration: 'Listen to Narration',
        pauseNarration: 'Pause Narration',
        nearbyAttractions: 'Nearby Attractions',
        funFacts: 'Did You Know?',
        noFunFact: 'Explore and discover more about this attraction.',
        backToMap: 'Back to Map',
        notFound: 'Object not found.',
        loading: 'Loading…',
        away: 'away',
      },
    },
    fr: {
      translation: {
        welcome: 'Bienvenue',
        startTour: 'Commencer la visite',
        category: 'Catégorie',
        location: 'Emplacement',
        listenNarration: 'Écouter la narration',
        pauseNarration: 'Pause',
        nearbyAttractions: 'Attractions à proximité',
        funFacts: 'Le saviez-vous ?',
        noFunFact: 'Explorez et découvrez cette attraction.',
        backToMap: 'Retour à la carte',
        notFound: 'Objet introuvable.',
        loading: 'Chargement…',
        away: 'de distance',
      },
    },
    rw: {
      translation: {
        welcome: 'Murakaza neza',
        startTour: 'Tangira Ingendo',
        category: 'Ubwoko',
        location: 'Aho biherereye',
        listenNarration: 'Umva Ibisobanuro',
        pauseNarration: 'Hagarika',
        nearbyAttractions: 'Ibiri Hafi',
        funFacts: 'Ese Wari Uzi?',
        noFunFact: 'Shakisha no kumenya byinshi.',
        backToMap: 'Garuka ku Ikarita',
        notFound: 'Ntiboneka.',
        loading: 'Gutegereza…',
        away: 'hafi',
      },
    },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
