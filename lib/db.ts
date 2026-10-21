import Redis from 'ioredis';

const redisUrl = process.env.KV_REDIS_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';

if (!redisUrl) {
  throw new Error("Redis URL is missing! Database is not connected properly in Vercel Environment Variables.");
}

export const kv = new Redis(redisUrl);

export interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue?: string;
  requiresPayment?: boolean;
  amount?: number;
  participantLimit: number;
  waitlistThreshold?: number;
  eventType?: 'community' | 'doubles'; // Event category
  isActive: boolean; // For Registrations
  isFeedbackOpen?: boolean; // For Feedback
  createdAt: string;
}

export interface PlayerRegistration {
  eventId: string;
  checkInStatus: 'Pending' | 'Checked In';
  timeWhenCheckedIn: string | null;
  registrationStatus?: 'Confirmed' | 'Waitlisted';
  paymentStatus?: 'Paid' | 'Pending' | 'Failed';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

// Define the player interface
export interface Player {
  id: string; // TWB-001
  qrId: string; // The unique ID for the QR code
  name: string;
  email: string;
  phone: string;
  age?: string;
  proficiency: string;
  duration: string;
  shoes: string;
  heardFrom: string;
  firstSeen: string; // ISO timestamp
  lastActive: string; // ISO timestamp
  eventsAttended: number;
  
  registrations: PlayerRegistration[];
  
  // Legacy fields (optional)
  checkInStatus?: 'Pending' | 'Checked In';
  timeWhenCheckedIn?: string | null;
  razorpay_payment_id?: string;
  payment_status?: 'Paid' | 'Pending' | 'Free';
}

const ROSTER_KEY = 'twb_roster';
const EVENTS_KEY = 'twb_events';
const FEEDBACK_KEY = 'twb_feedbacks';

export interface Feedback {
  id: string;
  submittedAt: string;
  eventId?: string;
  eventName?: string;
  playerName?: string;
  
  // Section 1
  overallRating: number; // 1-5
  likelyToAttend: number; // 0-10
  nps: number; // 0-10
  
  // Section 2
  enjoyedMost: string;
  ratings: {
    organization: string;
    scheduling: string;
    venue: string;
    gameQuality: string;
    communityVibe: string;
    hosts: string;
    refreshments: string;
  };
  matchesFair: string;
  enoughPlayTime: string;
  durationAppropriate: string;
  
  // Section 3
  improvements: string;
  issuesFaced: string;
  futureEventsWanted: string[];
  preferredDays: string[];
  preferredAreas: string[];
  
  // Section 4
  heardFrom: string;
  addToCommunity: string;
  finalSuggestions: string;
  
  // Bonus
  threeWords?: string; // Legacy
  dynamicQuestion?: string;
  dynamicAnswer?: string;
}

export async function getFeedbacks(): Promise<Feedback[]> {
  const data = await kv.get(FEEDBACK_KEY);
  if (!data) return [];
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as Feedback[];
    }
    return data as any as Feedback[];
  } catch (e) {
    console.error("Failed to parse Feedbacks JSON from Redis", e);
    return [];
  }
}

export async function saveFeedbacks(feedbacks: Feedback[]): Promise<void> {
  await kv.set(FEEDBACK_KEY, JSON.stringify(feedbacks));
}

export async function getEvents(): Promise<Event[]> {
  const data = await kv.get(EVENTS_KEY);
  if (!data) return [];
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as Event[];
    } else {
      return data as any as Event[];
    }
  } catch (e) {
    console.error("Failed to parse Events JSON from Redis", e);
    return [];
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  await kv.set(EVENTS_KEY, JSON.stringify(events));
}

// Read all players
export async function getPlayers(): Promise<Player[]> {
  const data = await kv.get(ROSTER_KEY);
  if (!data) return [];
  try {
    let players: Player[] = [];
    if (typeof data === 'string') {
      players = JSON.parse(data) as Player[];
    } else {
      players = data as any as Player[];
    }
    
    // Auto-migrate legacy players on the fly if they lack registrations array
    let needsSave = false;
    players.forEach(p => {
      if (!p.registrations) {
        p.registrations = [];
        if (p.checkInStatus) {
           p.registrations.push({
             eventId: 'legacy_event',
             checkInStatus: p.checkInStatus,
             timeWhenCheckedIn: p.timeWhenCheckedIn || null
           });
        }
        needsSave = true;
      }
    });
    
    if (needsSave) {
      // Background save to upgrade the schema
      savePlayers(players).catch(console.error);
    }
    
    return players;
  } catch (e) {
    console.error("Failed to parse JSON from Redis", e);
    return [];
  }
}

// Write all players
export async function savePlayers(players: Player[]): Promise<void> {
  await kv.set(ROSTER_KEY, JSON.stringify(players));
}

// Find a player by QR ID
export async function getPlayerByQrId(qrId: string): Promise<Player | undefined> {
  const players = await getPlayers();
  return players.find((p) => p.qrId === qrId);
}

// Find a player by Email
export async function getPlayerByEmail(email: string): Promise<Player | undefined> {
  const players = await getPlayers();
  return players.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

// Add or update a player
export async function upsertPlayer(player: Player): Promise<void> {
  const players = await getPlayers();
  const index = players.findIndex((p) => p.id === player.id);

  if (index !== -1) {
    players[index] = player;
  } else {
    players.push(player);
  }

  await savePlayers(players);
}

// Generate the next Player ID (e.g., TWB-001)
export async function generateNextPlayerId(): Promise<string> {
  const players = await getPlayers();
  let maxId = 0;

  for (const player of players) {
    if (player.id.startsWith('TWB-')) {
      const num = parseInt(player.id.replace('TWB-', ''), 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
  }

  return `TWB-${(maxId + 1).toString().padStart(3, '0')}`;
}

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  age?: string;
  proficiency: string;
  duration: string;
  shoes: string;
  heardFrom: string;
}

export async function savePendingRegistration(email: string, data: PendingRegistration): Promise<void> {
  const key = `pending_reg:${email.toLowerCase()}`;
  // Set with an expiration of 2 hours
  await kv.set(key, JSON.stringify(data), 'EX', 7200);
}

export async function getPendingRegistration(email: string): Promise<PendingRegistration | null> {
  const key = `pending_reg:${email.toLowerCase()}`;
  const data = await kv.get(key);
  if (!data) return null;
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as PendingRegistration;
    } else {
      return data as any as PendingRegistration;
    }
  } catch (e) {
    console.error("Failed to parse pending reg from Redis", e);
    return null;
  }
}

export async function deletePendingRegistration(email: string): Promise<void> {
  const key = `pending_reg:${email.toLowerCase()}`;
  await kv.del(key);
}

export interface OrderRegistrationData {
  name: string;
  email: string;
  phone: string;
  age?: string;
  proficiency?: string;
  duration?: string;
  shoes?: string;
  heardFrom?: string;
  eventId: string;
}

export async function saveOrderRegistration(orderId: string, data: OrderRegistrationData): Promise<void> {
  const key = `order_reg:${orderId}`;
  // Keep for 24 hours (86400 seconds)
  await kv.set(key, JSON.stringify(data), 'EX', 86400);
}

export async function getOrderRegistration(orderId: string): Promise<OrderRegistrationData | null> {
  const key = `order_reg:${orderId}`;
  const data = await kv.get(key);
  if (!data) return null;
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as OrderRegistrationData;
    } else {
      return data as any as OrderRegistrationData;
    }
  } catch (e) {
    console.error("Failed to parse order reg from Redis", e);
    return null;
  }
}

export async function deleteOrderRegistration(orderId: string): Promise<void> {
  const key = `order_reg:${orderId}`;
  await kv.del(key);
}


export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  type: 'image' | 'video';
  createdAt: string;
}

const GALLERY_KEY = 'twb_gallery';

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal_1",
    url: "/uploads/upload_1784530584477-865641431.jpg",
    alt: "RacketHeads Kochi Squad on Court",
    type: "image",
    createdAt: "2026-07-20T12:26:00.000Z"
  },
  {
    id: "gal_2",
    url: "/uploads/upload_1784530539969-112259766.jpg",
    alt: "RacketHeads Badminton Action",
    type: "image",
    createdAt: "2026-07-20T12:25:00.000Z"
  },
  {
    id: "gal_3",
    url: "/uploads/upload_1784530226010-378221633.jpg",
    alt: "Court Warmup and Smashes",
    type: "image",
    createdAt: "2026-07-20T12:20:00.000Z"
  },
  {
    id: "gal_4",
    url: "/uploads/upload_1784530196186-313953377.jpg",
    alt: "Badminton Doubles Session",
    type: "image",
    createdAt: "2026-07-20T12:19:00.000Z"
  },
  {
    id: "gal_5",
    url: "/uploads/upload_1784529967483-321472478.jpg",
    alt: "Weekend Game Rally",
    type: "image",
    createdAt: "2026-07-20T12:16:00.000Z"
  },
  {
    id: "gal_6",
    url: "/uploads/upload_1784529751203-991221310.jpg",
    alt: "Match Highlights",
    type: "image",
    createdAt: "2026-07-20T12:12:00.000Z"
  },
  {
    id: "gal_7",
    url: "/uploads/upload_1784529740897-211596810.jpg",
    alt: "Community Smiles",
    type: "image",
    createdAt: "2026-07-20T12:12:00.000Z"
  },
  {
    id: "gal_8",
    url: "/uploads/upload_1784529488207-659977027.jpg",
    alt: "Post Match Energy",
    type: "image",
    createdAt: "2026-07-20T12:08:00.000Z"
  },
  {
    id: "gal_9",
    url: "/uploads/upload_1784529419919-496364669.jpg",
    alt: "Warmup & Squad Energy",
    type: "image",
    createdAt: "2026-07-20T12:06:00.000Z"
  },
  {
    id: "gal_v1",
    url: "/uploads/upload_1784529617794-310052347.mp4",
    alt: "Smash Rally Reel",
    type: "video",
    createdAt: "2026-07-20T12:10:00.000Z"
  },
  {
    id: "gal_v2",
    url: "/uploads/upload_1784529661715-787593625.mp4",
    alt: "Court Highlights & Action",
    type: "video",
    createdAt: "2026-07-20T12:11:00.000Z"
  }
];

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const data = await kv.get(GALLERY_KEY);
    if (!data) return DEFAULT_GALLERY_ITEMS;
    
    let items: GalleryItem[] = [];
    if (typeof data === 'string') {
      items = JSON.parse(data) as GalleryItem[];
    } else {
      items = data as any as GalleryItem[];
    }

    // Filter out broken discontinued vercel-storage blob URLs if any
    const validItems = items.filter(it => it && it.url && !it.url.includes('gzjt0cyyan0lyo3j.public.blob.vercel-storage.com'));
    if (validItems.length === 0) {
      return DEFAULT_GALLERY_ITEMS;
    }
    return validItems;
  } catch (e) {
    console.error("Failed to parse Gallery JSON from Redis", e);
    return DEFAULT_GALLERY_ITEMS;
  }
}

export async function saveGalleryItems(items: GalleryItem[]): Promise<void> {
  await kv.set(GALLERY_KEY, JSON.stringify(items));
}

// --- Analytics Tracking ---

const VIEWS_KEY = 'twb_analytics:total_views';
const LOCATIONS_KEY = 'twb_analytics:locations';

export async function incrementPageView(location?: string): Promise<void> {
  await kv.incr(VIEWS_KEY);
  if (location && location !== 'Unknown') {
    // Increment the score for this location in the sorted set
    await kv.zincrby(LOCATIONS_KEY, 1, location);
  }
}

export interface AnalyticsData {
  totalViews: number;
  topLocations: { location: string; count: number }[];
  pendingDrafts: number;
  draftNames?: string[];
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const viewsStr = await kv.get(VIEWS_KEY);
  const totalViews = viewsStr ? parseInt(String(viewsStr), 10) : 0;

  // Get top 10 locations (highest score first)
  const locationsData = await kv.zrevrange(LOCATIONS_KEY, 0, 9, 'WITHSCORES');
  
  const topLocations: { location: string; count: number }[] = [];
  
  // kv.zrevrange with WITHSCORES returns [member, score, member, score...]
  for (let i = 0; i < locationsData.length; i += 2) {
    topLocations.push({
      location: String(locationsData[i]),
      count: parseInt(String(locationsData[i + 1]), 10)
    });
  }

  // Get count of active draft/pending registrations
  const pendingKeys = await kv.keys('pending_reg:*');
  const pendingDrafts = pendingKeys.length;
  
  const draftNames: string[] = [];
  if (pendingKeys.length > 0) {
    const draftValues = await Promise.all(pendingKeys.map(key => kv.get(key)));
    for (const val of draftValues) {
      if (val) {
        try {
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          if (parsed && parsed.name) {
            draftNames.push(parsed.name);
          }
        } catch (e) {}
      }
    }
  }

  return { totalViews, topLocations, pendingDrafts, draftNames };
}

export interface FeedbackSettings {
  customQuestionText: string;
  customQuestionOptions: string[];
}

const FEEDBACK_SETTINGS_KEY = 'twb_feedback_settings';

export async function getFeedbackSettings(): Promise<FeedbackSettings> {
  const data = await kv.get(FEEDBACK_SETTINGS_KEY);
  if (!data) return {
    customQuestionText: 'WHICH AREA IN THE CITY WOULD YOU PREFER FOR OUR FUTURE EVENTS?',
    customQuestionOptions: ['KAKKANAD/TRIKKAKARA', 'THAMMANAM', 'KALOOR / KADAVANTHRA / KATHRIKADAVU', 'TRIPUNITHURA']
  };
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as FeedbackSettings;
    }
    return data as any as FeedbackSettings;
  } catch (e) {
    console.error("Failed to parse FeedbackSettings JSON from Redis", e);
    return {
      customQuestionText: 'WHICH AREA IN THE CITY WOULD YOU PREFER FOR OUR FUTURE EVENTS?',
      customQuestionOptions: ['KAKKANAD/TRIKKAKARA', 'THAMMANAM', 'KALOOR / KADAVANTHRA / KATHRIKADAVU', 'TRIPUNITHURA']
    };
  }
}

export async function saveFeedbackSettings(settings: FeedbackSettings): Promise<void> {
  await kv.set(FEEDBACK_SETTINGS_KEY, JSON.stringify(settings));
}
