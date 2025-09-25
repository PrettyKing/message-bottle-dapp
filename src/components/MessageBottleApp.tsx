'use client'

import React, { useState } from 'react';
import { MessageCircle, Gift, Heart, Clock, MapPin, User, Waves, Loader } from 'lucide-react';
import { smartAccountManager } from '../wallet/smartAccount';
import { useBottleQueries } from '../graphql/queries';

interface UserStats {
  bottlesDropped: number;
  bottlesFound: number;
  totalRewards: number;
  experience: number;
  level: number;
}

interface WalletState {
  isConnected: boolean;
  smartAccountAddress: string | null;
  eoaAddress: string | null;
  isDeployed: boolean;
  chainId?: number;
  networkName?: string;
}

const MessageBottleApp = () => {
  const [currentView, setCurrentView] = useState('ocean');
  const [userStats, setUserStats] = useState<UserStats>({
    bottlesDropped: 0,
    bottlesFound: 0,
    totalRewards: 0,
    experience: 0,
    level: 1
  });
  
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    smartAccountAddress: null,
    eoaAddress: null,
    isDeployed: false,
    chainId: undefined,
    networkName: undefined
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bottles, setBottles] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const { getUserStats, getBottlesInArea } = useBottleQueries();

  // 连接钱包函数
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await smartAccountManager.connect();

      // 获取网络信息
      const network = await smartAccountManager.getNetwork();

      setWalletState({
        isConnected: true,
        smartAccountAddress: result.smartAccountAddress,
        eoaAddress: result.eoaAddress,
        isDeployed: result.isDeployed,
        chainId: Number(network.chainId),
        networkName: network.chainId === 10143n ? 'Monad Testnet' : network.name
      });

      // 获取用户统计数据
      if (result.smartAccountAddress) {
        try {
          const stats = await getUserStats(result.smartAccountAddress);
          if (stats) {
            setUserStats({
              bottlesDropped: parseInt(stats.bottlesDropped) || 0,
              bottlesFound: parseInt(stats.bottlesFound) || 0,
              totalRewards: parseFloat(stats.totalRewards) || 0,
              experience: parseInt(stats.experience) || 0,
              level: parseInt(stats.level) || 1
            });
          }
        } catch (statsError) {
          console.log('Stats not available yet:', statsError);
        }
      }

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // 搜索区域内的漂流瓶
  const searchBottlesInArea = async () => {
    setLoading(true);
    try {
      const bounds = {
        minLat: 40.0,
        maxLat: 41.0,
        minLng: -75.0,
        maxLng: -73.0
      };

      const bottlesData = await getBottlesInArea(bounds);
      setBottles(bottlesData || []);
    } catch (err) {
      console.error('Failed to fetch bottles:', err);
    } finally {
      setLoading(false);
    }
  };

  // 投放漂流瓶视图
  const DropBottleView = () => {
    const [selectedType, setSelectedType] = useState('MESSAGE');
    const [message, setMessage] = useState('');
    const [reward, setReward] = useState('');
    const [isDropping, setIsDropping] = useState(false);

    const bottleTypeIcons = {
      MESSAGE: MessageCircle,
      TREASURE: Gift,
      WISH: Heart,
      TIME_CAPSULE: Clock
    };

    const handleDropBottle = async () => {
      if (!walletState.smartAccountAddress || !message.trim()) return;

      setIsDropping(true);
      try {
        // 模拟投放成功
        alert('Bottle dropped successfully! (Demo mode)');
        setCurrentView('ocean');
      } catch (err) {
        console.error('Failed to drop bottle:', err);
      } finally {
        setIsDropping(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-200 via-green-300 to-green-600 p-4">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => setCurrentView('ocean')}
            className="mb-4 text-white hover:text-green-100"
          >
            ← Back to Ocean
          </button>

          <div className="bg-white/90 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Drop a Message Bottle</h2>

            {/* 类型选择 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bottle Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(bottleTypeIcons).map(([type, IconComponent]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedType === type 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 消息内容 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
                placeholder="Write your message to the world..."
              />
            </div>

            {/* 奖励设置 */}
            {selectedType === 'TREASURE' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reward (ETH)</label>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0.01"
                  step="0.001"
                />
              </div>
            )}

            {/* 投放按钮 */}
            <button 
              onClick={handleDropBottle}
              disabled={isDropping || !message.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {isDropping ? (
                <Loader className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {isDropping ? 'Dropping...' : 'Drop Bottle (0.001 ETH fee)'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 主海洋视图
  const OceanView = () => (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-300 to-blue-600 relative overflow-hidden">
      {/* 海浪动画背景 */}
      <div className="absolute inset-0 opacity-30">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center bg-white/20 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Waves className="text-white w-6 h-6" />
            <h1 className="text-white font-bold text-xl">Message Bottle</h1>
          </div>
          
          {!walletState.isConnected ? (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {isConnecting ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div>Level {userStats.level}</div>
                <div>{userStats.experience} XP</div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 bg-red-500/20 backdrop-blur-md rounded-xl p-4">
            <p className="text-red-100 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10 p-4 space-y-4">
        {/* 钱包信息 */}
        {walletState.isConnected && (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
            <div className="text-white text-xs space-y-1">
              <div>Smart Account: {walletState.smartAccountAddress?.slice(0, 8)}...{walletState.smartAccountAddress?.slice(-6)}</div>
              <div>EOA: {walletState.eoaAddress?.slice(0, 8)}...{walletState.eoaAddress?.slice(-6)}</div>
              <div>Status: {walletState.isDeployed ? '✅ Deployed' : '⏳ Not deployed'}</div>
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        {walletState.isConnected && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{userStats.bottlesDropped}</div>
              <div className="text-white/80 text-sm">Dropped</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{userStats.bottlesFound}</div>
              <div className="text-white/80 text-sm">Found</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{userStats.totalRewards.toFixed(4)} ETH</div>
              <div className="text-white/80 text-sm">Rewards</div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setCurrentView('drop-bottle')}
            disabled={!walletState.isConnected}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-4 rounded-xl transition-colors"
          >
            <Gift className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Drop Bottle</div>
          </button>
          <button 
            onClick={() => setCurrentView('my-bottles')}
            disabled={!walletState.isConnected}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white p-4 rounded-xl transition-colors"
          >
            <MessageCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">My Bottles</div>
          </button>
        </div>

        {/* 漂流瓶地图模拟 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ocean Explorer
          </h2>
          
          <div className="relative bg-blue-400/30 rounded-lg h-64 overflow-hidden">
            {/* 模拟漂流瓶点 */}
            <div className="absolute w-8 h-8 rounded-full bg-white/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform bottle-glow" 
                 style={{left: '20%', top: '30%'}}>
              <Gift className="w-4 h-4 text-blue-500" />
            </div>
            <div className="absolute w-8 h-8 rounded-full bg-white/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" 
                 style={{left: '60%', top: '60%'}}>
              <MessageCircle className="w-4 h-4 text-gray-500" />
            </div>
            <div className="absolute w-8 h-8 rounded-full bg-white/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" 
                 style={{left: '80%', top: '20%'}}>
              <Heart className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button 
              onClick={searchBottlesInArea}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? 'Searching...' : 'Search This Area'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS样式 */}
      <style jsx>{`
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff10'%3E%3C/path%3E%3C/svg%3E");
          animation: wave 10s linear infinite;
        }
        .wave1 {
          animation-delay: 0s;
        }
        .wave2 {
          animation-delay: -5s;
        }
        .wave3 {
          animation-delay: -10s;
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-1200px); }
        }
      `}</style>
    </div>
  );

  // 主渲染
  switch (currentView) {
    case 'drop-bottle':
      return <DropBottleView />;
    case 'my-bottles':
      return <div>My Bottles View (Coming Soon)</div>;
    default:
      return <OceanView />;
  }
};

export default MessageBottleApp;