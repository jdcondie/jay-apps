import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        onImageUpload({ file, previewUrl });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a PNG or JPG image.');
    }
  }, [onImageUpload]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-[#d4d4d4] hover:border-[#E8541A] focus-within:border-[#E8541A] focus-within:ring-2 focus-within:ring-[#E8541A]/10 transition-all duration-200">
      <input
        ref={inputRef}
        type="file"
        id="image-upload"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer flex flex-col items-center justify-center text-[#717171] focus:outline-none"
        tabIndex={0}
        role="button"
        aria-label="Upload product image"
        onKeyDown={handleKeyDown}
      >
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#E8541A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UploadIcon className="text-[#E8541A]" />
          </div>
          <p className="font-bold text-[#111111] text-sm mb-1">Click to upload or drag & drop</p>
          <p className="text-xs text-[#717171]">PNG or JPG</p>
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;
