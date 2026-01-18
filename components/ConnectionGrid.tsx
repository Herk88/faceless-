
import React from 'react';

const ConnectionCard: React.FC<{ icon: React.ReactElement; name: string; color: string }> = ({ icon, name, color }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 flex flex-col items-center justify-center gap-4 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <button className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
            Connect
        </button>
    </div>
);

const TikTokIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.95-6.43-2.8-1.59-1.87-2.32-4.2-1.86-6.33.32-1.45 1.11-2.73 2.13-3.72 1.02-1 2.34-1.57 3.71-1.79.03-2.5.01-4.99-.02-7.48-.22-1.31-.63-2.59-1.32-3.76-.85-1.4-2.38-2.39-4.04-2.5v-4.02c.98.02 1.96.08 2.92.21 1.45.19 2.83.67 4.09 1.47Z"/></svg>;
const YouTubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.442c-3.117 0-3.486.01-4.711.066-2.586.118-3.927 1.46-4.044 4.044-.056 1.225-.066 1.594-.066 4.711s.01 3.486.066 4.711c.118 2.585 1.458 3.927 4.044 4.044 1.225.056 1.594.066 4.711.066s3.486-.01 4.711-.066c2.586-.118 3.927-1.458 4.044-4.044.056-1.225.066-1.594.066-4.711s-.01-3.486-.066-4.711c-.118-2.586-1.458-3.927-4.044-4.044-1.225-.056-1.594-.066-4.711-.066zM12 6.874a5.126 5.126 0 1 0 0 10.252 5.126 5.126 0 0 0 0-10.252zm0 8.812a3.688 3.688 0 1 1 0-7.375 3.688 3.688 0 0 1 0 7.375zM17.804 5.212a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>;


export const ConnectionGrid: React.FC = () => {
    return (
        <div>
            <h2 className="text-center text-lg font-semibold text-gray-300 mb-4">Connect Your Accounts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ConnectionCard name="TikTok" icon={<TikTokIcon />} color="bg-black" />
                <ConnectionCard name="YouTube" icon={<YouTubeIcon />} color="bg-red-600" />
                <ConnectionCard name="Instagram" icon={<InstagramIcon />} color="bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
        </div>
    );
};
