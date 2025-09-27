# 🚀 部署指南

Neural Ocean DApp 完整部署流程指南

## 📋 部署概览

本指南将引导您完成 Neural Ocean 的完整部署，包括：
- 智能合约部署到 Monad 测试网
- 前端应用部署到 Vercel
- Envio 索引器配置和启动
- 环境配置和监控设置

## 🎯 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │ Smart Contract  │    │ Envio Indexer   │
│   (Vercel)      │    │ (Monad Testnet) │    │ (Self-hosted)   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Next.js App   │◄──►│ • MessageBottle │◄──►│ • Event Listener│
│ • MetaMask SDK  │    │ • ERC standards │    │ • GraphQL API   │
│ • Apollo Client │    │ • Gas Optimized │    │ • Real-time Sync│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ 环境准备

### 1. 系统要求

- **操作系统**: Linux/macOS/Windows
- **Node.js**: >= 18.0.0
- **NPM**: >= 8.0.0
- **Git**: 最新版本
- **Docker**: >= 20.10.0 (可选，用于容器化部署)

### 2. 依赖工具

```bash
# 安装必要工具
npm install -g hardhat-shorthand
npm install -g @envio-dev/envio

# 验证安装
node --version
npm --version
hh --version  # hardhat shorthand
envio --version
```

### 3. 账户准备

#### Monad 测试网账户
- 创建或导入 MetaMask 钱包
- 获取测试网 MON 代币: https://faucet.monad.xyz
- 导出私钥用于部署（仅测试网）

#### 部署服务账户
- **Vercel**: 注册账户用于前端部署
- **Alchemy/Infura**: 获取 RPC 端点（可选）
- **Pinata**: IPFS 存储服务账户

## 🔧 配置环境变量

### 1. 复制环境模板

```bash
cp .env.example .env
```

### 2. 配置 .env 文件

```bash
# ===== 区块链配置 =====
# Monad 测试网配置
NEXT_PUBLIC_CONTRACT_ADDRESS=        # 部署后填入
NEXT_PUBLIC_CHAIN_ID=10143
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz/
NEXT_PUBLIC_EXPLORER_URL=https://testnet.monadexplorer.com/

# ===== 部署私钥 =====
# ⚠️ 警告: 仅用于测试网，生产环境使用硬件钱包
PRIVATE_KEY=your_test_private_key_here

# ===== MetaMask Smart Accounts =====
NEXT_PUBLIC_BUNDLER_URL=
NEXT_PUBLIC_PAYMASTER_URL=

# ===== Envio 索引器 =====
NEXT_PUBLIC_ENVIO_ENDPOINT=http://localhost:8080/v1/graphql

# ===== IPFS 配置 =====
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_IPFS_API_URL=https://api.pinata.cloud
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret

# ===== Next.js 配置 =====
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-key

# ===== 监控配置 =====
MONAD_ETHERSCAN_API_KEY=your_api_key
```

### 3. 安全配置检查

```bash
# 检查私钥格式（应该是64位十六进制）
echo $PRIVATE_KEY | wc -c  # 应该输出 65 (包含换行符)

# 验证钱包地址
npm run verify-wallet
```

## 📦 智能合约部署

### 1. 编译合约

```bash
# 清理之前的编译
rm -rf artifacts/ cache/

# 编译智能合约
npm run compile

# 验证编译成功
ls artifacts/contracts/MessageBottleSimple.sol/
```

### 2. 部署到测试网

```bash
# 部署到 Monad 测试网
npm run deploy:monad

# 查看部署结果
cat deployments/monad-deployment.json
```

部署成功后，您将看到类似输出：
```json
{
  "contractAddress": "0x742d35Cc6634C0532925a3b8D4D9FFFFFFFF",
  "network": "monad",
  "chainId": 10143,
  "deployer": "0x...",
  "blockNumber": 12345,
  "timestamp": "2024-09-27T..."
}
```

### 3. 验证合约

```bash
# 在区块浏览器上验证合约
npx hardhat verify --network monad CONTRACT_ADDRESS

# 测试合约功能
npm run test:deployed
```

### 4. 更新环境变量

```bash
# 更新 .env 文件中的合约地址
sed -i 's/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS/' .env
```

## 🌐 前端应用部署

### 1. 构建验证

```bash
# 本地构建测试
npm run build

# 检查构建输出
ls .next/static/

# 本地预览
npm run start
```

### 2. Vercel 部署

#### 自动部署 (推荐)
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod

# 配置环境变量
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_CHAIN_ID
# ... 添加其他环境变量
```

#### 手动部署
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置构建设置：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 添加环境变量
6. 点击 "Deploy"

### 3. 域名配置

```bash
# 添加自定义域名
vercel domains add your-domain.com

# 配置 DNS 记录
# Type: CNAME
# Name: your-domain.com
# Value: cname.vercel-dns.com
```

## 📊 Envio 索引器部署

### 1. 配置索引器

```bash
# 更新 envio/config.yaml 中的合约地址
sed -i 's/address: .*/address: YOUR_CONTRACT_ADDRESS/' envio/config.yaml
```

### 2. 本地开发模式

```bash
# 生成代码
npm run envio:codegen

# 启动开发模式
npm run envio:dev
```

### 3. 生产部署

#### Docker 部署
```bash
# 构建 Docker 镜像
docker build -t neural-ocean-indexer ./envio

# 运行容器
docker run -d \
  --name neural-ocean-indexer \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://... \
  neural-ocean-indexer
```

#### VPS 部署
```bash
# 在服务器上
git clone your-repo
cd message-bottle-dapp/envio

# 安装依赖
npm install

# 启动生产模式
npm run envio:start
```

### 4. 健康检查

```bash
# 检查索引器状态
curl http://localhost:8080/health

# 测试 GraphQL 端点
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ bottles { id message } }"}'
```

## 🔍 部署验证

### 1. 前端验证

访问部署的前端应用，检查：
- ✅ 页面正常加载
- ✅ MetaMask 连接功能
- ✅ 网络自动切换
- ✅ 合约交互功能
- ✅ 索引器数据查询

### 2. 智能合约验证

```bash
# 测试合约调用
npx hardhat console --network monad

# 在控制台中测试
> const contract = await ethers.getContractAt("MessageBottleSimple", "CONTRACT_ADDRESS")
> await contract.getTotalBottles()
> await contract.getAvailableBottleIds()
```

### 3. 端到端测试

```bash
# 运行集成测试
npm run test:e2e

# 测试用户流程
npm run test:user-flow
```

## 📊 监控和维护

### 1. 应用监控

```bash
# 配置 Vercel Analytics
vercel analytics enable

# 设置错误监控
npm install @sentry/nextjs
```

### 2. 合约监控

```bash
# 监控合约事件
npm run monitor:events

# 检查合约状态
npm run check:contract-health
```

### 3. 索引器监控

```bash
# 检查索引器同步状态
curl http://your-indexer.com/metrics

# 监控数据库性能
psql $DATABASE_URL -c "SELECT * FROM envio_sync_status;"
```

## 🚨 故障排除

### 常见问题

#### 1. 合约部署失败
```bash
# 检查账户余额
npx hardhat console --network monad
> ethers.provider.getBalance("YOUR_ADDRESS")

# 检查网络连接
curl https://testnet-rpc.monad.xyz/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### 2. 前端连接问题
- 检查环境变量配置
- 验证合约地址格式
- 确认网络配置正确

#### 3. 索引器同步问题
```bash
# 重置索引器状态
envio stop
envio codegen
envio start --reset
```

### 日志分析

```bash
# 查看部署日志
vercel logs your-deployment-url

# 查看合约事件
npx hardhat run scripts/check-events.js --network monad

# 监控索引器日志
docker logs neural-ocean-indexer
```

## 📅 部署清单

### 部署前检查
- [ ] 环境变量配置完成
- [ ] 测试网代币充足
- [ ] 代码测试通过
- [ ] 安全审计完成

### 部署过程
- [ ] 智能合约编译成功
- [ ] 合约部署到测试网
- [ ] 合约地址更新到环境变量
- [ ] 前端构建成功
- [ ] 前端部署到 Vercel
- [ ] 索引器配置更新
- [ ] 索引器启动并同步

### 部署后验证
- [ ] 前端可正常访问
- [ ] 钱包连接功能正常
- [ ] 合约交互功能正常
- [ ] 数据查询功能正常
- [ ] 监控系统启用

## 🎯 生产环境建议

### 安全考虑
- 使用硬件钱包进行生产部署
- 实施多重签名管理
- 定期安全审计
- 环境变量加密存储

### 性能优化
- CDN 加速静态资源
- 数据库连接池优化
- 缓存策略实施
- 负载均衡配置

### 备份策略
- 智能合约代码备份
- 数据库定期备份
- 配置文件版本控制
- 灾难恢复计划

---

**部署完成后，您的 Neural Ocean DApp 就可以为用户提供完整的去中心化漂流瓶体验了！** 🚀🌊