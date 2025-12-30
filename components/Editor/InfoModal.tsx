

import React from 'react';
import { XIcon, GithubIcon, TwitterIcon, GlobeIcon, InfoIcon } from '../UI/Icons';

interface InfoModalProps {
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-[#121212] border border-osve-border rounded-lg w-[400px] shadow-2xl overflow-hidden relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-osve-active rounded-full flex items-center justify-center mb-6 border border-osve-border">
                        <InfoIcon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">Os-Ve Pro</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Advanced Open Source Video Editor<br/>
                        Built with React & Web Technologies
                    </p>

                    <div className="w-full space-y-3">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Developer Credits</h3>
                         
                         <a 
                            href="https://dovvnloading.github.io/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded bg-osve-panel border border-osve-border hover:border-white hover:bg-osve-active transition-all group"
                         >
                             <GlobeIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                             <div className="text-left">
                                 <div className="text-sm font-bold text-gray-200 group-hover:text-white">Portfolio</div>
                                 <div className="text-xs text-gray-600">dovvnloading.github.io</div>
                             </div>
                         </a>

                         <a 
                            href="https://x.com/D3VAUX" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded bg-osve-panel border border-osve-border hover:border-white hover:bg-osve-active transition-all group"
                         >
                             <TwitterIcon className="w-5 h-5 text-gray-400 group-hover:text-sky-500" />
                             <div className="text-left">
                                 <div className="text-sm font-bold text-gray-200 group-hover:text-white">X (Twitter)</div>
                                 <div className="text-xs text-gray-600">@</div>
                             </div>
                         </a>

                         <a 
                            href="https://github.com/dovvnloading/Os-Video-Editor" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded bg-osve-panel border border-osve-border hover:border-white hover:bg-osve-active transition-all group"
                         >
                             <GithubIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                             <div className="text-left">
                                 <div className="text-sm font-bold text-gray-200 group-hover:text-white">GitHub</div>
                                 <div className="text-xs text-gray-600">Source Code</div>
                             </div>
                         </a>
                    </div>

                    <div className="mt-8 text-[10px] text-gray-700 font-mono">
                        © {new Date().getFullYear()} Matthew R. Wesney. MIT License.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
