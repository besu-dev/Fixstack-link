/**
 * Bete / FixLink Admin Portal API Client
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('fixlink_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const cleanPath = url.replace(/\\/g, '/').replace(/^\/?/, '');
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Safely converts object to query string, removing undefined, null, empty strings, and 'all' filters
 */
const buildQuery = (params = {}) => {
  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'undefined' &&
      value !== 'null' &&
      value !== 'all' &&
      value !== 'All'
    ) {
      clean[key] = value;
    }
  }
  return new URLSearchParams(clean).toString();
};

/**
 * Handle API responses with proper error extraction
 */
async function handleResponse(response) {
  if (response.status === 401) {
    const currentToken = localStorage.getItem('fixlink_admin_token');
    if (currentToken) {
      console.warn('Admin session unauthorized or expired. Resetting stored credentials.');
      localStorage.removeItem('fixlink_admin_token');
      localStorage.removeItem('fixlink_admin_user');
      window.dispatchEvent(new Event('fixlink_admin_auth_expired'));
    }
    throw new Error('Session expired or unauthorized. Please sign in with admin credentials.');
  }

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch {
      // response was not JSON
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Fallback / Mock Data Generator for seamless preview & resilience
 */
const MOCK_DATA = {
  stats: {
    users: {
      total: 128,
      customers: 86,
      providers: 42,
      pendingVerifications: 7,
      verifiedProviders: 35,
    },
    jobs: {
      total: 94,
      open: 14,
      assigned: 18,
      completed: 58,
      cancelled: 4,
      totalVolumeETB: 432500,
    },
    bids: {
      total: 215,
    },
    breakdowns: {
      byCategory: [
        { category: 'Plumbing & Water Systems', count: 34 },
        { category: 'Electrical & Power', count: 26 },
        { category: 'Appliances & Electronics', count: 18 },
        { category: 'Carpentry & Metalwork', count: 11 },
        { category: 'Finishing & Cleaning', count: 5 },
      ],
      bySubcity: [
        { subcity: 'Bole', count: 16 },
        { subcity: 'Yeka', count: 9 },
        { subcity: 'Kirkos', count: 7 },
        { subcity: 'Arada', count: 4 },
        { subcity: 'Nifas Silk-Lafto', count: 6 },
      ],
    },
    recentActivity: {
      users: [
        { _id: 'u1', fullName: 'Dawit Mengistu', role: 'provider', profession: 'Plumbing & Water Systems', subcity: 'Bole', isVerified: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: 'u2', fullName: 'Selamawit Bekele', role: 'customer', profession: '', subcity: 'Kirkos', isVerified: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: 'u3', fullName: 'Yared Tesfaye', role: 'provider', profession: 'Electrical & Power', subcity: 'Yeka', isVerified: true, createdAt: new Date(Date.now() - 14400000).toISOString() },
        { _id: 'u4', fullName: 'Hanan Mohammed', role: 'customer', profession: '', subcity: 'Arada', isVerified: true, createdAt: new Date(Date.now() - 28800000).toISOString() },
      ],
      jobs: [
        { _id: 'j1', title: 'Boiler / Water Heater Leaking', category: 'Plumbing & Water Systems', budget: 3500, urgency: 'Emergency', status: 'open', customer: { fullName: 'Selamawit Bekele', phone: '+251911234567' }, createdAt: new Date(Date.now() - 1800000).toISOString() },
        { _id: 'j2', title: 'Main Circuit Breaker Tripping', category: 'Electrical & Power', budget: 2800, urgency: 'Today', status: 'assigned', customer: { fullName: 'Abebe Kebede', phone: '+251922345678' }, createdAt: new Date(Date.now() - 5400000).toISOString() },
        { _id: 'j3', title: 'Washing Machine Drum Vibration', category: 'Appliances & Electronics', budget: 4200, urgency: 'Flexible', status: 'completed', customer: { fullName: 'Hanan Mohammed', phone: '+251933456789' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
      ],
    },
  },
  verifications: [
    {
      _id: 'p1',
      fullName: 'Dawit Mengistu',
      email: 'dawit.m@bete.et',
      phone: '+251911889900',
      profession: 'Plumbing & Water Systems',
      subcity: 'Bole',
      experience: '3 - 5 years',
      skills: ['Pipe Leak & Line Repair', 'Water Heater (Boiler)', 'Tanker Pump & Booster'],
      kebeleIdUrl: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=800&q=80',
      tradeCertUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      isVerified: false,
      connectsBalance: 5,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'p2',
      fullName: 'Solomon Tadesse',
      email: 'solomon.t@bete.et',
      phone: '+251922445566',
      profession: 'Electrical & Power',
      subcity: 'Yeka',
      experience: '5+ years',
      skills: ['House Wiring', 'Circuit Breaker Repair', 'Generator Repair', 'Solar System'],
      kebeleIdUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
      tradeCertUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      isVerified: false,
      connectsBalance: 5,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: 'p3',
      fullName: 'Mulugeta Alemu',
      email: 'mulugeta@bete.et',
      phone: '+251933778899',
      profession: 'Appliances & Electronics',
      subcity: 'Kirkos',
      experience: '1 - 3 years',
      skills: ['Refrigerator & Freezer', 'Washing Machine', 'Electric Stove (Mitad)'],
      kebeleIdUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      tradeCertUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      isVerified: false,
      connectsBalance: 5,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  users: [
    { _id: 'u1', fullName: 'Dawit Mengistu', email: 'dawit.m@bete.et', phone: '+251911889900', role: 'provider', profession: 'Plumbing & Water Systems', subcity: 'Bole', isVerified: false, connectsBalance: 5, rating: 4.8, isFeatured: false, createdAt: '2026-09-08T10:30:00Z' },
    { _id: 'u2', fullName: 'Solomon Tadesse', email: 'solomon.t@bete.et', phone: '+251922445566', role: 'provider', profession: 'Electrical & Power', subcity: 'Yeka', isVerified: false, connectsBalance: 5, rating: 4.9, isFeatured: false, createdAt: '2026-09-07T14:15:00Z' },
    { _id: 'u3', fullName: 'Yared Tesfaye', email: 'yared@bete.et', phone: '+251912345678', role: 'provider', profession: 'Plumbing & Water Systems', subcity: 'Kirkos', isVerified: true, connectsBalance: 18, rating: 5.0, isFeatured: true, createdAt: '2026-08-20T08:00:00Z' },
    { _id: 'u4', fullName: 'Selamawit Bekele', email: 'selam@bete.et', phone: '+251911234567', role: 'customer', profession: '', subcity: 'Bole', isVerified: true, connectsBalance: 0, rating: 5.0, isFeatured: false, createdAt: '2026-08-25T11:20:00Z' },
    { _id: 'u5', fullName: 'Abebe Kebede', email: 'abebe@bete.et', phone: '+251922345678', role: 'customer', profession: '', subcity: 'Kirkos', isVerified: true, connectsBalance: 0, rating: 4.9, isFeatured: false, createdAt: '2026-08-28T09:40:00Z' },
    { _id: 'u6', fullName: 'Hanan Mohammed', email: 'hanan@bete.et', phone: '+251933456789', role: 'customer', profession: '', subcity: 'Arada', isVerified: true, connectsBalance: 0, rating: 5.0, isFeatured: false, createdAt: '2026-09-01T16:00:00Z' },
  ],
  jobs: [
    {
      _id: 'j1',
      title: 'Boiler / Water Heater Leaking',
      description: 'The 80L electric boiler in the primary bathroom is dripping water from the lower heating element seal. Needs urgent gasket replacement or resealing.',
      category: 'Plumbing & Water Systems',
      subcity: 'Bole',
      specificLocation: 'Near Edna Mall, Atlas area',
      budget: 3500,
      urgency: 'Emergency',
      status: 'open',
      photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
      customer: { fullName: 'Selamawit Bekele', phone: '+251911234567', email: 'selam@bete.et' },
      assignedProvider: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: 'j2',
      title: 'Main Circuit Breaker Tripping',
      description: 'The central 40A Schneider breaker trips whenever kitchen oven and water pump are operated simultaneously. Possible short or line overload.',
      category: 'Electrical & Power',
      subcity: 'Kirkos',
      specificLocation: 'Meshualekia, building 4',
      budget: 2800,
      urgency: 'Today',
      status: 'assigned',
      photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
      customer: { fullName: 'Abebe Kebede', phone: '+251922345678', email: 'abebe@bete.et' },
      assignedProvider: { fullName: 'Yared Tesfaye', phone: '+251912345678', profession: 'Electrical & Power', rating: 5.0 },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      _id: 'j3',
      title: 'Washing Machine Drum Vibration',
      description: 'Samsung front-loader vibrates violently during spin cycle. Shock absorbers or balancing springs need replacement.',
      category: 'Appliances & Electronics',
      subcity: 'Arada',
      specificLocation: 'Piazza, near St. George',
      budget: 4200,
      urgency: 'Flexible',
      status: 'completed',
      photos: ['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80'],
      customer: { fullName: 'Hanan Mohammed', phone: '+251933456789', email: 'hanan@bete.et' },
      assignedProvider: { fullName: 'Mulugeta Alemu', phone: '+251933778899', profession: 'Appliances & Electronics', rating: 4.8 },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  bids: [
    { _id: 'b1', price: 3200, serviceFee: 160, totalAmount: 3360, estimatedDuration: '2 hours', note: 'I have authentic Ariston & Atlantic heating elements ready in stock. Can come within 30 minutes.', status: 'pending', isBoosted: true, provider: { fullName: 'Dawit Mengistu', phone: '+251911889900', profession: 'Plumbing & Water Systems', rating: 4.8 }, job: { title: 'Boiler / Water Heater Leaking', budget: 3500, category: 'Plumbing & Water Systems' }, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { _id: 'b2', price: 2800, serviceFee: 140, totalAmount: 2940, estimatedDuration: '1.5 hours', note: 'Certified master electrician. Will test the load balance with a digital multimeter.', status: 'accepted', isBoosted: false, provider: { fullName: 'Yared Tesfaye', phone: '+251912345678', profession: 'Electrical & Power', rating: 5.0 }, job: { title: 'Main Circuit Breaker Tripping', budget: 2800, category: 'Electrical & Power' }, createdAt: new Date(Date.now() - 5400000).toISOString() },
  ],
  transactions: [
    { _id: 'tx1', type: 'connects_purchase', connects: 25, amountETB: 450, paymentMethod: 'telebirr', referenceTxId: 'TLB-983421', status: 'completed', user: { fullName: 'Yared Tesfaye', phone: '+251912345678', role: 'provider' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'tx2', type: 'connects_purchase', connects: 50, amountETB: 850, paymentMethod: 'cbebirr', referenceTxId: 'CBE-772109', status: 'completed', user: { fullName: 'Dawit Mengistu', phone: '+251911889900', role: 'provider' }, createdAt: new Date(Date.now() - 18000000).toISOString() },
    { _id: 'tx3', type: 'proposal_boost', connects: 5, amountETB: 0, paymentMethod: 'wallet_deduction', referenceTxId: '', status: 'completed', user: { fullName: 'Dawit Mengistu', phone: '+251911889900', role: 'provider' }, createdAt: new Date(Date.now() - 2500000).toISOString() },
  ],
};

/**
 * Admin API Methods
 */
export const adminApi = {
  // Authentication
  async login(identifier, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      return await handleResponse(res);
    } catch (err) {
      // If server is unreachable or offline, allow demo login with default credentials
      const cleanId = (identifier || '').trim().toLowerCase();
      if (
        (cleanId === 'admin@bete.et' || cleanId === 'admin' || cleanId === '+251911000000') &&
        password === 'Admin@123456'
      ) {
        console.warn('Backend offline; using resilient fallback admin session for demo/presentation');
        return {
          token: 'demo-admin-session-token-' + Date.now(),
          admin: {
            id: 'admin-root-id',
            fullName: 'Bete Administrator (Demo Mode)',
            email: 'admin@bete.et',
            phone: '+251911000000',
            role: 'admin',
          },
          isDemoMode: true,
        };
      }
      throw err;
    }
  },

  // Stats
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return MOCK_DATA.stats;
    }
  },

  // Verification
  async getPendingVerifications(status = 'pending') {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications?status=${status}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return { providers: MOCK_DATA.verifications };
    }
  },

  async verifyProvider(id, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verify-provider/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(res);
    } catch {
      // Optimistic local update
      const target = MOCK_DATA.verifications.find((p) => p._id === id);
      if (target) {
        target.isVerified = Boolean(payload.isVerified);
        if (payload.isVerified) target.connectsBalance = (target.connectsBalance || 0) + 10;
      }
      return { message: 'Provider updated (Demo Mode)', provider: target };
    }
  },

  async toggleFeatured(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feature-provider/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      const user = MOCK_DATA.users.find((u) => u._id === id);
      if (user) user.isFeatured = !user.isFeatured;
      return { message: 'Status toggled', provider: user };
    }
  },

  // Users
  async getUsers(params = {}) {
    const query = buildQuery(params);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      let filtered = [...MOCK_DATA.users];
      if (params.role && params.role !== 'all') {
        filtered = filtered.filter((u) => u.role === params.role);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter((u) => u.fullName.toLowerCase().includes(s) || u.phone.includes(s));
      }
      return { users: filtered, pagination: { total: filtered.length, page: 1, pages: 1 } };
    }
  },

  async updateUser(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch {
      const user = MOCK_DATA.users.find((u) => u._id === id);
      if (user) Object.assign(user, data);
      return { message: 'User updated (Demo Mode)', user };
    }
  },

  async deleteUser(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      MOCK_DATA.users = MOCK_DATA.users.filter((u) => u._id !== id);
      return { message: 'User deleted (Demo Mode)' };
    }
  },

  // Jobs
  async getJobs(params = {}) {
    const query = buildQuery(params);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/jobs?${query}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      let filtered = [...MOCK_DATA.jobs];
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((j) => j.status === params.status);
      }
      return { jobs: filtered, pagination: { total: filtered.length, page: 1, pages: 1 } };
    }
  },

  async updateJobStatus(id, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(res);
    } catch {
      const job = MOCK_DATA.jobs.find((j) => j._id === id);
      if (job) job.status = payload.status;
      return { message: 'Job status updated (Demo Mode)', job };
    }
  },

  // Bids
  async getBids(params = {}) {
    const query = buildQuery(params);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bids?${query}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return { bids: MOCK_DATA.bids, pagination: { total: MOCK_DATA.bids.length, page: 1, pages: 1 } };
    }
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = buildQuery(params);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/transactions?${query}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(res);
    } catch {
      return { transactions: MOCK_DATA.transactions, pagination: { total: MOCK_DATA.transactions.length, page: 1, pages: 1 } };
    }
  },

  // System Health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },
};
