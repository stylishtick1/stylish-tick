import React from 'react';
import { motion } from 'framer-motion';

interface ImageGalleryProps {
  images: { id: number; image_url: string; image_type?: string }[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, activeIndex, setActiveIndex }) => {
  const activeImage = images[activeIndex]?.image_url;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border">
        <motion.img
          key={activeImage}
          src={activeImage}
          alt={`Watch image ${activeIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
          whileHover={{ scale: 1.05 }}
        />
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
          {activeIndex + 1}/{images.length}
        </div>
      </div>
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`w-16 h-16 rounded overflow-hidden border ${idx === activeIndex ? 'border-primary' : 'border-border hover:border-primary/50'}`}
            >
              <img src={img.image_url} alt={img.image_type || 'Thumbnail'} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
