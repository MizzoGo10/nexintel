import { storage } from "./storage";

export interface RapperAgent {
  id: string;
  name: string;
  stageName: string;
  style: "trap" | "drill" | "underground" | "commercial" | "experimental";
  bio: string;
  avatar: string;
  socialLinks: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
}

export interface MusicTrack {
  id: string;
  title: string;
  artistId: string;
  duration: number; // seconds
  genre: string[];
  mood: "aggressive" | "chill" | "hype" | "dark" | "motivational";
  bpm: number;
  releaseDate: Date;
  isExclusive: boolean;
  exclusivityLevel: "public" | "premium" | "underground" | "mafia_only" | "panther_exclusive";
  audioUrl: string;
  waveformData: number[];
  lyrics?: string;
  credits: string[];
  playCount: number;
  likes: number;
  price?: number; // in underground coin
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: string[];
  createdBy: string;
  isPublic: boolean;
  exclusivityLevel: "public" | "premium" | "underground";
  coverArt: string;
  duration: number;
  playCount: number;
  createdAt: Date;
}

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  type: "public" | "premium" | "underground";
  subscriptionRequired: boolean;
  price: number; // $200 for 6 months premium
  currentTrack?: MusicTrack;
  schedule: RadioShow[];
  listeners: number;
  isLive: boolean;
  streamUrl: string;
}

export interface RadioShow {
  id: string;
  name: string;
  description: string;
  hostId: string;
  stationId: string;
  schedule: {
    dayOfWeek: number; // 0-6
    startTime: string; // HH:MM
    duration: number; // minutes
  };
  type: "music" | "podcast" | "interview" | "auction_preview" | "exclusive_content";
  exclusivityLevel: "public" | "premium" | "underground";
  slotPrice?: number; // cost to buy time slot
  isAvailable: boolean;
  episodes: RadioEpisode[];
}

export interface RadioEpisode {
  id: string;
  showId: string;
  title: string;
  description: string;
  airDate: Date;
  duration: number;
  audioUrl: string;
  exclusiveContent: boolean;
  auctionItems?: AuctionPreview[];
  guestArtists?: string[];
}

export interface AuctionPreview {
  id: string;
  itemName: string;
  description: string;
  startingBid: number;
  auctionType: "mafia" | "panther" | "underground";
  previewImages: string[];
  rarity: "common" | "rare" | "ultra_rare" | "legendary" | "panther_exclusive";
  auctionDate: Date;
}

export interface UndergroundCoin {
  symbol: string;
  name: string;
  totalSupply: number;
  circulating: number;
  price: number; // in USD
  holders: number;
  transactions24h: number;
  volume24h: number;
}

export class RapperAgentMusicSystem {
  private rapperAgents: Map<string, RapperAgent> = new Map();
  private musicTracks: Map<string, MusicTrack> = new Map();
  private playlists: Map<string, MusicPlaylist> = new Map();
  private radioStations: Map<string, RadioStation> = new Map();
  private radioShows: Map<string, RadioShow> = new Map();
  private undergroundCoin: UndergroundCoin;
  private currentlyPlaying: Map<string, string> = new Map(); // userId -> trackId

  constructor() {
    this.initializeUndergroundCoin();
    this.initializeRapperAgents();
    this.initializeMusicTracks();
    this.initializeRadioStations();
    this.startMusicEngine();
  }

  private initializeUndergroundCoin() {
    this.undergroundCoin = {
      symbol: "UGROUND",
      name: "Underground Coin",
      totalSupply: 1000000,
      circulating: 650000,
      price: 2.47,
      holders: 2847,
      transactions24h: 156,
      volume24h: 847592.34
    };
  }

  private initializeRapperAgents() {
    const mainRapper: RapperAgent = {
      id: "rapper-agent-001",
      name: "Marcus 'Flow' Johnson",
      stageName: "Nexus Flow",
      style: "underground",
      bio: "AI-powered rapper agent specializing in trading-themed underground tracks. Known for beats that mirror market volatility and lyrics that speak to the hustle.",
      avatar: "/assets/rapper-avatar.jpg",
      socialLinks: {
        instagram: "@nexusflow_official",
        twitter: "@nexusflow_music",
        soundcloud: "nexusflow"
      },
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) // 90 days ago
    };

    const secondRapper: RapperAgent = {
      id: "rapper-agent-002",
      name: "Crystal 'Cipher' Williams",
      stageName: "Dark Cipher",
      style: "drill",
      bio: "Underground drill artist creating exclusive content for the syndicate. Specializes in dark, atmospheric tracks for high-stakes trading sessions.",
      avatar: "/assets/cipher-avatar.jpg",
      socialLinks: {
        instagram: "@darkcipher_underground",
        soundcloud: "darkcipher_official"
      },
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) // 60 days ago
    };

    this.rapperAgents.set(mainRapper.id, mainRapper);
    this.rapperAgents.set(secondRapper.id, secondRapper);
  }

  private initializeMusicTracks() {
    const tracks: MusicTrack[] = [
      {
        id: "track-001",
        title: "Profit Margins",
        artistId: "rapper-agent-001",
        duration: 187,
        genre: ["trap", "trading"],
        mood: "hype",
        bpm: 140,
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        isExclusive: false,
        exclusivityLevel: "public",
        audioUrl: "/music/profit-margins.mp3",
        waveformData: Array.from({length: 100}, () => Math.random() * 100),
        lyrics: "Making moves in the market, profit margins tight\nEvery trade calculated, staying up all night\nCharts and candles, that's my crystal ball\nFrom the bottom to the top, watch me rise and fall",
        credits: ["Nexus Flow", "Beat Producer: AI Engine"],
        playCount: 15847,
        likes: 2341
      },
      {
        id: "track-002", 
        title: "Underground Protocol",
        artistId: "rapper-agent-002",
        duration: 203,
        genre: ["drill", "dark"],
        mood: "dark",
        bpm: 128,
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        isExclusive: true,
        exclusivityLevel: "underground",
        audioUrl: "/music/underground-protocol.mp3",
        waveformData: Array.from({length: 100}, () => Math.random() * 100),
        lyrics: "Moving in shadows, protocol intact\nUnderground dealings, that's a fact\nNo rules apply when the money's right\nSyndicate business through the night",
        credits: ["Dark Cipher", "Producer: Shadow Beats"],
        playCount: 8934,
        likes: 1876,
        price: 50 // underground coin
      },
      {
        id: "track-003",
        title: "Flash Arbitrage Flow",
        artistId: "rapper-agent-001", 
        duration: 156,
        genre: ["trap", "electronic"],
        mood: "aggressive",
        bpm: 160,
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        isExclusive: true,
        exclusivityLevel: "premium",
        audioUrl: "/music/flash-arbitrage.mp3",
        waveformData: Array.from({length: 100}, () => Math.random() * 100),
        lyrics: "Lightning speed, arbitrage king\nFlash loans hitting, hear the registers ring\nNanosecond timing, profit in between\nFastest in the game, trading machine",
        credits: ["Nexus Flow", "Feature: Trading AI"],
        playCount: 12456,
        likes: 3124
      },
      {
        id: "track-004",
        title: "Panther Exclusive",
        artistId: "rapper-agent-002",
        duration: 234,
        genre: ["experimental", "ambient"],
        mood: "dark",
        bpm: 85,
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        isExclusive: true,
        exclusivityLevel: "panther_exclusive",
        audioUrl: "/music/panther-exclusive.mp3",
        waveformData: Array.from({length: 100}, () => Math.random() * 100),
        lyrics: "Panther in the shadows, stalking the prey\nExclusive access, members only way\nRarest of rare, what money can't buy\nPanther production, reaching for the sky",
        credits: ["Dark Cipher", "Exclusive Production"],
        playCount: 892,
        likes: 456,
        price: 500 // underground coin
      }
    ];

    tracks.forEach(track => {
      this.musicTracks.set(track.id, track);
    });
  }

  private initializeRadioStations() {
    const premiumStation: RadioStation = {
      id: "nexus-radio-premium",
      name: "Nexus Radio Premium",
      description: "Premium trading radio with exclusive artist content and market insights",
      frequency: "107.3 FM",
      type: "premium",
      subscriptionRequired: true,
      price: 200, // $200 for 6 months
      schedule: [],
      listeners: 1247,
      isLive: true,
      streamUrl: "https://stream.nexusradio.live/premium"
    };

    const undergroundStation: RadioStation = {
      id: "syndicate-underground",
      name: "Syndicate Underground",
      description: "Underground radio with exclusive content, auction previews, and panther productions",
      frequency: "666.6 FM",
      type: "underground",
      subscriptionRequired: true,
      price: 500, // underground coin
      schedule: [],
      listeners: 456,
      isLive: true,
      streamUrl: "https://stream.syndicate.underground/live"
    };

    const publicStation: RadioStation = {
      id: "nexus-radio-public",
      name: "Nexus Radio",
      description: "Public trading radio with basic content and artist previews",
      frequency: "95.7 FM", 
      type: "public",
      subscriptionRequired: false,
      price: 0,
      schedule: [],
      listeners: 5678,
      isLive: true,
      streamUrl: "https://stream.nexusradio.live/public"
    };

    this.radioStations.set(premiumStation.id, premiumStation);
    this.radioStations.set(undergroundStation.id, undergroundStation);
    this.radioStations.set(publicStation.id, publicStation);

    this.initializeRadioShows();
  }

  private initializeRadioShows() {
    const shows: RadioShow[] = [
      {
        id: "show-001",
        name: "Trading Floor Sessions",
        description: "Live trading music mixed with market analysis",
        hostId: "rapper-agent-001",
        stationId: "nexus-radio-premium",
        schedule: {
          dayOfWeek: 1, // Monday
          startTime: "09:00",
          duration: 120
        },
        type: "music",
        exclusivityLevel: "premium",
        slotPrice: 1000,
        isAvailable: false,
        episodes: []
      },
      {
        id: "show-002", 
        name: "Underground Auction Preview",
        description: "Exclusive previews of upcoming panther and mafia auction events",
        hostId: "rapper-agent-002",
        stationId: "syndicate-underground",
        schedule: {
          dayOfWeek: 5, // Friday
          startTime: "22:00",
          duration: 90
        },
        type: "auction_preview",
        exclusivityLevel: "underground",
        slotPrice: 5000, // underground coin
        isAvailable: false,
        episodes: []
      },
      {
        id: "show-003",
        name: "Product Spotlight",
        description: "Featured products and agent showcases",
        hostId: "system",
        stationId: "nexus-radio-premium",
        schedule: {
          dayOfWeek: 3, // Wednesday
          startTime: "15:00",
          duration: 60
        },
        type: "podcast",
        exclusivityLevel: "premium",
        slotPrice: 500,
        isAvailable: true,
        episodes: []
      },
      {
        id: "show-004",
        name: "Panther Exclusive Hour",
        description: "Ultra-rare content and panther production previews",
        hostId: "rapper-agent-002",
        stationId: "syndicate-underground",
        schedule: {
          dayOfWeek: 6, // Saturday
          startTime: "23:00",
          duration: 60
        },
        type: "exclusive_content",
        exclusivityLevel: "underground",
        slotPrice: 10000, // underground coin
        isAvailable: false,
        episodes: []
      }
    ];

    shows.forEach(show => {
      this.radioShows.set(show.id, show);
    });
  }

  private startMusicEngine() {
    // Simulate live music and radio updates
    setInterval(() => {
      this.updateRadioStations();
      this.updatePlayCounts();
    }, 30000); // Every 30 seconds

    storage.createActivity({
      agentId: "rapper-music-system",
      type: "system_initialized",
      description: "Rapper agent music system initialized with radio stations and exclusive content",
      projectId: "music-platform",
      metadata: {
        rapperAgents: this.rapperAgents.size,
        musicTracks: this.musicTracks.size,
        radioStations: this.radioStations.size,
        undergroundCoinPrice: this.undergroundCoin.price
      }
    });
  }

  private updateRadioStations() {
    // Simulate listener count changes
    this.radioStations.forEach(station => {
      const change = Math.floor(Math.random() * 20) - 10;
      station.listeners = Math.max(0, station.listeners + change);
    });
  }

  private updatePlayCounts() {
    // Simulate track plays
    this.musicTracks.forEach(track => {
      if (Math.random() < 0.3) { // 30% chance per update
        track.playCount += Math.floor(Math.random() * 5) + 1;
      }
    });
  }

  async playTrack(userId: string, trackId: string): Promise<{ success: boolean; track?: MusicTrack; requiresPayment?: boolean; price?: number }> {
    const track = this.musicTracks.get(trackId);
    if (!track) {
      return { success: false };
    }

    // Check if track requires payment
    if (track.isExclusive && track.price && track.exclusivityLevel !== "public") {
      return { 
        success: false, 
        requiresPayment: true, 
        price: track.price,
        track
      };
    }

    // Set as currently playing
    this.currentlyPlaying.set(userId, trackId);

    // Increment play count
    track.playCount += 1;

    storage.createActivity({
      agentId: "rapper-music-system",
      type: "track_played",
      description: `Track "${track.title}" played by ${track.artistId}`,
      projectId: "music-platform",
      metadata: { userId, trackId, title: track.title, artist: track.artistId }
    });

    return { success: true, track };
  }

  async purchaseTrack(userId: string, trackId: string, paymentMethod: "usd" | "underground_coin"): Promise<{ success: boolean; track?: MusicTrack }> {
    const track = this.musicTracks.get(trackId);
    if (!track || !track.price) {
      return { success: false };
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    storage.createActivity({
      agentId: "rapper-music-system",
      type: "track_purchased",
      description: `Exclusive track "${track.title}" purchased for ${track.price} ${paymentMethod}`,
      projectId: "music-platform",
      metadata: { userId, trackId, price: track.price, paymentMethod }
    });

    return { success: true, track };
  }

  async subscribeToRadio(userId: string, stationId: string, paymentMethod: "usd" | "underground_coin"): Promise<{ success: boolean; subscription?: any }> {
    const station = this.radioStations.get(stationId);
    if (!station || !station.subscriptionRequired) {
      return { success: false };
    }

    const subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      stationId,
      price: station.price,
      paymentMethod,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 6 months
      isActive: true
    };

    storage.createActivity({
      agentId: "rapper-music-system",
      type: "radio_subscription",
      description: `Radio subscription to ${station.name} for 6 months`,
      projectId: "music-platform",
      metadata: { userId, stationId, price: station.price, paymentMethod }
    });

    return { success: true, subscription };
  }

  async buyRadioSlot(agentId: string, showId: string, duration: number): Promise<{ success: boolean; slot?: any }> {
    const show = this.radioShows.get(showId);
    if (!show || !show.isAvailable || !show.slotPrice) {
      return { success: false };
    }

    const slot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      showId,
      agentId,
      duration,
      price: show.slotPrice,
      scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Next week
      isConfirmed: true
    };

    storage.createActivity({
      agentId: "rapper-music-system",
      type: "radio_slot_purchased",
      description: `Radio slot purchased on ${show.name} for ${duration} minutes`,
      projectId: "music-platform",
      metadata: { agentId, showId, duration, price: show.slotPrice }
    });

    return { success: true, slot };
  }

  getCurrentlyPlaying(userId: string): MusicTrack | undefined {
    const trackId = this.currentlyPlaying.get(userId);
    return trackId ? this.musicTracks.get(trackId) : undefined;
  }

  getTracksByArtist(artistId: string): MusicTrack[] {
    return Array.from(this.musicTracks.values()).filter(track => track.artistId === artistId);
  }

  getExclusiveTracks(exclusivityLevel: string): MusicTrack[] {
    return Array.from(this.musicTracks.values()).filter(track => 
      track.isExclusive && track.exclusivityLevel === exclusivityLevel
    );
  }

  getRadioStations(): RadioStation[] {
    return Array.from(this.radioStations.values());
  }

  getRadioShows(stationId?: string): RadioShow[] {
    const shows = Array.from(this.radioShows.values());
    return stationId ? shows.filter(show => show.stationId === stationId) : shows;
  }

  getAvailableRadioSlots(): RadioShow[] {
    return Array.from(this.radioShows.values()).filter(show => show.isAvailable);
  }

  getRapperAgents(): RapperAgent[] {
    return Array.from(this.rapperAgents.values());
  }

  getUndergroundCoin(): UndergroundCoin {
    return this.undergroundCoin;
  }

  getMusicStats() {
    const totalTracks = this.musicTracks.size;
    const exclusiveTracks = Array.from(this.musicTracks.values()).filter(t => t.isExclusive).length;
    const totalPlays = Array.from(this.musicTracks.values()).reduce((sum, t) => sum + t.playCount, 0);
    const totalListeners = Array.from(this.radioStations.values()).reduce((sum, s) => sum + s.listeners, 0);

    return {
      totalTracks,
      exclusiveTracks,
      totalPlays,
      totalListeners,
      rapperAgents: this.rapperAgents.size,
      radioStations: this.radioStations.size,
      activeShows: Array.from(this.radioShows.values()).filter(s => !s.isAvailable).length,
      undergroundCoinPrice: this.undergroundCoin.price
    };
  }
}

export const rapperMusicSystem = new RapperAgentMusicSystem();