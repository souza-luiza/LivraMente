"use client";
import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Button from "./button";
import SaveIcon from "./icons/SaveIcon";
import TrashIcon from "./icons/TrashIcon";

interface BannerCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (blob: Blob) => void;
}

const BANNER_ASPECT = 6; // razão 6:1

function centerAspectCropFn(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90, 
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function BannerCropModal({ isOpen, imageUrl, onClose, onSave }: BannerCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerAspectCropFn(width, height, BANNER_ASPECT);
    setCrop(newCrop);
  };

  const handleSave = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = cropWidth / BANNER_ASPECT;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => blob && onSave(blob), "image/jpeg", 0.95);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000090] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] flex flex-col">
        <h2 className="text-h5 font-bold mb-4">Recortar Banner</h2>

        <div className="flex-1 overflow-auto mb-4 p-4 flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={BANNER_ASPECT}
            className="max-w-full max-h-full"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Banner"
              onLoad={onImageLoad}
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            icon={<TrashIcon size={16} />}
            colorScheme="light-brown"
            size="small"
            text="Cancelar"
            onClick={onClose}
          />
          <Button
            icon={<SaveIcon size={16} />}
            colorScheme="dark-green"
            size="small"
            text="Confirmar"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}