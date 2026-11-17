import type {
  AuditLog,
  Business,
  CampaignBid,
  CampaignBrief,
  TicketMessage,
  Campaign,
  Category,
  DomainRecord,
  Influencer,
  LocationNode,
  MediaItem,
  NotificationItem,
  Payment,
  Plan,
  PlatformRequest,
  Requirement,
  ServiceType,
  SocialPlatform,
  Ticket,
  VerificationItem,
  Website,
} from "./types";
import { money } from "./geo";
export { money } from "./geo";

/* ------------------------------------------------------------------ */
/* Reference & Taxonomy Constants                                      */
/* ------------------------------------------------------------------ */

export const CATEGORY_NAMES: string[] = [
  "Food",
  "Travel",
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Fitness",
  "Technology",
  "Gaming",
  "Education",
  "Photography",
  "Comedy",
  "Entertainment",
  "Parenting",
  "Business",
];

export const COUNTRY_OPTIONS: string[] = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Singapore",
  "Canada",
  "Australia",
];

export const CITY_OPTIONS: string[] = [
  "Kochi",
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Dubai",
  "Abu Dhabi",
  "London",
  "New York",
  "Singapore",
];

export const LANGUAGE_OPTIONS: string[] = [
  "English",
  "Malayalam",
  "Hindi",
  "Tamil",
  "Arabic",
  "Telugu",
  "Kannada",
];

export const STAFF_NAMES: string[] = [
  "Mohammed Fadhil",
  "Rehan Kurup",
  "Divya Suresh",
  "Nikhil Prasad",
  "Aparna Raj",
  "Sujith Menon",
];

/* ------------------------------------------------------------------ */
/* Clean Zero-Data Collections (Purged of all fake mock records)      */
/* ------------------------------------------------------------------ */

export const influencers: Influencer[] = [];
export const businesses: Business[] = [];
export const campaigns: Campaign[] = [];
export const requirements: Requirement[] = [];
export const websites: Website[] = [];
export const domains: DomainRecord[] = [];
export const socialPlatforms: SocialPlatform[] = [];
export const platformRequests: PlatformRequest[] = [];
export const categories: Category[] = [];
export const locations: LocationNode[] = [];
export const services: ServiceType[] = [];
export const media: MediaItem[] = [];
export const verifications: VerificationItem[] = [];
export const plans: Plan[] = [];
export const payments: Payment[] = [];
export const tickets: Ticket[] = [];
export const notifications: NotificationItem[] = [];
export const auditLogs: AuditLog[] = [];

/* ------------------------------------------------------------------ */
/* Roles & Permissions Matrix                                         */
/* ------------------------------------------------------------------ */

export const roles = [
  "Super Admin",
  "Admin",
  "Moderator",
  "Support",
  "Finance",
  "Content Manager",
] as const;

export const permissionMatrix: { area: string; levels: Record<string, string> }[] = [
  {
    area: "Influencers",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "View",
      Support: "View",
      Finance: "None",
      "Content Manager": "Manage",
    },
  },
  {
    area: "Businesses",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "View",
      Support: "View",
      Finance: "View",
      "Content Manager": "None",
    },
  },
  {
    area: "Campaigns",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "Moderate",
      Support: "View",
      Finance: "None",
      "Content Manager": "Moderate",
    },
  },
  {
    area: "Requirements",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "Moderate",
      Support: "View",
      Finance: "None",
      "Content Manager": "Moderate",
    },
  },
  {
    area: "Websites",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "Moderate",
      Support: "View",
      Finance: "None",
      "Content Manager": "Manage",
    },
  },
  {
    area: "Domains",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "None",
      Support: "View",
      Finance: "None",
      "Content Manager": "None",
    },
  },
  {
    area: "Social Platforms",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "View",
      Support: "None",
      Finance: "None",
      "Content Manager": "Manage",
    },
  },
  {
    area: "Payments",
    levels: {
      "Super Admin": "Full",
      Admin: "View",
      Moderator: "None",
      Support: "None",
      Finance: "Full",
      "Content Manager": "None",
    },
  },
  {
    area: "Subscriptions",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "None",
      Support: "View",
      Finance: "Manage",
      "Content Manager": "None",
    },
  },
  {
    area: "Support",
    levels: {
      "Super Admin": "Full",
      Admin: "Manage",
      Moderator: "View",
      Support: "Full",
      Finance: "None",
      "Content Manager": "None",
    },
  },
  {
    area: "Audit Logs",
    levels: {
      "Super Admin": "Full",
      Admin: "View",
      Moderator: "None",
      Support: "None",
      Finance: "View",
      "Content Manager": "None",
    },
  },
  {
    area: "Settings",
    levels: {
      "Super Admin": "Full",
      Admin: "Limited",
      Moderator: "None",
      Support: "None",
      Finance: "None",
      "Content Manager": "Limited",
    },
  },
];

export const adminStaff: { name: string; email: string; role: string; lastActive: string }[] = [];

/* ------------------------------------------------------------------ */
/* Analytics Series (Empty initial states)                            */
/* ------------------------------------------------------------------ */

export const userGrowth: { month: string; influencers: number; businesses: number }[] = [];
export const campaignActivity: {
  month: string;
  created: number;
  active: number;
  completed: number;
}[] = [];
export const revenueTrend: {
  month: string;
  subscription: number;
  services: number;
  refunds: number;
}[] = [];
export const revenueByPlan: { name: string; value: number }[] = [];
export const revenueByAccountType: { name: string; value: number }[] = [];
export const categoryDistribution: { name: string; value: number }[] = [];

/* ------------------------------------------------------------------ */
/* Zero Dashboard Stats                                                */
/* ------------------------------------------------------------------ */

export const dashboardStats = {
  totalInfluencers: 0,
  activeInfluencers: 0,
  totalBusinesses: 0,
  activeBusinesses: 0,
  activeCampaigns: 0,
  totalWebsites: 0,
  monthlyRevenue: 0,
  pendingRequests: 0,
};

/* ------------------------------------------------------------------ */
/* Helpers & Formatters                                               */
/* ------------------------------------------------------------------ */

/** @deprecated use money(amount, currency). Kept as base-currency alias. */
export const inr = (n: number) => money(n);

export const compact = (n: number) => {
  if (n >= 1000000000) return `${(n / 1000000000).toFixed(1)}B`;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

/* ------------------------------------------------------------------ */
/* Detail-page Lookups & Safe Zero Handlers                           */
/* ------------------------------------------------------------------ */

export const getInfluencer = (id: string): Influencer | undefined =>
  influencers.find((i) => i.id === id);

export const getBusiness = (id: string): Business | undefined =>
  businesses.find((b) => b.id === id);

export const getCampaign = (id: string): Campaign | undefined => campaigns.find((c) => c.id === id);

export const getRequirement = (id: string): Requirement | undefined =>
  requirements.find((r) => r.id === id);

export const getTicket = (id: string): Ticket | undefined => tickets.find((t) => t.id === id);

export const campaignsForBusiness = (_id: string): Campaign[] => [];

export interface SearchResultItem {
  group: string;
  id: string;
  label: string;
  sub?: string;
  to: string;
  params?: Record<string, string>;
}

export const globalSearch = (_term: string): SearchResultItem[] => [];

export function campaignBrief(c: Campaign): CampaignBrief {
  return {
    objective: c.title || "Campaign Objective",
    audience: c.location || "Target Audience",
    deliverables: [],
    escrow: c.status === "completed" ? "released" : "held in escrow",
  };
}

export function campaignBids(_c: Campaign): CampaignBid[] {
  return [];
}

export interface InterestedCreator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  city: string;
  date: string;
}

export function requirementBrief(req: Requirement): {
  brief: string;
  budgetMin: number;
  budgetMax: number;
  minFollowers: number;
  languages: string[];
  radiusKm: number;
  interested: InterestedCreator[];
} {
  return {
    brief: req.title || "Requirement Brief",
    budgetMin: req.budget || 0,
    budgetMax: req.budget || 0,
    minFollowers: 0,
    languages: [],
    radiusKm: 0,
    interested: [],
  };
}

export function ticketThread(_t: Ticket): {
  messages: TicketMessage[];
  notes: { author: string; body: string; time: string }[];
} {
  return {
    messages: [],
    notes: [],
  };
}
