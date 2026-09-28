import type { GeoPlace } from "./geo";

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "suspended"
  | "draft"
  | "published"
  | "verified"
  | "unverified"
  | "rejected"
  | "approved"
  | "failed"
  | "closed"
  | "completed"
  | "cancelled"
  | "open"
  | "paid"
  | "refunded";

export interface SocialAccount {
  platform: string;
  username: string;
  followers: number;
  engagement: number;
  verified: boolean;
  lastSynced: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: "image" | "video";
  brand: string;
  date: string;
}

export interface CreatorService {
  id: string;
  name: string;
  price: number;
  turnaround: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  categories: string[];
  languages: string[];
  /** Primary location — any country / region / city worldwide. */
  location: GeoPlace;
  /** Where the creator is willing to work (cities, countries, or "Remote / Worldwide"). */
  serviceLocations: string[];
  travelAvailable: boolean;
  remoteAvailable: boolean;
  currency: string;
  followers: number;
  engagement: number;
  platforms: string[];
  socials: SocialAccount[];
  portfolio: PortfolioItem[];
  services: CreatorService[];
  verification: "verified" | "pending" | "unverified";
  websiteStatus: "published" | "draft" | "suspended" | "none";
  websiteUrl?: string | undefined;
  websiteTemplate?: string | undefined;
  websiteVisits?: number | undefined;
  websitePublished?: string | undefined;
  status: "active" | "suspended" | "pending";
  subscription: string;
  joined: string;
  lastLogin: string;
  activity: { date: string; text: string }[];
}

export interface Business {
  id: string;
  name: string;
  logo: string;
  type: string;
  /** Headquarters. */
  location: GeoPlace;
  /** A business may operate in many cities / countries. */
  operatingLocations: { label: string; address: string; radiusKm: number }[];
  currency: string;
  contactName: string;
  email: string;
  phone: string;
  campaigns: number;
  subscription: string;
  status: "active" | "suspended" | "pending";
  verification: "verified" | "pending" | "unverified";
  joined: string;
  about: string;
  activity: { date: string; text: string }[];
}

export interface Campaign {
  id: string;
  title: string;
  businessId: string;
  business: string;
  category: string;
  budget: number;
  creators: number;
  applications: number;
  status:
    | "draft"
    | "published"
    | "applications"
    | "shortlisted"
    | "active"
    | "content submitted"
    | "completed"
    | "cancelled";
  created: string;
  deadline: string;
  location: string;
  currency: string;
}

export interface Requirement {
  id: string;
  title: string;
  business: string;
  category: string;
  location: string;
  currency: string;
  budget: number;
  creatorsNeeded: number;
  applications: number;
  status: "open" | "featured" | "hidden" | "closed";
  created: string;
}

export interface Website {
  id: string;
  creator: string;
  creatorId: string;
  url: string;
  template: string;
  status: "draft" | "published" | "suspended" | "domain pending" | "domain connected";
  domain: string;
  visitors: number;
  created: string;
  updated: string;
}

export interface DomainRecord {
  id: string;
  creator: string;
  domain: string;
  type: "custom" | "subdomain";
  verification: "pending" | "verified" | "failed";
  ssl: "active" | "pending" | "failed";
  websiteStatus: "published" | "draft" | "suspended";
  created: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: "active" | "inactive";
  oauth: boolean;
  api: boolean;
  activeCreators: number;
  created: string;
}

export interface PlatformRequest {
  id: string;
  platform: string;
  requestedBy: string;
  profileUrl: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  note: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  creators: number;
  order: number;
  status: "active" | "inactive";
}

export interface LocationNode {
  id: string;
  name: string;
  type: "country" | "region" | "district" | "city" | "area";
  status?: "active" | "inactive";
  creators: number;
  children?: LocationNode[];
}

export interface ServiceType {
  id: string;
  name: string;
  platform: string;
  creators: number;
  avgPrice: number;
  status: "active" | "inactive";
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "avatar" | "website";
  creator: string;
  size: number;
  uploaded: string;
}

export interface VerificationItem {
  id: string;
  kind: "creator" | "social" | "business";
  user: string;
  detail: string;
  submitted: string;
  status: "pending" | "approved" | "rejected" | "info requested";
}

export interface Plan {
  id: string;
  name: string;
  audience: "Influencer" | "Business";
  price: number;
  features: string[];
  activeUsers: number;
  monthlyRevenue: number;
  status: "active" | "inactive";
}

export interface Payment {
  id: string;
  user: string;
  type: "Subscription" | "Campaign" | "Service" | "Domain";
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  date: string;
  method: string;
}

export interface Ticket {
  id: string;
  user: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in progress" | "waiting" | "resolved" | "closed";
  created: string;
  assignee: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  kind: "system" | "user" | "campaign" | "verification";
  audience: string;
  schedule: string;
  status: "sent" | "scheduled" | "draft";
}

export interface AuditLog {
  id: string;
  datetime: string;
  admin: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  device: string;
  result: "success" | "failed";
}
