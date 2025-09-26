'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Gift, Heart, Clock, MapPin, User, Waves, Plus, Search, Settings, Zap, Brain, Eye } from 'lucide-react';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [smartInput, setSmartInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getUserStats, getBottlesInArea } = useBottleQueries();

  // 鼠标跟踪效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 连接钱包函数
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await smartAccountManager.connect();
      const network = await smartAccountManager.getNetwork();

      setWalletState({
        isConnected: true,
        smartAccountAddress: result.smartAccountAddress,
        eoaAddress: result.eoaAddress,
        isDeployed: result.isDeployed,
        chainId: Number(network.chainId),
        networkName: network.chainId === BigInt(10143) ? 'Monad Testnet' : network.name
      });

      if (result.smartAccountAddress) {
        try {
          const stats = await getUserStats(result.smartAccountAddress);
          if (stats) {
            setUserStats({
              bottlesDropped: parseInt(stats.bottlesDropped) || 0,
              bottlesFound: parseInt(stats.bottlesFound) || 0,
              totalRewards: parseInt(stats.totalRewards) || 0,
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

  // AI建议处理函数
  const handleAiSuggestion = async (inputText: string) => {
    if (inputText.length < 10) return;

    setIsAiThinking(true);

    // 模拟AI思考延迟
    setTimeout(() => {
      const suggestions = [
        "建议添加更多情感元素，让消息更有温度",
        "可以考虑加入一些神秘的线索，增加发现者的惊喜感",
        "这个想法很棒！不如添加一个时间胶囊的概念",
        "建议使用更具诗意的表达方式，让消息更加优美",
        "可以融入一些关于未来科技的畅想，增加科幻感",
        "考虑添加互动元素，让发现者可以回复您的消息"
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setAiSuggestion(randomSuggestion);
      setIsAiThinking(false);
    }, 1000 + Math.random() * 2000);
  };

  // 智能输入建议
  const getSmartSuggestions = (input: string) => {
    const keywords = input.toLowerCase().split(' ');
    const suggestions = [];

    if (keywords.includes('love') || keywords.includes('爱')) {
      suggestions.push('💕 爱意满满的消息');
    }
    if (keywords.includes('future') || keywords.includes('未来')) {
      suggestions.push('🚀 对未来的憧憬');
    }
    if (keywords.includes('dream') || keywords.includes('梦想')) {
      suggestions.push('✨ 梦想成真的愿望');
    }

    return suggestions;
  };

  // 未来感神经形态卡片组件
  const NeuralCard = ({ children, className = '', padding = 'p-8', variant = 'default', glow = false, style }: {
    children: React.ReactNode;
    className?: string;
    padding?: string;
    variant?: 'default' | 'primary' | 'neural' | 'quantum';
    glow?: boolean;
    style?: React.CSSProperties;
  }) => {
    const variants = {
      default: 'bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50',
      primary: 'bg-gradient-to-br from-blue-900/80 to-indigo-900/60 border-blue-500/30',
      neural: 'bg-gradient-to-br from-purple-900/80 to-pink-900/60 border-purple-400/30',
      quantum: 'bg-gradient-to-br from-emerald-900/80 to-cyan-900/60 border-emerald-400/30'
    };

    const glowEffects = {
      default: 'shadow-2xl shadow-slate-500/20',
      primary: 'shadow-2xl shadow-blue-500/30',
      neural: 'shadow-2xl shadow-purple-500/30',
      quantum: 'shadow-2xl shadow-emerald-500/30'
    };

    return (
      <div
        className={`
          relative overflow-hidden backdrop-blur-2xl rounded-[2rem] border
          ${variants[variant]}
          ${glow ? glowEffects[variant] : 'shadow-2xl shadow-black/30'}
          ${padding} ${className}
          transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl
          neural-morphism
        `}
        style={style}
      >
        {/* 神经网络背景纹理 */}
        <div className="absolute inset-0 opacity-10">
          <div className="neural-network-bg"></div>
        </div>

        {/* 动态边框光效 */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000 animate-border-flow"></div>

        {/* 内容 */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  };

  // 未来感按钮组件
  const FutureButton = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    loading = false,
    size = 'lg',
    className = '',
    neural = false,
    quantum = false
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'neural' | 'quantum';
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    neural?: boolean;
    quantum?: boolean;
  }) => {
    const baseClass = `
      relative overflow-hidden rounded-2xl font-bold transition-all duration-300
      flex items-center justify-center gap-3 group
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
        text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
        ${neural ? 'animate-neural-pulse' : ''}
      `,
      secondary: `
        bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500
        text-white shadow-lg shadow-slate-500/25
      `,
      ghost: `
        bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/10
        text-white backdrop-blur-xl
      `,
      neural: `
        bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
        text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
        animate-neural-pulse
      `,
      quantum: `
        bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400
        text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50
        ${quantum ? 'animate-quantum-flicker' : ''}
      `
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[2.5rem]',
      md: 'px-6 py-3 text-base min-h-[3rem]',
      lg: 'px-8 py-4 text-lg min-h-[3.5rem]',
      xl: 'px-12 py-6 text-xl min-h-[4rem]'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {/* 动态背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>

        {/* 神经网络连接线 */}
        {neural && (
          <div className="absolute inset-0 opacity-30">
            <div className="neural-connections"></div>
          </div>
        )}

        {/* 量子粒子效果 */}
        {quantum && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="quantum-particles"></div>
          </div>
        )}

        {/* 按钮内容 */}
        <div className="relative z-10 flex items-center gap-3">
          {loading && (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          )}
          {children}
        </div>

        {/* 点击波纹效果 */}
        <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
      </button>
    );
  };

  // AI智能输入框组件
  const SmartInput = ({
    value,
    onChange,
    placeholder = '',
    type = 'text',
    aiSuggestions = false,
    className = ''
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    aiSuggestions?: boolean;
    className?: string;
  }) => (
    <div className="relative group">
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full p-6 bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl
            text-white placeholder-slate-400 resize-none backdrop-blur-xl
            transition-all duration-300 focus:outline-none
            focus:border-blue-400/70 focus:bg-slate-900/70 focus:shadow-lg focus:shadow-blue-500/20
            hover:border-slate-600/70
            ${className}
          `}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full p-6 bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl
            text-white placeholder-slate-400 backdrop-blur-xl
            transition-all duration-300 focus:outline-none
            focus:border-blue-400/70 focus:bg-slate-900/70 focus:shadow-lg focus:shadow-blue-500/20
            hover:border-slate-600/70
            ${className}
          `}
        />
      )}

      {/* AI建议指示器 */}
      {aiSuggestions && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-50"></div>
          </div>
        </div>
      )}

      {/* 智能边框动画 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 animate-border-glow pointer-events-none"></div>
    </div>
  );

  // 未来感投放瓶子视图
  const DropBottleView = () => {
    const [selectedType, setSelectedType] = useState('MESSAGE');
    const [message, setMessage] = useState('');
    const [reward, setReward] = useState('');
    const [isDropping, setIsDropping] = useState(false);

    const bottleTypes = [
      {
        id: 'MESSAGE',
        icon: MessageCircle,
        label: '神经消息瓶',
        color: 'from-blue-500 to-cyan-500',
        desc: '思维传输',
        glow: 'shadow-blue-500/50'
      },
      {
        id: 'TREASURE',
        icon: Gift,
        label: '量子宝藏瓶',
        color: 'from-amber-500 to-orange-500',
        desc: '数字财富',
        glow: 'shadow-amber-500/50'
      },
      {
        id: 'WISH',
        icon: Heart,
        label: '情感共振瓶',
        color: 'from-rose-500 to-pink-500',
        desc: '心灵连接',
        glow: 'shadow-rose-500/50'
      },
      {
        id: 'TIME_CAPSULE',
        icon: Clock,
        label: '时空胶囊',
        color: 'from-purple-500 to-violet-500',
        desc: '未来记忆',
        glow: 'shadow-purple-500/50'
      }
    ];

    const handleDropBottle = async () => {
      if (!walletState.smartAccountAddress || !message.trim()) return;

      setIsDropping(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setMessage('');
        setReward('');
        // 未来感成功提示
      } catch (error) {
        console.error('Drop failed:', error);
      } finally {
        setIsDropping(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
        {/* 3D空间背景 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/neural-grid.svg')] opacity-10 animate-slow-drift"></div>
          <div className="floating-particles"></div>
          <div className="quantum-field"></div>
        </div>

        {/* 顶部导航 - 未来感 */}
        <div className="relative z-10 p-6">
          <NeuralCard padding="p-6" variant="neural" glow>
            <div className="flex justify-between items-center">
              <FutureButton
                onClick={() => setCurrentView('ocean')}
                variant="ghost"
                size="md"
                className="!p-4 !min-h-0"
              >
                <Waves className="text-white w-6 h-6" />
              </FutureButton>

              <div className="flex items-center gap-4">
                <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                <h1 className="text-white font-bold text-2xl tracking-wide">Neural Drop</h1>
              </div>

              <FutureButton
                onClick={() => setAiMode(!aiMode)}
                variant={aiMode ? 'neural' : 'ghost'}
                size="sm"
                neural={aiMode}
                className="!p-3 !min-h-0"
              >
                <Eye className="w-5 h-5" />
              </FutureButton>
            </div>
          </NeuralCard>
        </div>

        {/* 主要内容 */}
        <div className="relative z-10 px-6 space-y-8">
          {/* 瓶子类型选择 - 3D网格 */}
          <NeuralCard variant="default" glow>
            <div className="flex items-center gap-4 mb-8">
              <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
              <h2 className="text-white text-2xl font-bold tracking-wide">选择容器类型</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {bottleTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      relative group cursor-pointer p-8 rounded-3xl transition-all duration-500
                      bg-gradient-to-br ${type.color} hover:scale-105
                      ${selectedType === type.id
                        ? `ring-4 ring-white/50 scale-105 ${type.glow} shadow-2xl`
                        : 'shadow-xl hover:shadow-2xl'
                      }
                      neural-container
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* 3D深度效果 */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 to-transparent"></div>

                    {/* 选中指示器 */}
                    {selectedType === type.id && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                      <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                      <div className="text-white font-bold text-lg">{type.label}</div>
                      <div className="text-white/80 text-sm">{type.desc}</div>
                    </div>

                    {/* 悬停粒子效果 */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="particle-field"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </NeuralCard>

          {/* 智能消息输入 */}
          <NeuralCard variant="primary" glow>
            <div className="flex items-center gap-4 mb-6">
              <MessageCircle className="w-8 h-8 text-blue-400 animate-pulse" />
              <h3 className="text-white text-xl font-bold">神经链接消息</h3>
            </div>

            <div className="space-y-6">
              <SmartInput
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (aiMode && e.target.value.length > 10) {
                    handleAiSuggestion(e.target.value);
                  }
                }}
                placeholder={aiMode ? "AI正在分析您的思维模式..." : "输入您的消息内容..."}
                type="textarea"
                aiSuggestions={aiMode}
              />

              {/* AI建议显示 */}
              {aiMode && aiSuggestion && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-400 mt-1 animate-pulse" />
                    <div className="flex-1">
                      <div className="text-purple-300 text-sm font-medium mb-2">AI智能建议：</div>
                      <div className="text-white/80 text-sm leading-relaxed">{aiSuggestion}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-slate-400 text-sm">
                  字符: {message.length}/500
                </div>
                {aiMode && (
                  <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span>{isAiThinking ? 'AI思考中...' : 'AI增强模式'}</span>
                  </div>
                )}
              </div>
            </div>
          </NeuralCard>

          {/* 量子宝藏设置 */}
          {selectedType === 'TREASURE' && (
            <NeuralCard variant="quantum" glow>
              <div className="flex items-center gap-4 mb-6">
                <Gift className="w-8 h-8 text-emerald-400 animate-pulse" />
                <h3 className="text-white text-xl font-bold">量子奖励设置</h3>
              </div>

              <div className="space-y-6">
                <SmartInput
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="0.001 MON"
                  type="number"
                />

                <p className="text-slate-300 text-sm leading-relaxed">
                  奖励将通过量子隧道效应传输给发现者，确保去中心化分发
                </p>
              </div>
            </NeuralCard>
          )}

          {/* 投放按钮 */}
          <div className="pb-10">
            <FutureButton
              onClick={handleDropBottle}
              disabled={isDropping || !message.trim()}
              loading={isDropping}
              variant="neural"
              size="xl"
              className="w-full"
              neural
              quantum
            >
              {isDropping ? (
                <div className="flex items-center gap-3">
                  <div className="neural-loading"></div>
                  <span>量子传输中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  <span>启动神经传输</span>
                  <div className="ml-2 text-sm opacity-70">🚀</div>
                </div>
              )}
            </FutureButton>
          </div>
        </div>
      </div>
    );
  };

  // 主海洋视图 - 未来感重新设计
  const OceanView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* 3D全息背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="holographic-ocean"></div>
        <div className="floating-data-streams"></div>
        <div className="ambient-particles"></div>
      </div>

      {/* 桌面端主容器 */}
      <div className="container mx-auto max-w-7xl px-8 py-6 relative z-10">
        {/* 顶部导航HUD - 桌面优化 */}
        <NeuralCard padding="p-8" variant="neural" glow className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                  <Waves className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-4xl tracking-wide mb-2">Neural Ocean</h1>
                <p className="text-cyan-300 text-lg">去中心化量子漂流瓶网络</p>
              </div>

              {/* 桌面端导航菜单 */}
              <div className="hidden lg:flex items-center ml-12 space-x-8">
                <button
                  onClick={() => setCurrentView('ocean')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    currentView === 'ocean'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Waves className="w-5 h-5 inline-block mr-2" />
                  海洋探索
                </button>
                <button
                  onClick={() => setCurrentView('drop')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    currentView === 'drop'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-5 h-5 inline-block mr-2" />
                  投放瓶子
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* AI助手切换 */}
              <FutureButton
                onClick={() => setAiMode(!aiMode)}
                variant={aiMode ? 'neural' : 'ghost'}
                size="lg"
                neural={aiMode}
                className="!px-6"
              >
                <Brain className="w-6 h-6 mr-3" />
                AI助手
              </FutureButton>

              {!walletState.isConnected ? (
                <FutureButton
                  onClick={connectWallet}
                  disabled={isConnecting}
                  loading={isConnecting}
                  variant="quantum"
                  size="xl"
                  quantum
                >
                  {isConnecting ? '神经链接中...' : '连接量子钱包'}
                </FutureButton>
              ) : (
                <div className="flex items-center space-x-6">
                  <div className="text-right text-white">
                    <div className="font-bold text-xl">Level {userStats.level}</div>
                    <div className="text-cyan-300">{userStats.experience} Neural Points</div>
                  </div>
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                      <User className="text-white w-10 h-10" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-20"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </NeuralCard>

        {/* 错误提示 - 全息风格 */}
        {error && (
          <NeuralCard variant="default" className="border-red-500/50 bg-gradient-to-br from-red-900/50 to-red-800/30 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center">
                <span className="text-red-300 text-2xl">⚠</span>
              </div>
              <p className="text-red-200 flex-1 text-lg">{error}</p>
            </div>
          </NeuralCard>
        )}

        {/* 量子钱包状态 - 桌面端宽屏布局 */}
        {walletState.isConnected && (
          <NeuralCard variant="primary" glow className="mb-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 gap-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-slate-300 text-sm">量子地址</div>
                  <div className="text-white font-mono text-lg bg-slate-800/50 px-4 py-2 rounded-xl mt-2">
                    {walletState.smartAccountAddress?.slice(0, 8)}...{walletState.smartAccountAddress?.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 text-sm">神经网络</div>
                  <div className="text-green-300 font-medium text-lg mt-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    {walletState.networkName || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="text-slate-300 text-sm">同步状态</div>
                  <div className="text-blue-300 font-medium text-lg mt-2">
                    {walletState.isDeployed ? '已同步' : '同步中'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{userStats.level}</span>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 text-sm">神经等级</div>
                  <div className="text-amber-300 font-medium text-lg mt-2">
                    {userStats.experience} Neural Points
                  </div>
                </div>
              </div>
            </div>
          </NeuralCard>
        )}
      </div>

      {/* 桌面端主内容区域 */}
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        {/* 3D统计面板 - 桌面端网格优化 */}
        {walletState.isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {[
              { label: '已投放瓶子', value: userStats.bottlesDropped, color: 'from-blue-500 to-cyan-500', icon: '📤', desc: '您投放到神经海洋的瓶子数量' },
              { label: '已发现瓶子', value: userStats.bottlesFound, color: 'from-purple-500 to-pink-500', icon: '🔍', desc: '您在探索中发现的瓶子数量' },
              { label: '神经积分', value: userStats.totalRewards, color: 'from-emerald-500 to-teal-500', icon: '⚡', desc: '累计获得的神经网络奖励积分' }
            ].map((stat, index) => (
              <NeuralCard
                key={stat.label}
                padding="p-8"
                variant="default"
                glow
                className={`text-center bg-gradient-to-br ${stat.color} hover:scale-105 hover:shadow-2xl transition-all duration-500 cursor-pointer group`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-5xl font-bold text-white mb-3 neural-glow">{stat.value}</div>
                <div className="text-white font-semibold text-xl mb-2">{stat.label}</div>
                <div className="text-white/70 text-sm leading-relaxed">{stat.desc}</div>
              </NeuralCard>
            ))}
          </div>
        )}

        {/* 主要操作区域 - 双栏布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* 左栏：快速操作面板 */}
          <div className="space-y-8">
            <NeuralCard variant="neural" glow padding="p-8">
              <div className="flex items-center gap-4 mb-8">
                <Zap className="w-10 h-10 text-purple-400 animate-pulse" />
                <h2 className="text-white text-3xl font-bold">快速操作中心</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FutureButton
                  onClick={() => setCurrentView('drop')}
                  variant="neural"
                  size="xl"
                  className="h-24 flex justify-between items-center px-8"
                  disabled={!walletState.isConnected}
                  neural
                >
                  <div className="flex items-center gap-4">
                    <Plus className="w-8 h-8" />
                    <div className="text-left">
                      <div className="text-xl font-bold">神经投放</div>
                      <div className="text-sm opacity-70">将您的思想投入量子海洋</div>
                    </div>
                  </div>
                  <div className="text-4xl opacity-50">→</div>
                </FutureButton>

                <FutureButton
                  onClick={() => {/* 搜索功能 */}}
                  variant="quantum"
                  size="xl"
                  className="h-24 flex justify-between items-center px-8"
                  disabled={!walletState.isConnected}
                  quantum
                >
                  <div className="flex items-center gap-4">
                    <Search className="w-8 h-8" />
                    <div className="text-left">
                      <div className="text-xl font-bold">量子搜索</div>
                      <div className="text-sm opacity-70">在神经网络中寻找心灵共鸣</div>
                    </div>
                  </div>
                  <div className="text-4xl opacity-50">⚡</div>
                </FutureButton>

                <FutureButton
                  onClick={() => {/* 设置功能 */}}
                  variant="ghost"
                  size="xl"
                  className="h-24 flex justify-between items-center px-8"
                >
                  <div className="flex items-center gap-4">
                    <Settings className="w-8 h-8" />
                    <div className="text-left">
                      <div className="text-xl font-bold">神经设置</div>
                      <div className="text-sm opacity-70">配置您的量子钱包和偏好</div>
                    </div>
                  </div>
                  <div className="text-4xl opacity-50">⚙</div>
                </FutureButton>
              </div>
            </NeuralCard>
          </div>

          {/* 右栏：探索区域地图 */}
          <div className="space-y-8">
            <NeuralCard variant="quantum" glow padding="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <MapPin className="w-10 h-10 text-emerald-400 animate-pulse" />
                  <h2 className="text-white text-3xl font-bold">神经海域地图</h2>
                </div>
                <FutureButton variant="ghost" size="md">
                  <Eye className="w-6 h-6 mr-2" />
                  全息视图
                </FutureButton>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="neural-loading-complex"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    {
                      name: 'Sector Alpha-7',
                      probability: '神经活跃度: 极高',
                      color: 'from-blue-500 to-cyan-500',
                      icon: MessageCircle,
                      desc: '高频神经信号区域，大量意识数据流动',
                      bottles: 127
                    },
                    {
                      name: 'Quantum Bay-12',
                      probability: '量子波动: 中等',
                      color: 'from-purple-500 to-pink-500',
                      icon: Gift,
                      desc: '量子纠缠现象频发，神秘瓶子聚集地',
                      bottles: 89
                    },
                    {
                      name: 'Neural Deep-∞',
                      probability: '意识共振: 强烈',
                      color: 'from-emerald-500 to-teal-500',
                      icon: Heart,
                      desc: '深度意识共振点，情感瓶子的诞生地',
                      bottles: 203
                    }
                  ].map((area, index) => {
                    const Icon = area.icon;
                    return (
                      <div
                        key={area.name}
                        className="p-8 rounded-3xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-6">
                            <div className={`w-20 h-20 bg-gradient-to-r ${area.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
                              <Icon className="w-10 h-10 text-white" />
                              <div className="absolute -top-2 -right-2 bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                {area.bottles}
                              </div>
                            </div>
                            <div>
                              <div className="text-white font-bold text-2xl mb-2">{area.name}</div>
                              <div className="text-slate-300 text-lg mb-1">{area.probability}</div>
                              <div className="text-slate-400 text-sm leading-relaxed">{area.desc}</div>
                            </div>
                          </div>

                          <FutureButton
                            variant="quantum"
                            size="lg"
                            className="group-hover:scale-110"
                            quantum
                          >
                            <Search className="w-6 h-6 mr-3" />
                            开始探索
                          </FutureButton>
                        </div>

                        {/* 进度条显示活跃度 */}
                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${area.color} transition-all duration-1000 delay-${index * 200}`}
                            style={{
                              width: area.name === 'Sector Alpha-7' ? '95%' :
                                     area.name === 'Quantum Bay-12' ? '65%' : '85%',
                              animationDelay: `${index * 0.3}s`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NeuralCard>
          </div>
        </div>
      </div>

      {/* 底部安全区域 */}
      <div className="h-24"></div>
    </div>
  );

  // 主渲染逻辑
  return (
    <div className="font-system neural-interface">
      {currentView === 'ocean' && <OceanView />}
      {currentView === 'drop' && <DropBottleView />}

      {/* 桌面端AI助手面板 */}
      {aiMode && (
        <div className="fixed bottom-32 right-8 z-50">
          <NeuralCard variant="neural" padding="p-6" className="w-96 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                <h3 className="text-white font-bold text-xl">AI神经助手</h3>
              </div>
              <button
                onClick={() => setAiMode(false)}
                className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            {/* 智能建议 */}
            <div className="space-y-4">
              <div className="text-slate-300">智能建议：</div>
              {getSmartSuggestions(smartInput).length > 0 ? (
                getSmartSuggestions(smartInput).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-500/20 text-white hover:border-purple-400/50 transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => setSmartInput(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm p-4 bg-slate-800/30 rounded-xl">
                  输入内容以获取AI智能建议...
                </div>
              )}

              {/* 快速操作工具栏 */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-600/30">
                <FutureButton
                  variant="ghost"
                  size="md"
                  className="!py-3"
                  onClick={() => {/* 优化措辞功能 */}}
                >
                  ✨ 优化措辞
                </FutureButton>
                <FutureButton
                  variant="ghost"
                  size="md"
                  className="!py-3"
                  onClick={() => {/* 情感分析功能 */}}
                >
                  💭 情感分析
                </FutureButton>
                <FutureButton
                  variant="ghost"
                  size="md"
                  className="!py-3"
                  onClick={() => {/* 语法检查功能 */}}
                >
                  📝 语法检查
                </FutureButton>
                <FutureButton
                  variant="ghost"
                  size="md"
                  className="!py-3"
                  onClick={() => {/* 创意启发功能 */}}
                >
                  💡 创意启发
                </FutureButton>
              </div>
            </div>
          </NeuralCard>
        </div>
      )}

      {/* 桌面端浮动操作栏 */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {/* AI助手按钮 */}
        <FutureButton
          onClick={() => setAiMode(!aiMode)}
          variant={aiMode ? "neural" : "quantum"}
          size="lg"
          className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
          neural={aiMode}
          quantum={!aiMode}
        >
          <Brain className="text-white w-8 h-8" />
        </FutureButton>

        {/* 设置按钮 */}
        <FutureButton
          onClick={() => {/* 打开设置 */}}
          variant="ghost"
          size="lg"
          className="!rounded-full !w-16 !h-16 !p-0 shadow-xl hover:scale-110 transition-transform"
        >
          <Settings className="text-white w-7 h-7" />
        </FutureButton>
      </div>

      {/* 全屏粒子系统 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="cosmic-background"></div>
      </div>
    </div>
  );
};

export default MessageBottleApp;