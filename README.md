# 🌊 Neural Ocean - 去中心化漂流瓶 DApp

一个基于 Monad 区块链的去中心化漂流瓶应用，采用 MetaMask Smart Accounts 和现代化的 PC 端界面设计。

![Neural Ocean](https://img.shields.io/badge/Status-Ready%20for%20Deployment-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Monad](https://img.shields.io/badge/Blockchain-Monad-purple)

## ✨ 特性

### 🎯 核心功能
- **多类型漂流瓶**: 支持消息瓶、宝藏瓶、情感共振瓶、时空胶囊四种类型
- **智能投放系统**: 多个投放区域选择，实时显示发现率和活跃度
- **情感标签系统**: 丰富的心情选择和自定义标签功能
- **等级经验系统**: 基于复杂度的经验奖励机制
- **实时预览**: 右侧预览面板，实时显示瓶子配置

### 🖥️ PC端优化
- **双栏布局**: 左侧配置面板 + 右侧预览面板
- **响应式设计**: 针对 1024px+ 屏幕优化
- **高效交互**: 减少垂直滚动，提高操作效率
- **现代界面**: 神经网络主题，未来感十足

### ⛓️ 区块链集成
- **Monad 区块链**: 高性能 EVM 兼容链
- **MetaMask Smart Accounts**: 现代化钱包体验
- **Envio 索引器**: 实时数据同步
- **IPFS 存储**: 去中心化内容存储

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
# 或者
yarn install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的私钥
```

### 3. 启动开发环境
```bash
# 启动前端应用
npm run dev

# 启动Envio索引器 (新终端)
npm run envio:codegen
npm run envio:dev
```

### 4. 部署到Monad测试网
```bash
# 获取测试代币: https://faucet.monad.xyz
# 运行部署脚本
chmod +x deploy-to-monad.sh
./deploy-to-monad.sh
```

## 🏗️ 项目架构

### 智能合约 (contracts/)
- `MessageBottle.sol` - 主合约，支持投放和发现漂流瓶
- 支持4种瓶子类型：消息瓶、宝藏瓶、许愿瓶、时间胶囊
- 稀有度系统：普通、稀有、史诗、传说
- 用户等级和经验系统

### 前端应用 (src/)
- `app/` - Next.js App Router页面
- `components/` - React组件
- `wallet/` - MetaMask智能账户集成
- `graphql/` - Envio数据查询

### 数据索引 (envio/)
- Envio配置和事件处理器
- GraphQL查询定义
- 实时数据同步

## 🌟 技术亮点

### 🔗 区块链技术
- **Monad区块链**: 高性能EVM兼容链
- **智能合约**: Solidity 0.8.20，安全性优化
- **Gas优化**: 高效的存储和计算设计

### 💼 智能账户
- **MetaMask SDK**: 无缝钱包集成
- **网络自动切换**: 一键连接Monad测试网
- **用户友好**: 简化的交易流程

### 📊 数据管理
- **Envio索引器**: 实时事件监听
- **GraphQL API**: 高效数据查询
- **Apollo Client**: 状态管理

### 🎨 用户界面
- **海洋主题设计**: 沉浸式视觉体验
- **响应式布局**: 支持所有设备
- **流畅动画**: Framer Motion动效

## 📱 功能特性

### 投放漂流瓶
- 选择瓶子类型（消息/宝藏/许愿/时间胶囊）
- 写入个人消息
- 设置地理位置
- 添加奖励（宝藏瓶）

### 发现漂流瓶
- 随机发现机制
- 区域搜索功能
- 稀有度奖励系统
- 经验和等级提升

### 用户系统
- 个人统计面板
- 投放历史记录
- 发现成就系统
- 等级和经验展示

## 🛠️ 开发工具

### 构建工具
- **Next.js 14**: React框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 原子化CSS
- **ESLint**: 代码规范

### 区块链工具
- **Hardhat**: 开发环境
- **Ethers.js**: 区块链交互
- **OpenZeppelin**: 安全合约库

### 索引工具
- **Envio**: 事件索引器
- **GraphQL**: 查询语言
- **Apollo Client**: 客户端管理

## 📋 部署清单

### 必需步骤
1. ✅ 获取Monad测试网代币
2. ✅ 配置环境变量 (.env)
3. ✅ 部署智能合约
4. ✅ 启动Envio索引器
5. ✅ 启动前端应用

### 配置文件
- ✅ `hardhat.config.js` - Hardhat配置
- ✅ `envio/config.yaml` - Envio配置
- ✅ `next.config.js` - Next.js配置
- ✅ `tailwind.config.js` - 样式配置

## 🎯 使用示例

### 连接钱包
```javascript
import { smartAccountManager } from './src/wallet/smartAccount';

const walletInfo = await smartAccountManager.connect();
console.log('Smart Account:', walletInfo.smartAccountAddress);
```

### 投放漂流瓶
```javascript
// 通过合约交互投放漂流瓶
const tx = await contract.dropBottle(
  0, // 消息瓶
  "Hello, World!",
  40123456, // 纬度
  116123456  // 经度
);
```

### 查询数据
```javascript
import { useBottleQueries } from './src/graphql/queries';

const { getUserStats } = useBottleQueries();
const stats = await getUserStats(userAddress);
```

## 🌐 网络配置

### Monad测试网
- **Chain ID**: 41454
- **RPC URL**: https://testnet1.monad.xyz/
- **Explorer**: https://testnet1.monad.xyz/
- **Faucet**: https://faucet.monad.xyz

## 🏆 项目优势

### 创新性
- 独特的区块链漂流瓶概念
- 结合地理位置的去中心化应用
- 游戏化的用户体验设计

### 技术完整性
- 全栈Web3应用开发
- 智能合约到前端的完整实现
- 现代化的技术栈选择

### 用户体验
- 直观的操作流程
- 美观的视觉设计
- 流畅的交互体验

## 📞 支持

如需帮助，请查看：
- 📖 [开发文档](./GETTING_STARTED.md)
- 📋 [任务清单](./TODO.md)
- 🚀 [部署脚本](./deploy-to-monad.sh)

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**项目状态**: 🟢 准备就绪，可立即部署和演示！

**最后更新**: 2025-09-25