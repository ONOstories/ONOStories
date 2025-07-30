// Mock data to replace Supabase database content
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro';
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  child_name: string;
  genre: string;
  sub_genre: string;
  content: any;
  images: string[];
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChildPhoto {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  created_at: string;
}

// Mock demo stories data
export const demoStories = [
  {
    id: '1',
    title: "The Brave Little Explorer",
    genre: "Adventure",
    description: "Join our young hero on a magical quest through enchanted forests and mysterious caves.",
    thumbnail: "https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400",
    character: "Alex",
    isPremium: false,
    rating: 4.8,
    duration: "8 min read"
  },
  {
    id: '2',
    title: "The Magic Paintbrush",
    genre: "Creativity",
    description: "Discover the power of imagination with a paintbrush that brings drawings to life.",
    thumbnail: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400",
    character: "Maya",
    isPremium: false,
    rating: 4.9,
    duration: "6 min read"
  },
  {
    id: '3',
    title: "The Friendly Dragon",
    genre: "Friendship",
    description: "Learn about friendship and kindness with a gentle dragon who just wants to play.",
    thumbnail: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400",
    character: "Sam",
    isPremium: false,
    rating: 4.7,
    duration: "7 min read"
  },
  {
    id: '4',
    title: "The Space Adventure",
    genre: "Education",
    description: "Blast off to learn about planets, stars, and the wonders of space exploration.",
    thumbnail: "https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=400",
    character: "Jordan",
    isPremium: false,
    rating: 4.6,
    duration: "9 min read"
  },
  {
    id: '5',
    title: "The Underwater Kingdom",
    genre: "Adventure",
    description: "Dive deep into the ocean to discover a magical underwater world full of sea creatures.",
    thumbnail: "https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg?auto=compress&cs=tinysrgb&w=400",
    character: "Riley",
    isPremium: false,
    rating: 4.8,
    duration: "8 min read"
  }
];

export const personalizedStories = [
  {
    id: '6',
    title: "Your Child's Space Mission",
    genre: "Educational",
    description: "Your child becomes an astronaut on an exciting mission to Mars.",
    isPremium: true,
    customizable: true
  },
  {
    id: '7',
    title: "The Magical Forest Adventure",
    genre: "Fantasy",
    description: "Your child discovers a hidden forest where magical creatures need help.",
    isPremium: true,
    customizable: true
  },
  {
    id: '8',
    title: "Super Helper at School",
    genre: "Moral",
    description: "Your child learns about helping others through a heartwarming school story.",
    isPremium: true,
    customizable: true
  }
];

// Mock user data for demo purposes
export const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    full_name: 'Demo User',
    subscription_status: 'free' as const,
    subscription_expires_at: null,
    stripe_customer_id: null
  },
  {
    id: '2',
    email: 'pro@example.com',
    password: 'password123',
    full_name: 'Pro User',
    subscription_status: 'pro' as const,
    subscription_expires_at: '2025-12-31T23:59:59Z',
    stripe_customer_id: 'cus_mock123'
  }
];

// Mock generated stories for pro users
export const mockGeneratedStories: Story[] = [
  {
    id: '1',
    user_id: '2',
    title: "Emma's Space Adventure",
    child_name: "Emma",
    genre: "Educational",
    sub_genre: "Science Adventures",
    content: { slides: [] },
    images: [],
    is_premium: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: '2',
    user_id: '2',
    title: "Emma and the Magic Forest",
    child_name: "Emma",
    genre: "Bedtime Stories",
    sub_genre: "Peaceful Dreams",
    content: { slides: [] },
    images: [],
    is_premium: true,
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z"
  }
];