import React from 'react';
import { Wifi, Clock, Battery, Signal } from 'lucide-react';
import { format } from 'date-fns';

const StatusBar: React.FC = () => {
  const [time, setTime] = React.useState(new Date());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white border-b px-4 py-1 text-sm flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Clock size={14} className="text-gray-600 mr-1" />
          <span className="text-gray-800">{format(time, 'HH:mm:ss')}</span>
        </div>
        
        <div className="flex items-center">
          <Wifi size={14} className={isOnline ? 'text-green-500' : 'text-red-500'} />
          <span className="ml-1 text-gray-800">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Signal size={14} className="text-gray-600" />
        <Battery size={14} className="text-gray-600" />
      </div>
    </div>
  );
};

export default StatusBar;