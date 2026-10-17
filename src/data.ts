import {
  Bird,
  Cat,
  Dog,
  Feather,
  Fish,
  LayoutGrid,
  Music4,
  Rabbit,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import imgKashani from "./assets/pigeon-kashani.webp";
import imgHeroPigeon from "./assets/hero-pigeon.webp";
import imgArabianHero from "./assets/arabian-hero.webp";
import imgRingneck from "./assets/parrot-ringneck.webp";
import imgCockatiel from "./assets/cockatiel.webp";
import imgLovebirds from "./assets/lovebirds.webp";
import imgCanary from "./assets/canary.webp";
import imgCatPersian from "./assets/cat-persian.webp";
import imgDog from "./assets/dog-pomeranian.webp";
import imgAquarium from "./assets/aquarium.webp";

export type Category = { id: string; label: string; icon: LucideIcon; count: number };

export type Listing = {
  id: number;
  title: string;
  img: string;
  images?: string[];
  price: number | null;
  city: string;
  province?: string;
  district: string;
  time: string;
  cat: string;
  featured?: boolean;
  badge?: string;
  desc?: string;
  seller?: string;
  phone?: string;
  mine?: boolean;
  specs?: { age?: string; sex?: string; breed?: string; health?: string; delivery?: string };
};

export const SEX_OPTIONS = ["نر", "ماده", "جفت", "نامشخص"];
export const AGE_OPTIONS = ["جوجه / نوزاد", "زیر ۶ ماه", "۶ ماه تا ۱ سال", "۱ تا ۳ سال", "بالای ۳ سال"];
export const HEALTH_OPTIONS = ["سالم و سرحال", "واکسینه", "دارای شناسنامه", "رینگ‌دار", "در حال درمان"];
export const DELIVERY_OPTIONS = ["تحویل حضوری", "ارسال با باربری", "پست پرنده‌بر", "تحویل در محل خریدار"];

export const CATEGORIES: Category[] = [
  { id: "all", label: "همه آگهی‌ها", icon: LayoutGrid, count: 33405 },
  { id: "pigeon", label: "کبوتر و کفتر", icon: Bird, count: 8421 },
  { id: "parrot", label: "طوطی و مرغ‌عشق", icon: Feather, count: 5218 },
  { id: "songbird", label: "قناری و فنچ", icon: Music4, count: 3087 },
  { id: "dog", label: "سگ", icon: Dog, count: 6944 },
  { id: "cat", label: "گربه", icon: Cat, count: 4732 },
  { id: "fish", label: "ماهی و آکواریوم", icon: Fish, count: 2658 },
  { id: "small", label: "خرگوش و جوندگان", icon: Rabbit, count: 1240 },
  { id: "gear", label: "لوازم نگهداری", icon: ShoppingBag, count: 9305 },
];

export const GRID_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all");

export const CITIES = [
  "همه شهرها",
  "تهران",
  "کرج",
  "شیراز",
  "اصفهان",
  "مشهد",
  "تبریز",
  "رشت",
  "کرمان",
  "اهواز",
  "قم",
  "ساری",
];

export const LISTINGS: Listing[] = [
  {
    id: 1,
    title: "کبوتر کاشانی ابلق، رینگ‌دار و آماده پرواز",
    img: imgKashani,
    price: 4500000,
    city: "تهران",
    district: "شهرری",
    time: "۳۰ دقیقه پیش",
    cat: "pigeon",
    featured: true,
    badge: "رینگ‌دار",
  },
  {
    id: 2,
    title: "کبوتر ناقلی اصیل شیرازی، نر جوان نجیب‌زاد",
    img: imgHeroPigeon,
    price: 7500000,
    city: "شیراز",
    district: "قصرالدشت",
    time: "۱ ساعت پیش",
    cat: "pigeon",
    featured: true,
    badge: "نجیب‌زاد",
  },
  {
    id: 3,
    title: "کبوتر گردن‌فر عربی اصیل، نر بالغ نجیب‌زاد",
    img: imgArabianHero,
    price: 6000000,
    city: "اصفهان",
    district: "ملک‌شهر",
    time: "۲ ساعت پیش",
    cat: "pigeon",
    badge: "جفت",
  },
  {
    id: 4,
    title: "طوطی برزیلی دستی، رینگ‌دار و بسیار خوش‌صد",
    img: imgRingneck,
    price: 6500000,
    city: "تهران",
    district: "پونک",
    time: "۱۵ دقیقه پیش",
    cat: "parrot",
    featured: true,
    badge: "دست‌شده",
  },
  {
    id: 5,
    title: "عروس هلندی لوتینو جوان، گرم و سرحال",
    img: imgCockatiel,
    price: 2850000,
    city: "کرج",
    district: "فردیس",
    time: "۴۵ دقیقه پیش",
    cat: "parrot",
  },
  {
    id: 6,
    title: "جفت مرغ عشق فشر بالارنگ، آماده جوجه‌گیری",
    img: imgLovebirds,
    price: 3200000,
    city: "مشهد",
    district: "وکیل‌آباد",
    time: "۱ ساعت پیش",
    cat: "parrot",
    featured: true,
    badge: "جفت آماده",
  },
  {
    id: 7,
    title: "قناری لاک آلمان، گلو تازه با صدای رسا",
    img: imgCanary,
    price: 1950000,
    city: "رشت",
    district: "گلسار",
    time: "۳ ساعت پیش",
    cat: "songbird",
    badge: "گلو تازه",
  },
  {
    id: 8,
    title: "گربه پرشین چشم‌رنگی، ماده شناسنامه‌دار",
    img: imgCatPersian,
    price: 5500000,
    city: "تهران",
    district: "فرمانیه",
    time: "۲ ساعت پیش",
    cat: "cat",
    featured: true,
    badge: "شناسنامه‌دار",
  },
  {
    id: 9,
    title: "توله پامرانین تدی‌فیس، واکسینه با دفترچه",
    img: imgDog,
    price: 18500000,
    city: "تهران",
    district: "سعادت‌آباد",
    time: "۵ ساعت پیش",
    cat: "dog",
    featured: true,
    badge: "واکسن کامل",
  },
  {
    id: 10,
    title: "ست کامل آکواریوم ۱۲۰ لیتری + گلدفیش رنچو",
    img: imgAquarium,
    price: 3800000,
    city: "تبریز",
    district: "ولیعصر",
    time: "دیروز",
    cat: "fish",
  },
  {
    id: 11,
    title: "جوجه کبوتر مسابقه‌ای تبریزی، از لانه قهرمان",
    img: imgKashani,
    price: 2200000,
    city: "تبریز",
    district: "ائل‌گلی",
    time: "۳ ساعت پیش",
    cat: "pigeon",
  },
  {
    id: 12,
    title: "جفت عروس هلندی گری به همراه قفس وردنی تمام‌دار",
    img: imgCockatiel,
    price: null,
    city: "کرمان",
    district: "بلوار جمهوری",
    time: "دیروز",
    cat: "parrot",
    badge: "با قفس",
  },
  {
    id: 13,
    title: "خرگوش لوپ مینی دستی، کاملاً خانگی و آرام",
    img: "https://images.pexels.com/photos/37144808/pexels-photo-37144808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    price: 950000,
    city: "ساری",
    district: "بلوار کشاورز",
    time: "۱ ساعت پیش",
    cat: "small",
    badge: "دستی",
  },
  {
    id: 14,
    title: "جفت فنچ زبرا به همراه لانه و دان مخصوص",
    img: "https://images.pexels.com/photos/35105486/pexels-photo-35105486.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    price: 1250000,
    city: "قم",
    district: "صفاشهر",
    time: "۴ ساعت پیش",
    cat: "songbird",
    badge: "جفت",
  },
  {
    id: 15,
    title: "لاک‌پشت گوش‌قرمز سالم + آکواتراریوم کامل",
    img: "https://images.pexels.com/photos/29054922/pexels-photo-29054922.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    price: 1100000,
    city: "اهواز",
    district: "کیانپارس",
    time: "دیروز",
    cat: "fish",
  },
  {
    id: 16,
    title: "آرای بلوگلد دستی، اجتماعی و بسیار خوش‌صدا",
    img: "https://images.pexels.com/photos/34580388/pexels-photo-34580388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    price: 24000000,
    city: "تهران",
    district: "نیاوران",
    time: "۳۰ دقیقه پیش",
    cat: "parrot",
    featured: true,
    badge: "دست‌شده",
  },
  {
    id: 17,
    title: "همستر سوری طلایی به همراه قفس و لوازم کامل",
    img: "https://images.pexels.com/photos/4520482/pexels-photo-4520482.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    price: 750000,
    city: "کرج",
    district: "گوهردشت",
    time: "۶ ساعت پیش",
    cat: "small",
  },
];

export const TICKER: { label: string; price: number; trend: "up" | "down" | "flat" }[] = [
  { label: "کبوتر کاشانی", price: 4500000, trend: "up" },
  { label: "طوطی برزیلی", price: 6500000, trend: "up" },
  { label: "مرغ عشق فشر", price: 1600000, trend: "down" },
  { label: "قناری لاک", price: 1950000, trend: "up" },
  { label: "کبوتر ناقلی", price: 7500000, trend: "up" },
  { label: "عروس هلندی", price: 2850000, trend: "flat" },
  { label: "گربه پرشین", price: 5500000, trend: "down" },
  { label: "پامرانین تدی", price: 18500000, trend: "up" },
];

export const SEARCH_SUGGEST = ["کبوتر کاشانی", "طوطی برزیلی", "گربه پرشین", "قناری لاک"];
