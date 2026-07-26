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
  
  // Section 4
  heardFrom: string;
  addToCommunity: string;
  finalSuggestions: string;
  
  // Bonus
  threeWords: string;
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

export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  type: 'image' | 'video';
  createdAt: string;
}

const GALLERY_KEY = 'twb_gallery';

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const data = await kv.get(GALLERY_KEY);
  if (!data) return [];
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as GalleryItem[];
    } else {
      return data as any as GalleryItem[];
    }
  } catch (e) {
    console.error("Failed to parse Gallery JSON from Redis", e);
    return [];
  }
}

export async function saveGalleryItems(items: GalleryItem[]): Promise<void> {
  await kv.set(GALLERY_KEY, JSON.stringify(items));
}
