// You can place this component in the same file as `Page`, or a new file.

import React, { FC, useState, useEffect } from 'react';
import { NotesCode } from "@/handwriting";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { Loader2 } from 'lucide-react'; // A nice loading spinner icon

interface CanvasImageProps {
  imageMeta: NotesCode.Image; // The metadata for one image (id, x, y, scale)
}

export const CanvasImage: FC<CanvasImageProps> = ({ imageMeta }) => {
  const { loadImage, imagesDirectory } = useFilesystemContext();
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageMeta.image) {
      setError("No image ID provided.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadImage(imageMeta.image, imagesDirectory)
      .then((img) => {
        if (img) {
          setImageElement(img);
        } else {
          throw new Error("Image could not be loaded.");
        }
      })
      .catch(err => {
        console.error(`Failed to load image ${imageMeta.image}:`, err);
        setError("Failed to load image.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  // This effect should only run when the image ID changes.
  }, [imageMeta.image, loadImage, imagesDirectory]);

  // Common styling for the container
  const style: React.CSSProperties = {
    position: 'absolute',
    left: imageMeta.x || 0,
    top: imageMeta.y || 0,
    pointerEvents: 'none', // Important: images shouldn't block drawing
  };

  if (isLoading) {
    return (
      <div
        style={{
          ...style,
          width: 100, // Placeholder size
          height: 100,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ccc',
        }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !imageElement) {
    // Render an error state if loading fails
    return (
      <div
        style={{
          ...style,
          width: 100,
          height: 100,
          backgroundColor: '#fee',
          border: '1px solid #f88',
          color: '#c00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4px'
        }}
      >
        Error
      </div>
    );
  }

  // Once loaded, render the actual image
  return (
    <img
      src={imageElement.src}
      alt="User content"
      className="pointer-events-none"
      style={{
        ...style,
        width: imageElement.naturalWidth * (imageMeta.scaleX || 1),
        height: imageElement.naturalHeight * (imageMeta.scaleY || 1),
      }}
    />
  );
};