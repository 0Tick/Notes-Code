import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface FileDropZoneProps {
  children: ReactNode;
  onFilesDrop: (files: FileList) => void;
}

export function FileDropZone({ children, onFilesDrop }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  // A counter to track nested dragenter/dragleave events
  const dragCounter = useRef(0);

  useEffect(() => {
    function handleDragOver(e: DragEvent) {
      // Prevent default to allow drop
      e.preventDefault();
    }

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      dragCounter.current += 1;
      // If this is the first time we've entered
      if (e.dataTransfer?.types.includes('Files') && dragCounter.current === 1) {
        setIsDragging(true);
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter.current -= 1;
      // When we've fully left
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }

    function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onFilesDrop(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    }

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFilesDrop]);

  return (
    <div style={{ position: 'relative' }}>
      {children}

      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            // Transparent background so you still see children
            backgroundColor: 'rgba(0,0,0,0.01)',
            // Make sure this sits on top
            zIndex: 9999,
            // Prevent pointer events from hitting children
            pointerEvents: 'all',
          }}
        />
      )}
    </div>
  );
}
