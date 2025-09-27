'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Gift, Heart, Clock, MapPin, User, Waves, Plus, Search, Settings, Zap, Brain, Eye, Tag, X, Rocket } from 'lucide-react';
import { smartAccountManager } from '../wallet/smartAccount';
import { useBottleQueries } from '../graphql/queries';
import SuccessModal from './SuccessModal';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { notify } from '../utils/notifications';

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

  // 使用本地存储持久化用户统计
  const [userStats, setUserStats] = useLocalStorage<UserStats>(STORAGE_KEYS.USER_STATS, {
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
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'drop' | 'find' | 'level';
    experience?: number;
    level?: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'drop'
  });
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
    className = '',
    onKeyPress
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    aiSuggestions?: boolean;
    className?: string;
    onKeyPress?: (e: React.KeyboardEvent) => void;
  }) => (
    <div className="relative group">
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onKeyPress={onKeyPress}
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
          onKeyPress={onKeyPress}
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
    const [dropAnimation, setDropAnimation] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('neural_ocean');
    const [mood, setMood] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    const bottleTypes = [
      {
        id: 'MESSAGE',
        icon: MessageCircle,
        label: '神经消息瓶',
        color: 'from-blue-500 to-cyan-500',
        desc: '思维传输',
        glow: 'shadow-blue-500/50',
        features: ['即时传输', '情感共振', '跨时空通信'],
        complexity: 'simple'
      },
      {
        id: 'TREASURE',
        icon: Gift,
        label: '量子宝藏瓶',
        color: 'from-amber-500 to-orange-500',
        desc: '数字财富',
        glow: 'shadow-amber-500/50',
        features: ['加密奖励', '智能合约', '自动分发'],
        complexity: 'advanced'
      },
      {
        id: 'WISH',
        icon: Heart,
        label: '情感共振瓶',
        color: 'from-rose-500 to-pink-500',
        desc: '心灵连接',
        glow: 'shadow-rose-500/50',
        features: ['情感识别', '共鸣匹配', '治愈能量'],
        complexity: 'medium'
      },
      {
        id: 'TIME_CAPSULE',
        icon: Clock,
        label: '时空胶囊',
        color: 'from-purple-500 to-violet-500',
        desc: '未来记忆',
        glow: 'shadow-purple-500/50',
        features: ['延时释放', '时间锁定', '预约传送'],
        complexity: 'expert'
      }
    ];

    const dropLocations = [
      {
        id: 'neural_ocean',
        name: '神经海洋中心',
        desc: '最活跃的思维交汇区域',
        discovery: '高',
        traffic: 95
      },
      {
        id: 'quantum_deep',
        name: '量子深渊',
        desc: '神秘的深层意识空间',
        discovery: '中',
        traffic: 65
      },
      {
        id: 'memory_shores',
        name: '记忆海岸',
        desc: '温暖的回忆聚集地',
        discovery: '高',
        traffic: 88
      },
      {
        id: 'dream_currents',
        name: '梦境洋流',
        desc: '创意与想象的漩涡',
        discovery: '低',
        traffic: 45
      }
    ];

    const popularTags = ['希望', '友谊', '科技', '未来', '爱情', '冒险', '智慧', '创新'];

    const handleDropBottle = async () => {
      if (!walletState.smartAccountAddress || !message.trim()) return;

      setIsDropping(true);
      setDropAnimation(true);

      try {
        // 获取选中的位置信息
        const location = dropLocations.find(loc => loc.id === selectedLocation);

        // 模拟智能合约交互
        console.log('🌊 Dropping bottle...', {
          type: selectedType,
          message: message.slice(0, 50) + '...',
          reward: reward || '0',
          location: location?.name || 'Neural Ocean',
          mood,
          tags,
          coordinates: {
            x: Math.random() * 1000,
            y: Math.random() * 1000
          }
        });

        // 模拟区块链交易延迟和动画
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 计算经验奖励
        const baseExp = 100;
        const complexityBonus: { [key: string]: number } = {
          'simple': 0,
          'medium': 50,
          'advanced': 100,
          'expert': 200
        };
        const selectedBottleType = bottleTypes.find(bt => bt.id === selectedType);
        const complexity = selectedBottleType?.complexity || 'simple';
        const experienceGained = baseExp + (complexityBonus[complexity] || 0);

        // 更新用户统计
        setUserStats(prev => ({
          ...prev,
          bottlesDropped: prev.bottlesDropped + 1,
          experience: prev.experience + experienceGained,
          level: Math.floor((prev.experience + experienceGained) / 1000) + 1
        }));

        // 重置表单
        setMessage('');
        setReward('');
        setMood('');
        setTags([]);
        setNewTag('');

        // 显示成功模态框
        setSuccessModal({
          isOpen: true,
          title: '🌊 量子传输完成！',
          message: `您的${selectedBottleType?.label}已成功投放到${location?.name}！获得了 ${experienceGained} 神经积分。`,
          type: 'drop',
          experience: experienceGained,
          level: Math.floor((userStats.experience + experienceGained) / 1000) + 1
        });

        // 发送通知
        notify.success('投放成功', `您的${selectedBottleType?.label}已在${location?.name}成功部署！`);
        console.log('✅ Bottle dropped successfully!');
      } catch (error) {
        console.error('❌ Drop failed:', error);
        setError('量子传输失败，请重试。');
      } finally {
        setIsDropping(false);
        setTimeout(() => setDropAnimation(false), 1000);
      }
    };

    const addTag = () => {
      if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
        setTags([...tags, newTag.trim()]);
        setNewTag('');
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const getComplexityColor = (complexity: string) => {
      switch (complexity) {
        case 'simple': return 'text-green-400';
        case 'medium': return 'text-yellow-400';
        case 'advanced': return 'text-orange-400';
        case 'expert': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    const getComplexityLabel = (complexity: string) => {
      switch (complexity) {
        case 'simple': return '简单';
        case 'medium': return '中等';
        case 'advanced': return '高级';
        case 'expert': return '专家';
        default: return '未知';
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

        {/* 顶部导航栏 - PC端优化 */}
        <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <FutureButton
                  onClick={() => setCurrentView('ocean')}
                  variant="ghost"
                  size="md"
                  className="!px-4 !py-2"
                >
                  <Waves className="w-5 h-5 mr-2" />
                  返回海洋
                </FutureButton>
                <div className="h-6 w-px bg-white/20"></div>
                <div className="flex items-center gap-3">
                  <Brain className="w-7 h-7 text-purple-400 animate-pulse" />
                  <h1 className="text-white font-bold text-xl tracking-wide">神经瓶子工厂</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FutureButton
                  onClick={() => setAiMode(!aiMode)}
                  variant={aiMode ? 'neural' : 'ghost'}
                  size="sm"
                  neural={aiMode}
                  className="!px-3 !py-2"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {aiMode ? 'AI增强' : 'AI辅助'}
                </FutureButton>
                <FutureButton
                  onClick={() => setPreviewMode(!previewMode)}
                  variant={previewMode ? 'quantum' : 'ghost'}
                  size="sm"
                  className="!px-3 !py-2"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {previewMode ? '退出预览' : '3D预览'}
                </FutureButton>
              </div>
            </div>
          </div>
        </div>

        {/* PC端双栏布局 */}
        <div className="max-w-7xl mx-auto px-8 py-8 relative z-10">
          <div className="grid grid-cols-12 gap-8 h-[calc(100vh-12rem)]">

            {/* 左侧配置面板 */}
            <div className="col-span-8 space-y-5 overflow-y-auto custom-scrollbar pr-4">

              {/* 瓶子类型选择 - PC端紧凑版 */}
              <NeuralCard variant="default" glow padding="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <h2 className="text-white text-lg font-bold">瓶子类型</h2>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {bottleTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`
                          relative cursor-pointer p-4 rounded-xl transition-all duration-300
                          ${selectedType === type.id
                            ? `bg-gradient-to-br ${type.color} ring-2 ring-white/50 scale-105`
                            : 'bg-slate-800/50 hover:bg-slate-700/50 hover:scale-105'
                          }
                          border border-white/10 hover:border-white/20 group
                        `}
                      >
                        <div className="text-center space-y-2">
                          <Icon className={`w-8 h-8 mx-auto transition-colors duration-300 ${
                            selectedType === type.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                          }`} />
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            selectedType === type.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                          }`}>
                            {type.label.replace('神经', '').replace('量子', '').replace('情感共振', '心灵').replace('时空胶囊', '时光')}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(type.complexity)} bg-black/20`}>
                            {getComplexityLabel(type.complexity)}
                          </div>
                        </div>
                        {selectedType === type.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 选中类型的详细信息 */}
                {selectedType && (
                  <div className="mt-4 p-4 bg-slate-800/30 rounded-xl">
                    {(() => {
                      const selected = bottleTypes.find(t => t.id === selectedType);
                      if (!selected) return null;
                      const Icon = selected.icon;
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-white font-medium text-sm">{selected.label}</div>
                              <div className="text-slate-400 text-xs">{selected.desc}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selected.features.map((feature, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </NeuralCard>

              {/* 投放位置选择 - PC端紧凑版 */}
              <NeuralCard variant="quantum" glow padding="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-white text-lg font-bold">投放区域</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {dropLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`
                        p-3 rounded-xl cursor-pointer transition-all duration-300 group
                        ${selectedLocation === location.id
                          ? 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80 ring-2 ring-emerald-400/50'
                          : 'bg-slate-800/50 hover:bg-slate-700/70'
                        }
                        border border-white/10 hover:border-white/20
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium text-sm ${
                          selectedLocation === location.id ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {location.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.discovery === '高' ? 'bg-green-500/30 text-green-300' :
                          location.discovery === '中' ? 'bg-yellow-500/30 text-yellow-300' :
                          'bg-red-500/30 text-red-300'
                        }`}>
                          {location.discovery}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{location.desc}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${location.traffic}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{location.traffic}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </NeuralCard>

              {/* 智能消息输入 - PC端紧凑版 */}
              <NeuralCard variant="primary" glow padding="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <h3 className="text-white text-lg font-bold">消息内容</h3>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {message.length}/500
                  </div>
                </div>

                <div className="space-y-4">
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
                    className="!p-4 !text-sm"
                  />

                  {/* 心情和标签 - 水平布局 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 心情选择器 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span className="text-white text-sm font-medium">情感</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['😊 快乐', '💭 思考', '🌟 兴奋', '💙 平静'].map((emotion) => (
                          <button
                            key={emotion}
                            onClick={() => setMood(mood === emotion ? '' : emotion)}
                            className={`
                              px-2 py-1.5 rounded-lg text-xs transition-all duration-300 text-center
                              ${mood === emotion
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
                              }
                              border border-white/10 hover:border-white/20
                            `}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 标签系统 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm font-medium">标签 ({tags.length}/5)</span>
                      </div>

                      {/* 标签输入 */}
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          placeholder="添加标签..."
                          className="flex-1 px-3 py-1.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                        />
                        <button
                          onClick={addTag}
                          disabled={!newTag.trim() || tags.length >= 5}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 已选标签 */}
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-500/80 text-white text-xs rounded-full flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* 热门标签 */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {popularTags.filter(tag => !tags.includes(tag)).slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => tags.length < 5 && setTags([...tags, tag])}
                            className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-slate-600/70 transition-colors"
                            disabled={tags.length >= 5}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI建议显示 */}
                  {aiMode && aiSuggestion && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30">
                      <div className="flex items-start gap-3">
                        <Brain className="w-4 h-4 text-purple-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-purple-300 text-xs font-medium mb-1">AI建议：</div>
                          <div className="text-white/80 text-xs leading-relaxed">{aiSuggestion}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </NeuralCard>

              {/* 量子宝藏设置 - PC端紧凑版 */}
              {selectedType === 'TREASURE' && (
                <NeuralCard variant="quantum" glow padding="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-white text-lg font-bold">奖励设置</h3>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="number"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      placeholder="0.001 MON"
                      step="0.001"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <p className="text-slate-400 text-xs leading-relaxed">
                      奖励将通过智能合约自动分发给发现者
                    </p>
                  </div>
                </NeuralCard>
              )}
            </div>

            {/* 右侧预览面板 */}
            <div className="col-span-4 space-y-5">

              {/* 实时预览卡片 */}
              <NeuralCard variant="neural" glow padding="p-5" className="sticky top-0">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-white text-lg font-bold">实时预览</h3>
                </div>

                {/* 瓶子3D预览 */}
                <div className="relative mb-6">
                  <div className={`
                    w-full h-40 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br ${bottleTypes.find(bt => bt.id === selectedType)?.color || 'from-slate-700 to-slate-600'}
                    ${dropAnimation ? 'animate-pulse' : ''}
                    shadow-xl
                  `}>
                    {(() => {
                      const selectedBottleType = bottleTypes.find(bt => bt.id === selectedType);
                      const Icon = selectedBottleType?.icon || MessageCircle;
                      return (
                        <div className="text-center space-y-3">
                          <Icon className="w-16 h-16 text-white mx-auto drop-shadow-lg" />
                          <div className="text-white font-bold text-lg">{selectedBottleType?.label}</div>
                          <div className={`text-xs px-3 py-1 rounded-full ${getComplexityColor(selectedBottleType?.complexity || 'simple')} bg-black/30`}>
                            {getComplexityLabel(selectedBottleType?.complexity || 'simple')}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 投放摘要 */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">投放区域:</span>
                      <span className="text-white font-medium">
                        {dropLocations.find(loc => loc.id === selectedLocation)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">消息长度:</span>
                      <span className="text-white font-medium">{message.length} 字符</span>
                    </div>
                    {selectedType === 'TREASURE' && reward && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">奖励金额:</span>
                        <span className="text-emerald-400 font-bold">{reward} MON</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">预计积分:</span>
                      <span className="text-emerald-400 font-bold">
                        +{100 + (bottleTypes.find(bt => bt.id === selectedType)?.complexity === 'expert' ? 200 :
                                bottleTypes.find(bt => bt.id === selectedType)?.complexity === 'advanced' ? 100 :
                                bottleTypes.find(bt => bt.id === selectedType)?.complexity === 'medium' ? 50 : 0)} 积分
                      </span>
                    </div>
                  </div>

                  {/* 标签和心情预览 */}
                  {(tags.length > 0 || mood) && (
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-white/10">
                      {mood && (
                        <div className="mb-2 text-sm">
                          <span className="text-slate-400">情感: </span>
                          <span className="text-white">{mood}</span>
                        </div>
                      )}
                      {tags.length > 0 && (
                        <div className="text-sm">
                          <span className="text-slate-400">标签: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-purple-500/60 text-white text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 投放按钮 */}
                <div className="mt-6">
                  <FutureButton
                    onClick={handleDropBottle}
                    disabled={isDropping || !message.trim()}
                    loading={isDropping}
                    variant="neural"
                    size="lg"
                    className={`w-full ${dropAnimation ? 'animate-bounce' : ''}`}
                    neural
                    quantum
                  >
                    {isDropping ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>量子传输中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        <span>启动神经传输</span>
                        <div className="ml-2 text-sm opacity-70">🚀</div>
                      </div>
                    )}
                  </FutureButton>

                  {/* 传输状态指示器 */}
                  {dropAnimation && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>传输进度</span>
                        <span>量子加密中...</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full animate-pulse" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </NeuralCard>

              {/* 使用统计 */}
              <NeuralCard variant="default" glow padding="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-slate-400" />
                  <h3 className="text-white text-lg font-bold">统计信息</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">已投放:</span>
                    <span className="text-white font-medium">{userStats.bottlesDropped} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">当前等级:</span>
                    <span className="text-purple-400 font-bold">Lv.{userStats.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">经验值:</span>
                    <span className="text-emerald-400 font-medium">{userStats.experience}</span>
                  </div>
                </div>
              </NeuralCard>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // 探索区域处理函数
  const handleExploreArea = async (areaName: string) => {
    if (!walletState.smartAccountAddress) return;

    setLoading(true);
    try {
      console.log('🔍 Exploring area:', areaName);

      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟发现瓶子
      const foundBottle = Math.random() > 0.3; // 70% 概率发现瓶子

      if (foundBottle) {
        const bottleTypes = ['MESSAGE', 'TREASURE', 'WISH', 'TIME_CAPSULE'];
        const randomType = bottleTypes[Math.floor(Math.random() * bottleTypes.length)];
        const experience = Math.floor(Math.random() * 200) + 50;

        setUserStats(prev => ({
          ...prev,
          bottlesFound: prev.bottlesFound + 1,
          experience: prev.experience + experience,
          level: Math.floor((prev.experience + experience) / 1000) + 1
        }));

        // 显示发现瓶子的成功模态框
        setSuccessModal({
          isOpen: true,
          title: '✨ 发现瓶子！',
          message: `在${areaName}发现了一个${randomType === 'MESSAGE' ? '神经消息瓶' :
                     randomType === 'TREASURE' ? '量子宝藏瓶' :
                     randomType === 'WISH' ? '情感共振瓶' : '时空胶囊'}！`,
          type: 'find',
          experience: experience,
          level: Math.floor((userStats.experience + experience) / 1000) + 1
        });

        // 发送通知
        notify.success('发现瓶子', `在${areaName}发现了一个漂流瓶！获得 ${experience} 经验值`);
        console.log(`✨ Found a ${randomType} bottle! +${experience} EXP`);
      } else {
        console.log('🌊 No bottles found in this area. Try another location!');
      }

    } catch (error) {
      console.error('❌ Exploration failed:', error);
      setError('Exploration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
                            onClick={() => handleExploreArea(area.name)}
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

      {/* 成功模态框 */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
        experience={successModal.experience}
        level={successModal.level}
      />
    </div>
  );
};

export default MessageBottleApp;