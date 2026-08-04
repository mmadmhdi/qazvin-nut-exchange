export type PricePoint = {
  date: string;
  price: number; // = close
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type Passport = {
  batch: string;
  harvestYear: string;
  region: string;
  altitude: string;
  soil: string;
  process: string;
  size: string;
  notes: string;
  units: string;
  certificates: string;
};

export type ProductCategory = "پسته" | "بادام درختی" | "بادام زمینی" | "سایر";

export type Product = {
  passport?: Passport;
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  origin: string;
  grade: string;
  description: string;
  priority: number;
  active: boolean;
  featured: boolean;
  updatedAt: string;
  history: PricePoint[];
};

export type WholesaleTier = {
  name: string;
  min: number;
  discount: number;
  note: string;
};

export type WholesaleBenefit = {
  text: string;
};

export type SiteSettings = {
  brandName: string;
  brandLatin: string;
  brandTagline: string;
  currency: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactPhone: string;
  contactAddress: string;
  contactEmail: string;
  contactWhatsapp?: string;
  instagram?: string;
  telegram?: string;
  workingHours?: string;
  foundedYear?: string;
  missionText?: string;
  exportText?: string;
  seoTitle?: string;
  seoDescription?: string;
  announcement?: string;
  priceSource?: string;
  siteUrl?: string;
  wholesaleTiers?: WholesaleTier[];
  wholesaleBenefits?: WholesaleBenefit[];
};

export type Article = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  date: string;
  minutes: number;
  tags: string[];
  body: string[];
};

export type SiteData = {
  products: Product[];
  settings: SiteSettings;
  articles: Article[];
};
