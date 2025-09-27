'use client'

import React from 'react';
import { CheckCircle, Sparkles, Waves } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'drop' | 'find' | 'level';
  experience?: number;
  level?: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  experience,
  level
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'drop':
        return <Waves className="w-16 h-16 text-blue-400" />;
      case 'find':
        return <Sparkles className="w-16 h-16 text-yellow-400" />;
      case 'level':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      default:
        return <CheckCircle className="w-16 h-16 text-blue-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'drop':
        return 'from-blue-500 to-cyan-500';
      case 'find':
        return 'from-yellow-500 to-orange-500';
      case 'level':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景覆盖 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 模态框 */}
      <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        {/* 发光效果 */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${getGradient()} opacity-20 animate-pulse`}></div>

        {/* 内容 */}
        <div className="relative z-10 text-center space-y-6">
          {/* 图标 */}
          <div className="flex justify-center animate-bounce-gentle">
            {getIcon()}
          </div>

          {/* 标题 */}
          <h3 className="text-white text-2xl font-bold">{title}</h3>

          {/* 消息 */}
          <p className="text-slate-300 text-lg leading-relaxed">{message}</p>

          {/* 经验和等级信息 */}
          {(experience || level) && (
            <div className="flex justify-center gap-6 py-4">
              {experience && (
                <div className="text-center">
                  <div className="text-yellow-400 text-2xl font-bold">+{experience}</div>
                  <div className="text-slate-400 text-sm">经验值</div>
                </div>
              )}
              {level && (
                <div className="text-center">
                  <div className="text-purple-400 text-2xl font-bold">Lv.{level}</div>
                  <div className="text-slate-400 text-sm">等级</div>
                </div>
              )}
            </div>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${getGradient()} text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95`}
          >
            继续探索
          </button>
        </div>

        {/* 装饰粒子 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;