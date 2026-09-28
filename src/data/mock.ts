import type {
  AuditLog,
  Business,
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

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random helpers (stable across SSR + client)    */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const pick = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export const CATEGORY_NAMES = [
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

export const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

const CITIES: Record<string, string[]> = {
  Thiruvananthapuram: ["Kazhakkoottam", "Neyyattinkara", "Varkala", "Attingal"],
  Kollam: ["Karunagappally", "Punalur", "Paravur"],
  Pathanamthitta: ["Adoor", "Thiruvalla", "Pandalam"],
  Alappuzha: ["Cherthala", "Kayamkulam", "Mararikulam"],
  Kottayam: ["Changanassery", "Pala", "Vaikom"],
  Idukki: ["Thodupuzha", "Munnar", "Kattappana"],
  Ernakulam: ["Kakkanad", "Fort Kochi", "Aluva", "Perumbavoor"],
  Thrissur: ["Guruvayur", "Chalakudy", "Irinjalakuda"],
  Palakkad: ["Ottapalam", "Shoranur", "Chittur"],
  Malappuram: ["Manjeri", "Tirur", "Perinthalmanna"],
  Kozhikode: ["Vadakara", "Koyilandy", "Feroke"],
  Wayanad: ["Kalpetta", "Sulthan Bathery", "Mananthavady"],
  Kannur: ["Thalassery", "Payyanur", "Mattannur"],
  Kasaragod: ["Kanhangad", "Nileshwaram", "Bekal"],
};

const FIRST = [
  "Anjali",
  "Arjun",
  "Nithya",
  "Fahad",
  "Meera",
  "Vishnu",
  "Aleena",
  "Rahul",
  "Devika",
  "Shanid",
  "Keerthi",
  "Ajmal",
  "Gopika",
  "Sreejith",
  "Hiba",
  "Manu",
  "Athira",
  "Basil",
  "Neethu",
  "Vivek",
  "Sana",
  "Jithin",
  "Ansa",
  "Praveen",
  "Lakshmi",
  "Ashiq",
  "Reshma",
  "Tom",
  "Parvathy",
  "Sidharth",
];

const LAST = [
  "Menon",
  "Nair",
  "Pillai",
  "Kurup",
  "Varghese",
  "Thomas",
  "Rahman",
  "Mohammed",
  "Krishnan",
  "Joseph",
  "Das",
  "Antony",
  "Shaji",
  "Iyer",
  "Sasi",
];

const PLATFORMS = [
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "X",
  "LinkedIn",
  "Snapchat",
  "Threads",
  "Pinterest",
  "Twitch",
];

const LANGUAGES = ["Malayalam", "English", "Tamil", "Hindi", "Kannada"];

const TEMPLATES = ["Kerala Minimal", "Backwater", "Spice Route", "Studio Dark", "Coastal", "Editorial"];

const SUBS_CREATOR = ["Free", "Pro", "Premium"];
const SUBS_BUSINESS = ["Free", "Pro", "Agency"];

const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel & Resort",
  "Fashion Retail",
  "Beauty & Wellness",
  "Jewellery",
  "Ayurveda",
  "Real Estate",
  "Education",
  "Healthcare",
  "Automobile",
  "Electronics",
  "Travel Agency",
];

const BUSINESS_NAMES = [
  "Kadal Kitchen",
  "Backwater Retreats",
  "Kochi Threads",
  "Ayur Bloom",
  "Malabar Gold House",
  "Nila Ayurveda",
  "Marine Drive Homes",
  "EduKerala Academy",
  "Amrita Care Clinics",
  "Zephyr Motors",
  "Techzone Kochi",
  "Spice Trails Travel",
  "Thattukada Co.",
  "Calicut Halwa House",
  "Varkala Surf Co.",
  "Munnar Leaf Estates",
  "Kuttanad Organics",
  "Bekal Beach Resort",
  "Thrissur Silks",
  "Periyar Coffee Roasters",
  "Nedumbassery Cabs",
  "Fort Kochi Art House",
  "Green Palm Wellness",
  "Alleppey Houseboats",
];

/* ------------------------------------------------------------------ */
/* Influencers                                                         */
/* ------------------------------------------------------------------ */

function dateStr(daysAgo: number) {
  const base = new Date("2026-09-28T00:00:00Z").getTime();
  return new Date(base - daysAgo * 86400000).toISOString().slice(0, 10);
}

export const influencers: Influencer[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng(i * 97 + 13);
  const first = pick(FIRST, r());
  const last = pick(LAST, r());
  const name = `${first} ${last}`;
  const handle = `${first.toLowerCase()}.${last.toLowerCase()}`;
  const district = pick(DISTRICTS, r());
  const city = pick(CITIES[district], r());
  const cats = [pick(CATEGORY_NAMES, r()), pick(CATEGORY_NAMES, r())].filter(
    (v, idx, a) => a.indexOf(v) === idx,
  );
  const platCount = 1 + Math.floor(r() * 4);
  const plats = Array.from({ length: platCount }, () => pick(PLATFORMS, r())).filter(
    (v, idx, a) => a.indexOf(v) === idx,
  );
  const followers = Math.floor(3000 + r() * 920000);
  const verification = pick(["verified", "verified", "pending", "unverified"] as const, r());
  const websiteStatus = pick(["published", "published", "draft", "suspended", "none"] as const, r());
  const status = pick(["active", "active", "active", "suspended", "pending"] as const, r());
  const joinedDays = Math.floor(30 + r() * 700);

  return {
    id: `INF-${String(1000 + i)}`,
    name,
    handle,
    avatar: `https://i.pravatar.cc/120?img=${(i % 70) + 1}`,
    bio: `${cats[0]} creator from ${city}, ${district}. Telling Kerala stories in ${pick(LANGUAGES, r())} and English.`,
    categories: cats,
    languages: ["Malayalam", pick(LANGUAGES, r())].filter((v, idx, a) => a.indexOf(v) === idx),
    district,
    city,
    followers,
    engagement: Number((1.2 + r() * 7).toFixed(2)),
    platforms: plats,
    socials: plats.map((p) => ({
      platform: p,
      username: `@${handle}`,
      followers: Math.floor(followers * (0.25 + r() * 0.75)),
      engagement: Number((1 + r() * 7).toFixed(2)),
      verified: r() > 0.45,
      lastSynced: dateStr(Math.floor(r() * 12)),
    })),
    portfolio: Array.from({ length: 3 + Math.floor(r() * 4) }, (_, k) => ({
      id: `P-${i}-${k}`,
      title: `${pick(["Reel", "Campaign film", "Photo series", "Review", "Vlog"], r())} — ${pick(BUSINESS_NAMES, r())}`,
      type: r() > 0.5 ? ("video" as const) : ("image" as const),
      brand: pick(BUSINESS_NAMES, r()),
      date: dateStr(Math.floor(r() * 400)),
    })),
    services: Array.from({ length: 2 + Math.floor(r() * 3) }, (_, k) => ({
      id: `S-${i}-${k}`,
      name: pick(
        [
          "Instagram Reel",
          "Instagram Post",
          "Story",
          "YouTube Video",
          "YouTube Short",
          "UGC",
          "Product Review",
          "Event Appearance",
          "Product Photography",
        ],
        r(),
      ),
      price: Math.floor((3 + r() * 60)) * 1000,
      turnaround: `${2 + Math.floor(r() * 10)} days`,
    })),
    verification,
    websiteStatus,
    websiteUrl: websiteStatus === "none" ? undefined : `${handle}.influencers.com`,
    websiteTemplate: websiteStatus === "none" ? undefined : pick(TEMPLATES, r()),
    websiteVisits: websiteStatus === "none" ? undefined : Math.floor(200 + r() * 48000),
    websitePublished: websiteStatus === "none" ? undefined : dateStr(Math.floor(r() * 300)),
    status,
    subscription: pick(SUBS_CREATOR, r()),
    joined: dateStr(joinedDays),
    lastLogin: dateStr(Math.floor(r() * 20)),
    activity: Array.from({ length: 5 }, (_, k) => ({
      date: dateStr(k * 3 + Math.floor(r() * 3)),
      text: pick(
        [
          "Updated portfolio",
          "Connected Instagram account",
          "Applied to a campaign",
          "Published website changes",
          "Changed subscription plan",
          "Submitted verification documents",
          "Added a new service",
        ],
        r(),
      ),
    })),
  };
});

/* ------------------------------------------------------------------ */
/* Businesses                                                          */
/* ------------------------------------------------------------------ */

export const businesses: Business[] = Array.from({ length: 24 }, (_, i) => {
  const r = rng(i * 313 + 7);
  const name = BUSINESS_NAMES[i % BUSINESS_NAMES.length];
  const district = pick(DISTRICTS, r());
  return {
    id: `BIZ-${String(2000 + i)}`,
    name,
    logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    type: pick(BUSINESS_TYPES, r()),
    district,
    city: pick(CITIES[district], r()),
    contactName: `${pick(FIRST, r())} ${pick(LAST, r())}`,
    email: `hello@${name.toLowerCase().replace(/[^a-z]/g, "")}.in`,
    phone: `+91 ${Math.floor(70000 + r() * 29999)} ${Math.floor(10000 + r() * 89999)}`,
    campaigns: Math.floor(r() * 18),
    subscription: pick(SUBS_BUSINESS, r()),
    status: pick(["active", "active", "active", "suspended", "pending"] as const, r()),
    verification: pick(["verified", "verified", "pending", "unverified"] as const, r()),
    joined: dateStr(Math.floor(40 + r() * 650)),
    about: `${name} is a ${pick(BUSINESS_TYPES, r()).toLowerCase()} brand based in ${district}, working with Kerala creators on always-on social campaigns.`,
    activity: Array.from({ length: 5 }, (_, k) => ({
      date: dateStr(k * 4 + Math.floor(r() * 3)),
      text: pick(
        [
          "Created a new campaign",
          "Shortlisted 4 creators",
          "Upgraded subscription",
          "Posted a requirement",
          "Paid invoice",
          "Invited a team member",
        ],
        r(),
      ),
    })),
  };
});

/* ------------------------------------------------------------------ */
/* Campaigns & requirements                                            */
/* ------------------------------------------------------------------ */

const CAMPAIGN_STATUSES: Campaign["status"][] = [
  "draft",
  "published",
  "applications",
  "shortlisted",
  "active",
  "content submitted",
  "completed",
  "cancelled",
];

export const campaigns: Campaign[] = Array.from({ length: 36 }, (_, i) => {
  const r = rng(i * 577 + 29);
  const biz = businesses[Math.floor(r() * businesses.length)];
  const created = Math.floor(r() * 260);
  return {
    id: `CMP-${String(3000 + i)}`,
    title: `${pick(["Onam", "Monsoon", "Festive", "Launch", "Summer", "Wedding Season", "Vishu"], r())} ${pick(["Reels Push", "Creator Collab", "Brand Film", "Store Opening", "Product Drop", "Review Drive"], r())}`,
    businessId: biz.id,
    business: biz.name,
    category: pick(CATEGORY_NAMES, r()),
    budget: Math.floor((15 + r() * 480)) * 1000,
    creators: 1 + Math.floor(r() * 14),
    applications: Math.floor(r() * 60),
    status: pick(CAMPAIGN_STATUSES, r()),
    created: dateStr(created),
    deadline: dateStr(created - 30 - Math.floor(r() * 40)),
    district: pick(DISTRICTS, r()),
  };
});

export const requirements: Requirement[] = Array.from({ length: 22 }, (_, i) => {
  const r = rng(i * 733 + 41);
  const biz = businesses[Math.floor(r() * businesses.length)];
  return {
    id: `REQ-${String(4000 + i)}`,
    title: `Need ${1 + Math.floor(r() * 8)} ${pick(CATEGORY_NAMES, r()).toLowerCase()} creators in ${pick(DISTRICTS, r())}`,
    business: biz.name,
    category: pick(CATEGORY_NAMES, r()),
    district: pick(DISTRICTS, r()),
    budget: Math.floor((10 + r() * 200)) * 1000,
    creatorsNeeded: 1 + Math.floor(r() * 10),
    applications: Math.floor(r() * 40),
    status: pick(["open", "open", "featured", "hidden", "closed"] as const, r()),
    created: dateStr(Math.floor(r() * 150)),
  };
});

/* ------------------------------------------------------------------ */
/* Websites & domains                                                  */
/* ------------------------------------------------------------------ */

export const websites: Website[] = influencers
  .filter((inf) => inf.websiteStatus !== "none")
  .map((inf, i) => {
    const r = rng(i * 191 + 5);
    return {
      id: `WEB-${String(5000 + i)}`,
      creator: inf.name,
      creatorId: inf.id,
      url: inf.websiteUrl!,
      template: inf.websiteTemplate!,
      status: pick(
        ["published", "published", "draft", "suspended", "domain pending", "domain connected"] as const,
        r(),
      ),
      domain: r() > 0.6 ? `${inf.handle.replace(".", "")}.in` : inf.websiteUrl!,
      visitors: inf.websiteVisits!,
      created: inf.websitePublished!,
      updated: dateStr(Math.floor(r() * 30)),
    };
  });

export const domains: DomainRecord[] = websites.slice(0, 20).map((w, i) => {
  const r = rng(i * 419 + 3);
  return {
    id: `DOM-${String(6000 + i)}`,
    creator: w.creator,
    domain: w.domain,
    type: w.domain.endsWith("influencers.com") ? "subdomain" : "custom",
    verification: pick(["verified", "verified", "pending", "failed"] as const, r()),
    ssl: pick(["active", "active", "pending", "failed"] as const, r()),
    websiteStatus: pick(["published", "draft", "suspended"] as const, r()),
    created: w.created,
  };
});

/* ------------------------------------------------------------------ */
/* Social platforms                                                    */
/* ------------------------------------------------------------------ */

export const socialPlatforms: SocialPlatform[] = [
  { name: "Instagram", icon: "instagram", color: "#E1306C", oauth: true, api: true },
  { name: "YouTube", icon: "youtube", color: "#FF0000", oauth: true, api: true },
  { name: "Facebook", icon: "facebook", color: "#1877F2", oauth: true, api: true },
  { name: "TikTok", icon: "music", color: "#000000", oauth: true, api: false },
  { name: "X", icon: "twitter", color: "#111111", oauth: true, api: true },
  { name: "LinkedIn", icon: "linkedin", color: "#0A66C2", oauth: true, api: false },
  { name: "Snapchat", icon: "ghost", color: "#FFFC00", oauth: false, api: false },
  { name: "Threads", icon: "at-sign", color: "#111111", oauth: false, api: false },
  { name: "Pinterest", icon: "image", color: "#BD081C", oauth: true, api: true },
  { name: "Twitch", icon: "twitch", color: "#9146FF", oauth: true, api: true },
].map((p, i) => {
  const r = rng(i * 53 + 11);
  return {
    id: `PLT-${String(7000 + i)}`,
    ...p,
    status: (i === 6 || i === 7 ? "inactive" : "active") as "active" | "inactive",
    activeCreators: influencers.filter((inf) => inf.platforms.includes(p.name)).length * 7 + Math.floor(r() * 40),
    created: dateStr(500 - i * 20),
  };
});

export const platformRequests: PlatformRequest[] = [
  { platform: "Kick", requestedBy: "Arjun Menon", status: "pending" },
  { platform: "Rumble", requestedBy: "Nithya Pillai", status: "pending" },
  { platform: "Moj", requestedBy: "Fahad Rahman", status: "approved" },
  { platform: "ShareChat", requestedBy: "Devika Nair", status: "pending" },
  { platform: "Josh", requestedBy: "Shanid Mohammed", status: "rejected" },
  { platform: "Chingari", requestedBy: "Keerthi Krishnan", status: "pending" },
  { platform: "Clubhouse", requestedBy: "Basil Joseph", status: "rejected" },
  { platform: "Bluesky", requestedBy: "Athira Das", status: "approved" },
].map((p, i) => ({
  id: `PRQ-${String(7500 + i)}`,
  ...p,
  status: p.status as PlatformRequest["status"],
  profileUrl: `https://${p.platform.toLowerCase()}.com/${p.requestedBy.split(" ")[0].toLowerCase()}`,
  date: dateStr(i * 6 + 2),
  note: `Creator has an established audience on ${p.platform} and wants it shown on their Influencers.com profile and website.`,
}));

/* ------------------------------------------------------------------ */
/* Categories, locations, services                                     */
/* ------------------------------------------------------------------ */

export const categories: Category[] = CATEGORY_NAMES.map((name, i) => ({
  id: `CAT-${String(8000 + i)}`,
  name,
  slug: name.toLowerCase(),
  creators: influencers.filter((inf) => inf.categories.includes(name)).length * 11 + 14,
  order: i + 1,
  status: name === "Parenting" ? "inactive" : "active",
}));

export const locations: LocationNode[] = [
  {
    id: "LOC-IN",
    name: "India",
    type: "country",
    creators: influencers.length * 12,
    children: [
      {
        id: "LOC-KL",
        name: "Kerala",
        type: "state",
        creators: influencers.length * 12,
        children: DISTRICTS.map((d, i) => ({
          id: `LOC-KL-${i}`,
          name: d,
          type: "district" as const,
          creators: influencers.filter((inf) => inf.district === d).length * 12,
          children: CITIES[d].map((c, k) => ({
            id: `LOC-KL-${i}-${k}`,
            name: c,
            type: "city" as const,
            creators: influencers.filter((inf) => inf.city === c).length * 6,
          })),
        })),
      },
    ],
  },
];

export const services: ServiceType[] = [
  { name: "Instagram Reel", platform: "Instagram", avgPrice: 12000 },
  { name: "Instagram Post", platform: "Instagram", avgPrice: 8000 },
  { name: "Story", platform: "Instagram", avgPrice: 4000 },
  { name: "YouTube Video", platform: "YouTube", avgPrice: 45000 },
  { name: "YouTube Short", platform: "YouTube", avgPrice: 15000 },
  { name: "UGC", platform: "Any", avgPrice: 9000 },
  { name: "Product Review", platform: "Any", avgPrice: 18000 },
  { name: "Event Appearance", platform: "Offline", avgPrice: 60000 },
  { name: "Product Photography", platform: "Offline", avgPrice: 14000 },
].map((s, i) => ({
  id: `SVC-${String(9000 + i)}`,
  ...s,
  creators: 40 + ((i * 37) % 180),
  status: s.name === "Event Appearance" ? "inactive" : "active",
}));

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export const media: MediaItem[] = Array.from({ length: 40 }, (_, i) => {
  const r = rng(i * 89 + 17);
  const inf = influencers[Math.floor(r() * influencers.length)];
  const type = pick(["image", "video", "avatar", "website"] as const, r());
  return {
    id: `MED-${String(11000 + i)}`,
    name: `${type}-${inf.handle}-${i}.${type === "video" ? "mp4" : "jpg"}`,
    type,
    creator: inf.name,
    size: Math.floor(120 + r() * (type === "video" ? 240000 : 6000)),
    uploaded: dateStr(Math.floor(r() * 220)),
  };
});

/* ------------------------------------------------------------------ */
/* Verification                                                        */
/* ------------------------------------------------------------------ */

export const verifications: VerificationItem[] = [
  ...influencers
    .filter((i) => i.verification === "pending")
    .slice(0, 8)
    .map((i, k) => ({
      id: `VER-C-${k}`,
      kind: "creator" as const,
      user: i.name,
      detail: `Aadhaar + creator portfolio · ${i.district}`,
      submitted: dateStr(k * 2 + 1),
      status: "pending" as const,
    })),
  ...influencers.slice(0, 6).map((i, k) => ({
    id: `VER-S-${k}`,
    kind: "social" as const,
    user: i.name,
    detail: `${i.platforms[0]} @${i.handle} · ${i.followers.toLocaleString("en-IN")} followers`,
    submitted: dateStr(k * 3 + 2),
    status: (k === 1 ? "info requested" : "pending") as VerificationItem["status"],
  })),
  ...businesses
    .filter((b) => b.verification === "pending")
    .slice(0, 6)
    .map((b, k) => ({
      id: `VER-B-${k}`,
      kind: "business" as const,
      user: b.name,
      detail: `GSTIN + trade licence · ${b.district}`,
      submitted: dateStr(k * 2 + 3),
      status: "pending" as const,
    })),
];

/* ------------------------------------------------------------------ */
/* Subscriptions & payments                                            */
/* ------------------------------------------------------------------ */

export const plans: Plan[] = [
  {
    id: "PLN-1",
    name: "Free",
    audience: "Influencer",
    price: 0,
    features: ["Public profile", "3 portfolio items", "1 social account", "Subdomain website"],
    activeUsers: 2140,
    monthlyRevenue: 0,
    status: "active",
  },
  {
    id: "PLN-2",
    name: "Pro",
    audience: "Influencer",
    price: 499,
    features: ["Unlimited portfolio", "5 social accounts", "Custom domain", "Campaign priority"],
    activeUsers: 640,
    monthlyRevenue: 319360,
    status: "active",
  },
  {
    id: "PLN-3",
    name: "Premium",
    audience: "Influencer",
    price: 1299,
    features: ["Everything in Pro", "Analytics suite", "Verified badge review", "Dedicated support"],
    activeUsers: 188,
    monthlyRevenue: 244212,
    status: "active",
  },
  {
    id: "PLN-4",
    name: "Free",
    audience: "Business",
    price: 0,
    features: ["1 active campaign", "Browse creators", "5 shortlists"],
    activeUsers: 410,
    monthlyRevenue: 0,
    status: "active",
  },
  {
    id: "PLN-5",
    name: "Pro",
    audience: "Business",
    price: 2999,
    features: ["10 campaigns", "Unlimited shortlists", "Requirement boosts", "Team seats (3)"],
    activeUsers: 132,
    monthlyRevenue: 395868,
    status: "active",
  },
  {
    id: "PLN-6",
    name: "Agency",
    audience: "Business",
    price: 7999,
    features: ["Unlimited campaigns", "Multi-brand workspaces", "API access", "Account manager"],
    activeUsers: 38,
    monthlyRevenue: 303962,
    status: "active",
  },
];

export const payments: Payment[] = Array.from({ length: 42 }, (_, i) => {
  const r = rng(i * 137 + 23);
  const isBiz = r() > 0.5;
  const who = isBiz
    ? businesses[Math.floor(r() * businesses.length)].name
    : influencers[Math.floor(r() * influencers.length)].name;
  return {
    id: `TXN-${String(90000 + i * 7)}`,
    user: who,
    type: pick(["Subscription", "Campaign", "Service", "Domain"] as const, r()),
    amount: Math.floor((499 + r() * 90000)),
    status: pick(["paid", "paid", "paid", "pending", "failed", "refunded"] as const, r()),
    date: dateStr(Math.floor(r() * 120)),
    method: pick(["UPI", "Card", "Netbanking", "Wallet"], r()),
  };
});

/* ------------------------------------------------------------------ */
/* Support, notifications, audit                                       */
/* ------------------------------------------------------------------ */

const STAFF = ["Rehan K.", "Divya S.", "Nikhil P.", "Aparna R.", "Sujith M."];

export const tickets: Ticket[] = Array.from({ length: 28 }, (_, i) => {
  const r = rng(i * 241 + 19);
  const isBiz = r() > 0.6;
  return {
    id: `TKT-${String(12000 + i)}`,
    user: isBiz
      ? businesses[Math.floor(r() * businesses.length)].name
      : influencers[Math.floor(r() * influencers.length)].name,
    subject: pick(
      [
        "Instagram sync keeps failing",
        "Custom domain not verifying",
        "Payout not received",
        "Cannot publish my website",
        "Campaign application missing",
        "Need invoice for last payment",
        "Verification badge rejected",
        "Want to change my plan",
        "Duplicate account issue",
      ],
      r(),
    ),
    category: pick(["Account", "Billing", "Website", "Domain", "Campaign", "Verification"], r()),
    priority: pick(["low", "medium", "medium", "high", "urgent"] as const, r()),
    status: pick(["open", "in progress", "waiting", "resolved", "closed"] as const, r()),
    created: dateStr(Math.floor(r() * 60)),
    assignee: pick(STAFF, r()),
  };
});

export const notifications: NotificationItem[] = [
  {
    title: "Onam campaign season is live",
    message: "Businesses can now boost requirements for the Onam window at no extra cost.",
    kind: "campaign",
    audience: "All businesses",
    status: "sent",
  },
  {
    title: "New: custom domains for Pro creators",
    message: "Connect your own domain to your creator website in under five minutes.",
    kind: "system",
    audience: "Pro influencers",
    status: "sent",
  },
  {
    title: "Verification queue reminder",
    message: "Submit your ID proof to complete verification and unlock brand campaigns.",
    kind: "verification",
    audience: "All influencers",
    status: "scheduled",
  },
  {
    title: "Scheduled maintenance",
    message: "Platform maintenance on 05 Oct, 01:00–03:00 IST. Websites stay online.",
    kind: "system",
    audience: "All influencers",
    status: "scheduled",
  },
  {
    title: "Agency workspaces beta",
    message: "Manage multiple brands from one account. Join the beta from Settings.",
    kind: "user",
    audience: "Agency accounts",
    status: "draft",
  },
  {
    title: "Premium analytics refresh",
    message: "Engagement history now goes back 18 months for Premium creators.",
    kind: "system",
    audience: "Premium influencers",
    status: "sent",
  },
].map((n, i) => ({
  id: `NTF-${String(13000 + i)}`,
  ...n,
  kind: n.kind as NotificationItem["kind"],
  status: n.status as NotificationItem["status"],
  schedule: dateStr(6 - i),
}));

const ADMINS = ["fadhil@influencers.com", "rehan@influencers.com", "divya@influencers.com", "nikhil@influencers.com"];

export const auditLogs: AuditLog[] = Array.from({ length: 60 }, (_, i) => {
  const r = rng(i * 311 + 31);
  const actions: [string, string][] = [
    ["Influencer verified", "Influencer"],
    ["Business suspended", "Business"],
    ["Social platform approved", "Social Platform"],
    ["Campaign removed", "Campaign"],
    ["Subscription changed", "Subscription"],
    ["Domain disconnected", "Domain"],
    ["Category created", "Category"],
    ["Ticket reassigned", "Ticket"],
    ["Payment refunded", "Payment"],
    ["Website suspended", "Website"],
  ];
  const [action, entity] = actions[Math.floor(r() * actions.length)];
  const days = Math.floor(r() * 30);
  return {
    id: `LOG-${String(14000 + i)}`,
    datetime: `${dateStr(days)} ${String(8 + Math.floor(r() * 11)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
    admin: pick(ADMINS, r()),
    action,
    entity,
    entityId: `${entity.slice(0, 3).toUpperCase()}-${1000 + Math.floor(r() * 5000)}`,
    ip: `103.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
    device: pick(["Chrome · macOS", "Safari · iPad", "Chrome · Windows", "Firefox · Linux"], r()),
    result: r() > 0.12 ? "success" : "failed",
  };
});

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export const roles = ["Super Admin", "Admin", "Moderator", "Support", "Finance", "Content Manager"] as const;

export const permissionMatrix: { area: string; levels: Record<string, string> }[] = [
  { area: "Influencers", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "View", Support: "View", Finance: "None", "Content Manager": "Manage" } },
  { area: "Businesses", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "View", Support: "View", Finance: "View", "Content Manager": "None" } },
  { area: "Campaigns", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "Moderate", Support: "View", Finance: "None", "Content Manager": "Moderate" } },
  { area: "Requirements", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "Moderate", Support: "View", Finance: "None", "Content Manager": "Moderate" } },
  { area: "Websites", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "Moderate", Support: "View", Finance: "None", "Content Manager": "Manage" } },
  { area: "Domains", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "None", Support: "View", Finance: "None", "Content Manager": "None" } },
  { area: "Social Platforms", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "View", Support: "None", Finance: "None", "Content Manager": "Manage" } },
  { area: "Payments", levels: { "Super Admin": "Full", Admin: "View", Moderator: "None", Support: "None", Finance: "Full", "Content Manager": "None" } },
  { area: "Subscriptions", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "None", Support: "View", Finance: "Manage", "Content Manager": "None" } },
  { area: "Support", levels: { "Super Admin": "Full", Admin: "Manage", Moderator: "View", Support: "Full", Finance: "None", "Content Manager": "None" } },
  { area: "Audit Logs", levels: { "Super Admin": "Full", Admin: "View", Moderator: "None", Support: "None", Finance: "View", "Content Manager": "None" } },
  { area: "Settings", levels: { "Super Admin": "Full", Admin: "Limited", Moderator: "None", Support: "None", Finance: "None", "Content Manager": "Limited" } },
];

export const adminStaff = [
  { name: "Mohammed Fadhil", email: "fadhil@influencers.com", role: "Super Admin", lastActive: "2 min ago" },
  { name: "Rehan Kurup", email: "rehan@influencers.com", role: "Admin", lastActive: "18 min ago" },
  { name: "Divya Suresh", email: "divya@influencers.com", role: "Moderator", lastActive: "1 hr ago" },
  { name: "Nikhil Prasad", email: "nikhil@influencers.com", role: "Support", lastActive: "3 hrs ago" },
  { name: "Aparna Raj", email: "aparna@influencers.com", role: "Finance", lastActive: "Yesterday" },
  { name: "Sujith Menon", email: "sujith@influencers.com", role: "Content Manager", lastActive: "Yesterday" },
];

/* ------------------------------------------------------------------ */
/* Analytics series                                                    */
/* ------------------------------------------------------------------ */

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const userGrowth = MONTHS.map((m, i) => ({
  month: m,
  influencers: 120 + i * 46 + ((i * 37) % 40),
  businesses: 34 + i * 12 + ((i * 17) % 14),
}));

export const campaignActivity = MONTHS.map((m, i) => ({
  month: m,
  created: 28 + ((i * 13) % 26) + i * 3,
  active: 18 + ((i * 7) % 18) + i * 2,
  completed: 9 + ((i * 11) % 16) + i,
}));

export const revenueTrend = MONTHS.map((m, i) => ({
  month: m,
  subscription: 420000 + i * 62000 + ((i * 41) % 9) * 5000,
  services: 180000 + i * 28000 + ((i * 23) % 7) * 4000,
  refunds: 14000 + ((i * 19) % 6) * 2200,
}));

export const revenueByPlan = plans
  .filter((p) => p.price > 0)
  .map((p) => ({ name: `${p.audience} ${p.name}`, value: p.monthlyRevenue }));

export const revenueByAccountType = [
  { name: "Influencers", value: 563572 },
  { name: "Businesses", value: 699830 },
];

export const categoryDistribution = categories
  .slice()
  .sort((a, b) => b.creators - a.creators)
  .slice(0, 8)
  .map((c) => ({ name: c.name, value: c.creators }));

/* ------------------------------------------------------------------ */
/* Dashboard stats                                                     */
/* ------------------------------------------------------------------ */

export const dashboardStats = {
  totalInfluencers: 2968,
  activeInfluencers: influencers.filter((i) => i.status === "active").length * 58,
  totalBusinesses: 580,
  activeBusinesses: businesses.filter((b) => b.status === "active").length * 22,
  activeCampaigns: campaigns.filter((c) => ["active", "published", "applications", "shortlisted"].includes(c.status))
    .length * 6,
  totalWebsites: websites.length * 21,
  monthlyRevenue: 1263402,
  pendingRequests:
    verifications.filter((v) => v.status === "pending").length + platformRequests.filter((p) => p.status === "pending").length,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const compact = (n: number) => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const getInfluencer = (id: string) => influencers.find((i) => i.id === id);
export const getBusiness = (id: string) => businesses.find((b) => b.id === id);
export const campaignsForBusiness = (id: string) => campaigns.filter((c) => c.businessId === id);

export interface SearchResult {
  group: string;
  id: string;
  label: string;
  sub: string;
  to: string;
  params?: Record<string, string>;
}

export function globalSearch(q: string): SearchResult[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const out: SearchResult[] = [];
  influencers
    .filter((i) => i.name.toLowerCase().includes(term) || i.handle.includes(term))
    .slice(0, 5)
    .forEach((i) =>
      out.push({ group: "Influencers", id: i.id, label: i.name, sub: `${i.district} · ${compact(i.followers)} followers`, to: "/influencers/$id", params: { id: i.id } }),
    );
  businesses
    .filter((b) => b.name.toLowerCase().includes(term))
    .slice(0, 5)
    .forEach((b) =>
      out.push({ group: "Businesses", id: b.id, label: b.name, sub: `${b.type} · ${b.district}`, to: "/businesses/$id", params: { id: b.id } }),
    );
  campaigns
    .filter((c) => c.title.toLowerCase().includes(term) || c.business.toLowerCase().includes(term))
    .slice(0, 5)
    .forEach((c) => out.push({ group: "Campaigns", id: c.id, label: c.title, sub: `${c.business} · ${inr(c.budget)}`, to: "/campaigns" }));
  requirements
    .filter((r) => r.title.toLowerCase().includes(term) || r.business.toLowerCase().includes(term))
    .slice(0, 4)
    .forEach((r) => out.push({ group: "Requirements", id: r.id, label: r.title, sub: r.business, to: "/requirements" }));
  websites
    .filter((w) => w.url.toLowerCase().includes(term) || w.creator.toLowerCase().includes(term))
    .slice(0, 4)
    .forEach((w) => out.push({ group: "Websites", id: w.id, label: w.url, sub: w.creator, to: "/websites" }));
  domains
    .filter((d) => d.domain.toLowerCase().includes(term))
    .slice(0, 4)
    .forEach((d) => out.push({ group: "Domains", id: d.id, label: d.domain, sub: d.creator, to: "/domains" }));
  return out;
}
