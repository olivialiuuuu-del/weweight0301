import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface User {
  id: string;
  name: string;
  height: number;
  target_weight: number;
  avatar_url: string | null;
  partner_id: string | null;
  partner_name: string | null;
  partner_avatar: string | null;
  invite_code: string;
  privacy_show_weight: number;
  privacy_show_progress: number;
  privacy_show_chart: number;
  p_show_weight: number;
  p_show_progress: number;
  p_show_chart: number;
  points: number;
}

export interface WeightRecord {
  id: number;
  user_id: string;
  weight: number;
  timestamp: string;
}

export interface Goal {
  id: number;
  user_id: string;
  title: string;
  target_value: number;
  type: 'weight' | 'date';
  deadline: string | null;
  completed: number;
}

export interface Coupon {
  id: number;
  user_id: string;
  title: string;
  cost: number;
  description: string;
}
