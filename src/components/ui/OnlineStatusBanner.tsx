import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiIcon, WifiOffIcon } from 'lucide-react';

export const OnlineStatusBanner = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`
        hidden md:flex fixed bottom-4 right-4 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg
        ${isOnline 
          ? 'bg-green-50 text-green-700' 
          : 'bg-yellow-50 text-yellow-700'
        }
      `}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <WifiIcon className="h-4 w-4" />
          {/* <span>在线模式 - 数据将同步到云端</span> */}
        </>
      ) : (
        <>
          <WifiOffIcon className="h-4 w-4" />
          {/* <span>离线模式 - 数据将保存在本地</span> */}
        </>
      )}
    </div>
  );
}; 