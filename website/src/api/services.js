import { API_BASE_URL, fetchWithTimeout } from './apiClient';

/**
 * Official Service Categories based on FixLink Mobile & Backend definitions
 */
export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    title: 'Plumbing & Water Systems',
    shortName: 'Plumbing',
    icon: 'Wrench',
    accentColor: '#0284C7',
    accentLight: '#E0F2FE',
    tagline: 'Tanker pumps, pipe leak repairs, water heaters & bathroom fittings',
    description: 'Keep your domestic water supply running flawlessly. From rooftop tanker installations to high-pressure pipe leaks and electric water heater calibration in Addis Ababa.',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800',
    popular: true,
    subservices: [
      {
        id: 'p1',
        name: 'Tanker Pump & Float Valve',
        desc: 'Overhead tank repairs, pressure booster pumps, and automated float switches.',
        image: '/images/images3.jpg'
      },
      {
        id: 'p2',
        name: 'Pipe Leak & Line Repair',
        desc: 'Concealed leak detection, burst PPR pipes, and drainage fixes.',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'p3',
        name: 'Electric Water Heater (Boiler)',
        desc: 'Thermostat replacement, element servicing, and instant heater maintenance.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'p4',
        name: 'Bathroom & Kitchen Fixtures',
        desc: 'Modern mixer faucets, toilet flush mechanisms, and sink installations.',
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'electrical',
    title: 'Electrical & Power',
    shortName: 'Electrical',
    icon: 'Zap',
    accentColor: '#D97706',
    accentLight: '#FEF3C7',
    tagline: 'Certified house wiring, backup generators & solar systems',
    description: 'Safe, certified electrical installations to keep your home illuminated and powered through blackouts with backup generators and solar arrays.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    popular: true,
    subservices: [
      {
        id: 'e1',
        name: 'House Wiring & Short Circuit Fix',
        desc: 'Distribution board balancing, circuit breaker trips, and safety earthing.',
        image: '/images/House-Wiring.jpg'
      },
      {
        id: 'e2',
        name: 'Backup Generator Servicing',
        desc: 'Diesel & petrol generator repair, ATS automated transfer switch installation.',
        image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'e3',
        name: 'Solar Power & Inverters',
        desc: 'Rooftop solar panel wiring, lithium battery banks, and hybrid inverter setups.',
        image: 'https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'e4',
        name: 'Breaker & Socket Upgrades',
        desc: 'Heavy-duty stove sockets, surge protectors, and smart switches.',
        image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'appliances',
    title: 'Appliances & Electronics',
    shortName: 'Appliances',
    icon: 'Tv',
    accentColor: '#7C3AED',
    accentLight: '#F3E8FF',
    tagline: 'Diagnostics & repair for washing machines, fridges & TVs',
    description: 'Don’t let broken appliances disrupt your day. Skilled repair technicians diagnose circuit boards, compressors, and motor mechanics right at your doorstep.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    popular: true,
    subservices: [
      {
        id: 'a1',
        name: 'Washing Machine Repair',
        desc: 'Drain pump issues, drum spinning faults, bearing replacement, and sensors.',
        image: '/images/washing-machine.jpg'
      },
      {
        id: 'a2',
        name: 'Refrigerator & Deep Freezer',
        desc: 'Gas refilling, compressor replacement, defrost timers, and door seals.',
        image: '/images/Refrigerator.jpg'
      },
      {
        id: 'a3',
        name: 'TV & Satellite Dishes',
        desc: 'LED screen backlight fixes, power supply repair, and Nilesat/Yahsat alignment.',
        image: '/images/TV-Satellite.jpg'
      },
      {
        id: 'a4',
        name: 'Electric & Gas Stove (Mitad)',
        desc: 'Ethiopian Injera mitad elements, burner calibration, and baking ovens.',
        image: '/images/Electric-Stove.jpg'
      }
    ]
  },
  {
    id: 'carpentry',
    title: 'Carpentry & Metalwork',
    shortName: 'Carpentry',
    icon: 'Hammer',
    accentColor: '#EA580C',
    accentLight: '#FFEDD5',
    tagline: 'Gates, security locks, roof sheets & custom wood fixtures',
    description: 'Strengthen and beautify your premises with expert welders and master carpenters for gates, security doors, custom cabinets, and corrugated roof sheets.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    popular: false,
    subservices: [
      {
        id: 'c1',
        name: 'Compound Gate & Metal Welding',
        desc: 'Sliding gate tracks, steel hinges, decorative grills, and security bars.',
        image: '/images/gate.jpg'
      },
      {
        id: 'c2',
        name: 'Door Lock & High-Security Keys',
        desc: 'Multi-point cylinder locks, mortise latch repairs, and master keying.',
        image: '/images/Lock-Key.jpg'
      },
      {
        id: 'c3',
        name: 'Furniture & Custom Woodwork',
        desc: 'Wardrobes, kitchen cupboards, dining tables, and wooden door restoration.',
        image: '/images/Furniture.jpg'
      },
      {
        id: 'c4',
        name: 'Corrugated Roof Sheet Repair',
        desc: 'Roof leak waterproofing, gutter realignment, and truss reinforcement.',
        image: '/images/Roof-Sheet.jpg'
      }
    ]
  },
  {
    id: 'finishing',
    title: 'Finishing & Cleaning',
    shortName: 'Finishing',
    icon: 'Sparkles',
    accentColor: '#16A34A',
    accentLight: '#DCFCE7',
    tagline: 'Wall painting, tile repairs, deep cleaning & moving',
    description: 'Turn your house into a pristine home. Professional interior/exterior painters, precision ceramic tilers, and careful household moving crews in Addis Ababa.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    popular: false,
    subservices: [
      {
        id: 'f1',
        name: 'Interior & Exterior Wall Painting',
        desc: 'Water-based emulsions, enamel finishes, putty surface preparation, and mold treatment.',
        image: '/images/painting.jpg'
      },
      {
        id: 'f2',
        name: 'Ceramic Tile & Granite Repair',
        desc: 'Hollow tile replacement, bathroom regrouting, and decorative skirting.',
        image: '/images/tile.jpg'
      },
      {
        id: 'f3',
        name: 'Post-Construction Deep Cleaning',
        desc: 'Hard floor scrubbing, window polishing, and sanitization services.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'f4',
        name: 'Careful Moving & Loading',
        desc: 'Household relocation, heavy appliance transport, and padded loading.',
        image: '/images/Moving-Loading.jpg'
      }
    ]
  }
];

/**
 * Fallback verified technician data matching real MongoDB records in Addis Ababa
 */
export const FALLBACK_PROVIDERS = [
  {
    _id: '6a9d1ebaf8917f13f2d5b208',
    fullName: 'Besu Geta',
    phone: '+251 915 566 219',
    profession: 'Electrical & Power',
    subcity: 'Megenagna',
    experience: '1 - 3 years',
    skills: ['House Wiring', 'Solar System'],
    rating: 4.9,
    isVerified: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: '6a99f94b34236ec352ee731b',
    fullName: 'Biniyam Shibre',
    phone: '+251 913 426 886',
    profession: 'Electrical & Power',
    subcity: 'Kara / Yeka',
    experience: '3 - 5 years',
    skills: ['House Wiring', 'Breaker Fix', 'Generator'],
    rating: 5.0,
    isVerified: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    _id: '6a9bde641783a9196a486895',
    fullName: 'Dawit Hailu',
    phone: '+251 912 465 788',
    profession: 'Appliances & Electronics',
    subcity: 'Bole',
    experience: '1 - 3 years',
    skills: ['Washing Machine', 'Refrigerator', 'Electric Stove', 'TV & Satellite'],
    rating: 4.8,
    isVerified: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    _id: '6a9b34b3d05e85f94aa0f2de',
    fullName: 'Alex Abrha',
    phone: '+251 999 736 412',
    profession: 'Finishing & Cleaning',
    subcity: 'Kara',
    experience: '3 - 5 years',
    skills: ['Wall Painting', 'Tile Repair', 'Moving & Loading'],
    rating: 4.9,
    isVerified: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    _id: '6a9b3292d05e85f94aa0f2dd',
    fullName: 'Fikadu Getaye',
    phone: '+251 910 881 345',
    profession: 'Plumbing & Water Systems',
    subcity: 'Bole / Saris',
    experience: '4+ years',
    skills: ['Tanker Pump', 'Pipe Leak', 'Water Heater'],
    rating: 5.0,
    isVerified: true,
    isAvailable: true,
    isFeatured: false
  }
];

/**
 * Fetch verified providers from the backend API with fallback
 */
export async function fetchProviders(category = '') {
  try {
    const url = new URL(`${API_BASE_URL}/auth/providers`);
    if (category && category !== 'All') {
      url.searchParams.set('category', category);
    }

    const response = await fetchWithTimeout(url.toString(), {}, 5000);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        data: data.map(p => ({
          ...p,
          // Guarantee pleasant display phone if raw is without spacing
          phone: formatPhoneDisplay(p.phone),
          rating: p.rating || 5.0
        })),
        isLive: true
      };
    }
  } catch (err) {
    console.warn('Backend provider fetch failed or timed out, using fallback cache:', err.message);
  }

  // Filter fallback data if category provided
  let filtered = FALLBACK_PROVIDERS;
  if (category && category !== 'All') {
    filtered = FALLBACK_PROVIDERS.filter(p => 
      p.profession.toLowerCase().includes(category.toLowerCase()) ||
      (p.skills && p.skills.some(s => s.toLowerCase().includes(category.toLowerCase())))
    );
  }

  return { data: filtered, isLive: false };
}

/**
 * Helper to display phone numbers cleanly
 */
function formatPhoneDisplay(phone) {
  if (!phone) return '+251 911 000 000';
  if (phone.startsWith('+251') && phone.length >= 13) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7, 10)} ${phone.substring(10)}`;
  }
  return phone;
}
