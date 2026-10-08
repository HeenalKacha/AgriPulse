import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Simulation flag for testing model disconnected state in UI
let modelSimulatedDisconnected = false;

// Scalable Commodity & Market registry
const COMMODITY_REGISTRY = {
  activeCommodityId: 'tur_dal',
  activeMarketId: 'mumbai_apmc',
  commodities: [
    {
      id: 'tur_dal',
      name: 'Tur Dal (Pigeon Pea / Arhar)',
      scientificName: 'Cajanus cajan',
      category: 'Kharif Pulse',
      status: 'active',
      variety: 'Desi / Fatka',
      standardUnit: '₹/quintal',
      benchmarkMSP: '₹7,550/quintal (2024-25)',
      majorBelts: ['Marathwada', 'Vidarbha', 'Gulbarga', 'Indore'],
      currentMarket: 'Mumbai APMC'
    },
    {
      id: 'chana_dal',
      name: 'Chana Dal (Gram / Chickpea)',
      scientificName: 'Cicer arietinum',
      category: 'Rabi Pulse',
      status: 'upcoming',
      variety: 'Desi / Kantewala',
      standardUnit: '₹/quintal',
      currentMarket: 'Akola APMC'
    },
    {
      id: 'moong_dal',
      name: 'Moong Dal (Green Gram)',
      scientificName: 'Vigna radiata',
      category: 'Kharif/Summer Pulse',
      status: 'upcoming',
      variety: 'Chamki / Shiny',
      standardUnit: '₹/quintal',
      currentMarket: 'Latur APMC'
    },
    {
      id: 'urad_dal',
      name: 'Urad Dal (Black Matpe)',
      scientificName: 'Vigna mungo',
      category: 'Kharif Pulse',
      status: 'upcoming',
      variety: 'FAQ / SQ',
      standardUnit: '₹/quintal',
      currentMarket: 'Jalgaon APMC'
    }
  ],
  markets: [
    {
      id: 'mumbai_apmc',
      name: 'Mumbai APMC (Vashi)',
      state: 'Maharashtra',
      type: 'Terminal Wholesale Hub',
      status: 'active',
      location: 'Navi Mumbai',
      tradingHours: '08:00 AM - 04:00 PM IST',
      supportedCommodities: ['tur_dal']
    },
    {
      id: 'akola_apmc',
      name: 'Akola APMC',
      state: 'Maharashtra',
      type: 'Primary Producing Mandi',
      status: 'upcoming',
      location: 'Vidarbha Region',
      supportedCommodities: ['tur_dal', 'chana_dal']
    },
    {
      id: 'latur_apmc',
      name: 'Latur APMC',
      state: 'Maharashtra',
      type: 'Major Pulse Trading Center',
      status: 'upcoming',
      location: 'Marathwada Region',
      supportedCommodities: ['tur_dal', 'moong_dal', 'urad_dal']
    }
  ]
};

// Cached dataset in memory
let cachedDataset: any[] = [];
const datasetPath = path.join(__dirname, 'backend', 'ml_engine', 'tur_dal_mumbai_dataset.json');
const catboostModelPath = path.join(__dirname, 'backend', 'ml_engine', 'catboost_volatility_model.cbm');
const catboostMetadataPath = path.join(__dirname, 'backend', 'ml_engine', 'catboost_metadata.json');
const predictScriptPath = path.join(__dirname, 'backend', 'ml_engine', 'predict.py');

function getDataset(): any[] {
  if (cachedDataset.length === 0) {
    if (fs.existsSync(datasetPath)) {
      const raw = fs.readFileSync(datasetPath, 'utf8');
      cachedDataset = JSON.parse(raw);
    }
  }
  return cachedDataset;
}

// ============================================================================
// REAL USER AUTHENTICATION & SECURE SESSION MANAGEMENT BACKEND
// ============================================================================
interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
  createdAt: string;
}

const usersDataDir = path.join(__dirname, 'backend', 'data');
const usersFilePath = path.join(usersDataDir, 'users.json');

if (!fs.existsSync(usersDataDir)) {
  fs.mkdirSync(usersDataDir, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function loadUsers(): UserRecord[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      const raw = fs.readFileSync(usersFilePath, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.error('Error reading users.json:', e);
  }
  return [];
}

function saveUsers(users: UserRecord[]): void {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing users.json:', e);
  }
}

// In-memory active session token store (token -> { userId, expiresAt })
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();
// In-memory password reset codes store (email -> { code, expiresAt })
const resetCodeStore = new Map<string, { code: string; expiresAt: number }>();

// Seed initial default demo user if user database is empty
(function seedDefaultUser() {
  const users = loadUsers();
  const defaultEmail = 'heenal@agripulse.ai';
  if (!users.some(u => u.email.toLowerCase() === defaultEmail.toLowerCase())) {
    const salt = crypto.randomBytes(16).toString('hex');
    const defaultUser: UserRecord = {
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      name: 'Heenal Patel',
      email: defaultEmail,
      salt,
      passwordHash: hashPassword('AgriPulse2025!', salt),
      role: 'APMC Market Intelligence Analyst',
      createdAt: new Date().toISOString()
    };
    users.push(defaultUser);
    saveUsers(users);
    console.log('[AgriPulse AI] Seeded default user:', defaultEmail);
  }
})();

// Helper to authenticate request from Authorization Bearer token header
function getAuthenticatedUser(req: Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  const users = loadUsers();
  return users.find(u => u.id === session.userId) || null;
}

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

// 0a. Sign Up / Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide your full name.' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match. Please verify and retry.' });
  }

  const users = loadUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newUser: UserRecord = {
    id: 'usr_' + crypto.randomBytes(8).toString('hex'),
    name: name.trim(),
    email: cleanEmail,
    salt,
    passwordHash,
    role: 'Market Trader & Pulse Analyst',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Generate 7-day session token
  const token = 'agri_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { userId: newUser.id, expiresAt });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(newUser)
  });
});

// 0b. Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password. Please verify credentials.' });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid email or password. Please verify credentials.' });
  }

  // Generate 7-day session token
  const token = 'agri_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { userId: user.id, expiresAt });

  res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: sanitizeUser(user)
  });
});

// 0c. Current User Session Check
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expired or unauthenticated.' });
  }
  res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// 0d. Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 0e. Forgot Password - Request Reset Code
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({ success: false, message: 'No AgriPulse AI account found with this email address.' });
  }

  // Generate 6-digit numeric reset code valid for 15 minutes
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;
  resetCodeStore.set(cleanEmail, { code: resetCode, expiresAt });

  res.json({
    success: true,
    message: `Verification code generated for ${cleanEmail}. Please enter the 6-digit code to reset your password.`,
    demoResetCode: resetCode // Provided directly for immediate instant testing in preview
  });
});

// 0f. Reset Password using Code
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, code, newPassword, confirmPassword } = req.body || {};

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const resetEntry = resetCodeStore.get(cleanEmail);

  if (!resetEntry) {
    return res.status(400).json({ success: false, message: 'No reset request found or code expired. Please request a new code.' });
  }

  if (Date.now() > resetEntry.expiresAt) {
    resetCodeStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
  }

  if (resetEntry.code !== String(code).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check the code and retry.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match.' });
  }

  const users = loadUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  users[userIndex].salt = salt;
  users[userIndex].passwordHash = hashPassword(newPassword, salt);
  saveUsers(users);

  resetCodeStore.delete(cleanEmail);

  res.json({
    success: true,
    message: 'Password has been successfully updated. You can now log in with your new password.'
  });
});

// 0g. Update Profile (Name & Role)
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { name, role } = req.body || {};
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (name && typeof name === 'string' && name.trim().length > 0) {
    users[idx].name = name.trim();
  }
  if (role && typeof role === 'string' && role.trim().length > 0) {
    users[idx].role = role.trim();
  }

  saveUsers(users);

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: sanitizeUser(users[idx])
  });
});

// 0h. Change Password from Settings
app.put('/api/auth/change-password', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
  }

  const users = loadUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const computedHash = hashPassword(currentPassword, users[idx].salt);
  if (computedHash !== users[idx].passwordHash) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  users[idx].salt = salt;
  users[idx].passwordHash = hashPassword(newPassword, salt);
  saveUsers(users);

  res.json({
    success: true,
    message: 'Password changed successfully.'
  });
});



// 1. Commodity & Market Configuration API
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: COMMODITY_REGISTRY
  });
});

// 2. Model Status API
app.get('/api/model/status', (_req: Request, res: Response) => {
  const modelExists = fs.existsSync(catboostModelPath);
  const predictExists = fs.existsSync(predictScriptPath);
  const datasetExists = fs.existsSync(datasetPath);

  let modelMetadata: any = null;
  if (fs.existsSync(catboostMetadataPath)) {
    try {
      const raw = fs.readFileSync(catboostMetadataPath, 'utf8');
      modelMetadata = JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  const isConnected = modelExists && predictExists && datasetExists && !modelSimulatedDisconnected;

  res.json({
    connected: isConnected,
    simulatedDisconnected: modelSimulatedDisconnected,
    serviceStatus: isConnected ? 'OPERATIONAL' : 'UNAVAILABLE',
    commodity: 'Tur Dal (Pigeon Pea)',
    market: 'Mumbai APMC',
    modelSignature: modelMetadata?.model_type || 'CatBoostRegressor-v1.4',
    trainingHorizon: '2021-2024',
    totalTrainedRecords: modelMetadata?.dataset_records_count || 1433,
    featureCount: modelMetadata?.feature_count || 18,
    statusMessage: isConnected
      ? 'Trained CatBoost ML backend connected and operational.'
      : 'Trained CatBoost ML model is offline or unavailable.'
  });
});

// Model connection simulation toggle (for testing UI service unavailable handling)
app.post('/api/model/toggle-connection', (req: Request, res: Response) => {
  if (typeof req.body?.disconnect === 'boolean') {
    modelSimulatedDisconnected = req.body.disconnect;
  } else {
    modelSimulatedDisconnected = !modelSimulatedDisconnected;
  }
  res.json({
    success: true,
    connected: !modelSimulatedDisconnected,
    simulatedDisconnected: modelSimulatedDisconnected
  });
});

// 3. Market Summary & KPI Endpoint
app.get('/api/market/summary', (_req: Request, res: Response) => {
  try {
    const data = getDataset();
    if (!data || data.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'Market data unavailable'
      });
    }

    const latest = data[data.length - 1];
    const prev14 = data[Math.max(0, data.length - 15)];
    const prev7 = data[Math.max(0, data.length - 8)];

    const priceChange14d = latest.modal_price - prev14.modal_price;
    const priceChange14dPct = ((priceChange14d / prev14.modal_price) * 100);

    const priceChange7d = latest.modal_price - prev7.modal_price;
    const priceChange7dPct = ((priceChange7d / prev7.modal_price) * 100);

    // 7-day average arrivals
    const last7 = data.slice(-7);
    const avgArrivals7d = Math.round(last7.reduce((acc, r) => acc + r.arrivals_quintals, 0) / last7.length);

    // 30-day average price
    const last30 = data.slice(-30);
    const avgPrice30d = Math.round(last30.reduce((acc, r) => acc + r.modal_price, 0) / last30.length);

    // Volatility risk categorization matching CatBoost model thresholds
    const currentVol = latest.realized_volatility_14d;
    let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    if (currentVol > 10.0) {
      riskLevel = 'High';
    } else if (currentVol >= 5.0) {
      riskLevel = 'Moderate';
    }

    res.json({
      success: true,
      commodity: 'Tur Dal (Pigeon Pea)',
      market: 'Mumbai APMC',
      latestDate: latest.date,
      latestPrice: latest.modal_price,
      minPrice: latest.min_price,
      maxPrice: latest.max_price,
      priceUnit: '₹/quintal',
      priceChange14d,
      priceChange14dPct: Number(priceChange14dPct.toFixed(2)),
      priceChange7d,
      priceChange7dPct: Number(priceChange7dPct.toFixed(2)),
      latestArrivals: latest.arrivals_quintals,
      avgArrivals7d,
      avgPrice30d,
      arrivalsUnit: 'quintals/day',
      rainfallLatestMm: latest.rainfall_mm,
      rainfallDeficitPct: latest.rainfall_deficit_pct,
      isMonsoonSeason: latest.is_monsoon,
      current14dVolatility: currentVol,
      riskLevel,
      modelConnected: !modelSimulatedDisconnected && fs.existsSync(catboostModelPath)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Dynamic AI Market Insights
app.get('/api/market/insights', (_req: Request, res: Response) => {
  try {
    const data = getDataset();
    if (!data || data.length === 0) {
      return res.status(503).json({ success: false, error: 'Data unavailable' });
    }

    const latest = data[data.length - 1];
    const last30 = data.slice(-30);
    const avgArrivals = Math.round(last30.reduce((s, r) => s + r.arrivals_quintals, 0) / 30);
    const avgPrice = Math.round(last30.reduce((s, r) => s + r.modal_price, 0) / 30);

    const insights = [
      {
        id: 'ins-1',
        title: 'Mandi Dispatches & Supply Absorption',
        category: 'Arrivals Dynamics',
        sentiment: latest.arrivals_quintals >= avgArrivals ? 'bullish_supply' : 'tight_supply',
        takeaway: `Current Mumbai APMC daily arrivals stand at ${latest.arrivals_quintals.toLocaleString()} quintals against the 30-day baseline of ${avgArrivals.toLocaleString()} quintals.`,
        recommendation: latest.arrivals_quintals < avgArrivals
          ? 'Millers and dal processors should secure spot inventory to hedge against delivery lag from Vidarbha.'
          : 'Terminal mandi arrivals remain steady; wholesale spreads are expected to trade within normal bands.'
      },
      {
        id: 'ins-2',
        title: 'Monsoon Sowing & Deficit Risk Indicator',
        category: 'Agro-Climatic',
        sentiment: latest.rainfall_deficit_pct < -15 ? 'high_risk' : 'normal',
        takeaway: latest.rainfall_deficit_pct < -15
          ? `Rainfall deficit of ${Math.abs(latest.rainfall_deficit_pct)}% across Maharashtra pulse districts creates upward volatility pressure.`
          : `Monsoon moisture reserves in cultivation clusters remain balanced (${latest.rainfall_deficit_pct >= 0 ? '+' : ''}${latest.rainfall_deficit_pct}% vs normal).`,
        recommendation: 'Monitor weekly reservoir capacity and post-monsoon pod development reports from Akola and Latur research stations.'
      },
      {
        id: 'ins-3',
        title: 'Procurement & Buffer Stock Advisory',
        category: 'Market Strategy',
        sentiment: latest.modal_price > 11500 ? 'elevated' : 'balanced',
        takeaway: `Spot modal price is ₹${latest.modal_price.toLocaleString()}/qtl (30-day average: ₹${avgPrice.toLocaleString()}/qtl).`,
        recommendation: 'Maintain a 14-day rolling buffer stock. Institutional buyers should utilize staggered procurement to minimize peak-day premium exposure.'
      }
    ];

    res.json({
      success: true,
      updatedAt: latest.date,
      insights
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Historical Data Endpoint with Granular Filtering
app.get('/api/historical', (req: Request, res: Response) => {
  try {
    const data = getDataset();
    let result = [...data];

    const { startDate, endDate, aggregation, search, limit } = req.query;

    if (startDate && typeof startDate === 'string') {
      result = result.filter(r => r.date >= startDate);
    }
    if (endDate && typeof endDate === 'string') {
      result = result.filter(r => r.date <= endDate);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.date.includes(q) ||
        r.modal_price.toString().includes(q) ||
        r.arrivals_quintals.toString().includes(q)
      );
    }

    // Weekly or monthly aggregation
    if (aggregation === 'weekly') {
      const weeklyMap = new Map<string, any[]>();
      result.forEach(r => {
        // Group by ISO week or 7-day chunk
        const d = new Date(r.date);
        const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + (new Date(d.getFullYear(), d.getMonth(), 1).getDay())) / 7)}`;
        if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, []);
        weeklyMap.get(weekKey)!.push(r);
      });

      result = Array.from(weeklyMap.entries()).map(([key, group]) => {
        const avgPrice = Math.round(group.reduce((s, g) => s + g.modal_price, 0) / group.length);
        const totalArrivals = group.reduce((s, g) => s + g.arrivals_quintals, 0);
        const avgRainfall = Number((group.reduce((s, g) => s + g.rainfall_mm, 0) / group.length).toFixed(1));
        const avgVol = Number((group.reduce((s, g) => s + g.realized_volatility_14d, 0) / group.length).toFixed(2));
        return {
          date: group[group.length - 1].date,
          periodLabel: key,
          modal_price: avgPrice,
          min_price: Math.min(...group.map(g => g.min_price)),
          max_price: Math.max(...group.map(g => g.max_price)),
          arrivals_quintals: totalArrivals,
          rainfall_mm: avgRainfall,
          realized_volatility_14d: avgVol,
          commodity: group[0].commodity,
          market: group[0].market
        };
      });
    } else if (aggregation === 'monthly') {
      const monthlyMap = new Map<string, any[]>();
      result.forEach(r => {
        const monthKey = r.date.substring(0, 7);
        if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, []);
        monthlyMap.get(monthKey)!.push(r);
      });

      result = Array.from(monthlyMap.entries()).map(([monthKey, group]) => {
        const avgPrice = Math.round(group.reduce((s, g) => s + g.modal_price, 0) / group.length);
        const totalArrivals = group.reduce((s, g) => s + g.arrivals_quintals, 0);
        const totalRainfall = Number(group.reduce((s, g) => s + g.rainfall_mm, 0).toFixed(1));
        const avgVol = Number((group.reduce((s, g) => s + g.realized_volatility_14d, 0) / group.length).toFixed(2));
        return {
          date: `${monthKey}-01`,
          periodLabel: monthKey,
          modal_price: avgPrice,
          min_price: Math.min(...group.map(g => g.min_price)),
          max_price: Math.max(...group.map(g => g.max_price)),
          arrivals_quintals: totalArrivals,
          rainfall_mm: totalRainfall,
          realized_volatility_14d: avgVol,
          commodity: group[0].commodity,
          market: group[0].market
        };
      });
    }

    if (limit && typeof limit === 'string') {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        result = result.slice(-parsedLimit);
      }
    }

    res.json({
      success: true,
      count: result.length,
      commodity: 'Tur Dal (Pigeon Pea)',
      market: 'Mumbai APMC',
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. 14-Day Volatility Prediction Endpoint Calling Actual Trained CatBoost ML Backend
const handlePredictVolatility = (req: Request, res: Response) => {
  // Check if simulated disconnected or model files missing
  if (modelSimulatedDisconnected) {
    return res.status(503).json({
      success: false,
      error_type: 'MODEL_UNAVAILABLE',
      message: 'ML Model Service Unavailable: The trained CatBoost ML backend is currently disconnected or in maintenance mode. No forecast could be generated.'
    });
  }

  if (!fs.existsSync(catboostModelPath) || !fs.existsSync(predictScriptPath)) {
    return res.status(503).json({
      success: false,
      error_type: 'MODEL_UNAVAILABLE',
      message: 'ML Model Service Unavailable: Trained CatBoost model artifact (catboost_volatility_model.cbm) is missing from the server environment.'
    });
  }

  const payload = req.body || {};
  const jsonParam = JSON.stringify(payload);

  const py = spawn('python3', [predictScriptPath, `--json=${jsonParam}`]);

  let stdout = '';
  let stderr = '';

  py.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  py.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  py.on('close', (code) => {
    if (code !== 0) {
      return res.status(503).json({
        success: false,
        error_type: 'PREDICTION_FAILED',
        message: `ML execution error (Exit code ${code}): ${stderr || 'Unknown Python process error.'}`
      });
    }

    try {
      const trimmed = stdout.trim();
      const jsonStart = trimmed.indexOf('{');
      const jsonEnd = trimmed.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in ML process output.');
      }
      const jsonStr = trimmed.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (!parsed.success) {
        return res.status(503).json(parsed);
      }
      res.json(parsed);
    } catch {
      res.status(502).json({
        success: false,
        error_type: 'INVALID_MODEL_OUTPUT',
        message: 'Failed to parse inference response from CatBoost ML backend.',
        raw: stdout.substring(0, 500)
      });
    }
  });

  py.on('error', (err) => {
    res.status(503).json({
      success: false,
      error_type: 'PROCESS_SPAWN_ERROR',
      message: `Failed to invoke Python ML pipeline: ${err.message}`
    });
  });
};

app.post('/api/predict-volatility', handlePredictVolatility);
app.post('/api/forecast/predict', handlePredictVolatility);

// Start Express server and mount Vite
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriPulse AI] Server running on port ${PORT} (Prod: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
