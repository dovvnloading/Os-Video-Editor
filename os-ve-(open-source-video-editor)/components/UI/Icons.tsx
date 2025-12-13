
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// Default size increased to w-6 h-6 (24px) for better visibility
const DEFAULT_CLASS = "w-6 h-6";

export const PlayIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

export const PauseIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

export const ScissorIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);

export const UploadIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export const ZoomInIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
);

export const ZoomOutIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M8 11h6" />
  </svg>
);

export const SparklesIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export const TrashIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const XIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SendIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const SettingsIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

export const VolumeIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

export const MuteIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

export const PlusIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const EyeIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

export const EyeOffIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

export const LockIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export const UnlockIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export const MagnetIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v6a6 6 0 1 0 12 0V3m-4 0v6a2 2 0 1 1-4 0V3" />
  </svg>
);

export const LoaderIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const CopyIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
  </svg>
);

export const RefreshIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const ArrowUpIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
  </svg>
);

export const ArrowDownIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
  </svg>
);

export const MagicWandIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export const VideoIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const AudioIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

export const ExportIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const CheckIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const ClockIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const FileIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const HelpIcon = ({ className = DEFAULT_CLASS, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 21h.01" />
  </svg>
);
