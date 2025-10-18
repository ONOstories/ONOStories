import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// src/lib/utils.ts

export function getCloudinaryTransformedUrl(
  baseUrl: string,
  options: { width: number; quality?: number | 'auto'; format?: 'auto' }
): string {
  if (!baseUrl || !baseUrl.includes('cloudinary.com')) {
    return baseUrl; // Return original if not a Cloudinary URL
  }

  const { width, quality = 'auto', format = 'auto' } = options;
  
  // Cloudinary transformation string:
  // f_auto: Automatically choose the best format (e.g., WebP, AVIF)
  // q_auto: Automatically adjust quality to a visually good level
  // w_{width}: Resize to the specified width
  const transformations = `f_auto,q_auto,w_${width}`;
  
  // Insert the transformations right after /image/upload/
  return baseUrl.replace('/image/upload/', `/image/upload/${transformations}/`);
}