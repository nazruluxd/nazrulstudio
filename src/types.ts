import { ComponentType } from 'react';

export interface GlobalContent {
  heroImage: string;
  heroTitle: string;
  heroGradient: string;
  heroSub: string;
  heroDesc: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  tags?: string[];
  bg: string;
  text: string;
  border: string;
  image: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  desc: string;
}

export interface ExperienceItem {
  id: string;
  year: string;
  role: string;
  company: string;
  desc: string;
}

export interface EducationItem {
  id: string;
  year: string;
  degree: string;
  institution: string;
  desc: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
  color: string;
}

export interface VisibilityState {
  brands: boolean;
  about: boolean;
  skills: boolean;
  approach: boolean;
  whyUs: boolean;
  projects: boolean;
  portfolio: boolean;
  testimonials: boolean;
  bonus: boolean;
  resume: boolean;
  [key: string]: boolean;
}

export interface ShopVideoConfig {
  videoUrl: string;
  title: string;
  subtitle: string;
  posterImage?: string;
  autoplay: boolean;
  loop: boolean;
  muted?: boolean;
  videoType?: 'url' | 'upload' | 'preset';
  uploadedFileName?: string;
  uploadedFileSize?: string;
}

export interface AppData {
  visibility: VisibilityState;
  global: GlobalContent;
  showcase: ShowcaseItem[];
  portfolio: PortfolioItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  shopVideo: ShopVideoConfig;
}

export interface BrandItem {
  name: string;
  icon: string;
}

export interface StepItem {
  id: string;
  title: string;
  desc: string;
  icon: ComponentType<any>;
  color: string;
}

export interface ComparisonItem {
  name: string;
  desc: string;
  icon: ComponentType<any>;
  highlight: boolean;
  features: boolean[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
}

export interface SocialLink {
  icon: ComponentType<any>;
  href: string;
  label: string;
}

export interface NavMenuItem {
  name: string;
  href: string;
  key: string;
}
