
import React, { useRef } from 'react';
import { Asset, MediaType } from '../../types';
import { UploadIcon, TrashIcon } from '../UI/Icons';

interface AssetManagerProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (assetId: string) => void;
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, onAddAsset, onRemoveAsset, onDragStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // Basic type detection
      let type = MediaType.VIDEO;
      if (file.type.startsWith('image/')) type = MediaType.IMAGE;
      if (file.type.startsWith('audio/')) type = MediaType.AUDIO;

      // Determine duration (mock for images, real for video/audio requires loading meta)
      // For this prototype, we'll default to 5s and update if possible (omitted for brevity)
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        name: file.name,
        type,
        url,
        duration: type === MediaType.IMAGE ? 5 : 10, // Default duration placeholder
      };

      // If it's video/audio, we try to get duration
      if (type === MediaType.VIDEO || type === MediaType.AUDIO) {
        const mediaEl = document.createElement(type === MediaType.VIDEO ? 'video' : 'audio');
        mediaEl.src = url;
        mediaEl.onloadedmetadata = () => {
          newAsset.duration = mediaEl.duration;
          onAddAsset(newAsset);
        };
      } else {
        onAddAsset(newAsset);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-osve-panel border-r border-osve-border select-none">
      <div className="p-4 border-b border-osve-border flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-osve-text">Project Assets</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-osve-text hover:text-white transition-colors p-1"
          title="Import Media"
        >
          <UploadIcon className="w-6 h-6" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
          accept="video/*,image/*,audio/*"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {assets.length === 0 && (
          <div className="text-center p-8 text-sm text-gray-600 italic">
            No media imported.<br/>Click upload to add files.
          </div>
        )}
        {assets.map((asset) => (
          <div 
            key={asset.id}
            draggable
            onDragStart={(e) => onDragStart(e, asset)}
            className="group relative flex flex-col p-3 bg-osve-active hover:bg-osve-border rounded cursor-grab active:cursor-grabbing border border-transparent hover:border-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded flex items-center justify-center overflow-hidden shrink-0 border border-osve-border">
                {asset.type === MediaType.IMAGE || asset.type === MediaType.VIDEO ? (
                   <div className="text-xs text-gray-500 font-mono font-bold">{asset.type[0]}</div>
                ) : (
                   <span className="text-lg grayscale">🎵</span>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm text-osve-textHighlight truncate font-medium mb-0.5">{asset.name}</p>
                <p className="text-xs text-gray-500 font-mono">{(asset.duration || 0).toFixed(1)}s</p>
              </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAsset(asset.id);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all shadow-md"
                title="Remove Asset"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetManager;
