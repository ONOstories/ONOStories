import { useState, useEffect, useMemo } from 'react';

/**
 * A custom hook to preload a list of images.
 * @param imageSrcs An array of image URLs to preload.
 * @returns A boolean indicating whether all images have finished loading.
 */
export const useImagePreloader = (imageSrcs: string[]) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Memoize the image sources to prevent re-running the effect unnecessarily
  const memoizedImageSrcs = useMemo(() => imageSrcs, [imageSrcs]);

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      });
    };

    const loadAllImages = async () => {
      try {
        // Wait for all images to either load or fail
        await Promise.all(memoizedImageSrcs.map(src => preloadImage(src)));
        if (!isCancelled) {
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error("An image failed to preload:", error);
        // Even if an image fails, we load the app to avoid getting stuck.
        if (!isCancelled) {
          setImagesLoaded(true);
        }
      }
    };

    if (memoizedImageSrcs.length > 2) {
      loadAllImages();
    } else {
      setImagesLoaded(true); // No images to load
    }

    return () => {
      isCancelled = true;
    };
  }, [memoizedImageSrcs]);

  return imagesLoaded;
};
