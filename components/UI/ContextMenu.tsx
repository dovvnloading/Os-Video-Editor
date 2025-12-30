import React, { useEffect, useRef } from 'react';

interface ContextMenuAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Use mousedown to capture clicks immediately
    document.addEventListener('mousedown', handleClickOutside);
    // Also close on scroll to prevent floating menu issues
    window.addEventListener('scroll', onClose, true);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  // Adjust position to keep it roughly on screen (simplified)
  const style: React.CSSProperties = {
      top: y,
      left: x,
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] bg-[#1e293b] border border-[#334155] rounded-lg shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            if (!action.disabled) {
                action.onClick();
                onClose();
            }
          }}
          disabled={action.disabled}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors outline-none font-medium
            ${action.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#6366f1] hover:text-white cursor-pointer'}
            ${action.danger && !action.disabled ? 'text-red-400 hover:bg-red-500/20' : 'text-slate-200'}
          `}
        >
          {action.icon && <span className="w-4 h-4 opacity-80">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;