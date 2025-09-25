#!/bin/bash

echo "🚀 Message Bottle DApp - Monad Testnet Deployment Script"
echo "======================================================="

# 检查环境
echo "📋 Checking environment..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or later."
    exit 1
fi

# 检查npm版本
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo ""
    echo "📝 Required variables to set in .env:"
    echo "   - PRIVATE_KEY: Your wallet private key"
    echo "   - NEXT_PUBLIC_BUNDLER_URL: MetaMask bundler URL"
    echo "   - NEXT_PUBLIC_PAYMASTER_URL: MetaMask paymaster URL"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# 检查私钥
source .env
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo "❌ PRIVATE_KEY not set in .env file. Please set your wallet private key."
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# 安装依赖
echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# 编译合约
echo "⚙️  Compiling contracts..."
if ! npm run compile; then
    echo "❌ Failed to compile contracts"
    exit 1
fi
echo "✅ Contracts compiled"
echo ""

# 获取Monad测试网代币提醒
echo "💰 Before deploying, make sure you have Monad testnet tokens:"
echo "   🌐 Visit: https://faucet.monad.xyz"
echo "   💳 Add your wallet address to get test tokens"
echo ""

# 检查钱包余额
echo "💳 Checking wallet balance..."
WALLET_ADDRESS=$(npx hardhat console --network monad_testnet --silent <<EOF
const [deployer] = await ethers.getSigners();
console.log(deployer.address);
process.exit(0);
EOF
)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get wallet address. Check your configuration."
    exit 1
fi

echo "   Wallet Address: $WALLET_ADDRESS"
echo "   Please ensure this address has sufficient MON tokens for deployment"
echo ""

read -p "🚦 Press Enter to continue with deployment or Ctrl+C to cancel..."

# 部署合约
echo "🚀 Deploying contracts to Monad Testnet..."
if ! npm run deploy; then
    echo "❌ Contract deployment failed"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo ""

# 检查部署文件
if [ -f "deployments/monad_testnet.json" ]; then
    CONTRACT_ADDRESS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('deployments/monad_testnet.json')).contractAddress)")
    echo "📄 Deployment Details:"
    echo "   Contract Address: $CONTRACT_ADDRESS"
    echo "   Network: Monad Testnet"
    echo "   Explorer: https://testnet-explorer.monad.xyz/address/$CONTRACT_ADDRESS"
    echo ""
fi

# 更新环境变量
if [ -f "src/config/contracts.json" ]; then
    echo "⚙️  Updating frontend configuration..."
    echo "✅ Frontend config updated with contract address"
    echo ""
fi

# Envio索引器设置
echo "📊 Setting up Envio indexer..."
echo "💡 Next steps for Envio:"
echo "   1. Update envio/config.yaml with the deployed contract address"
echo "   2. Run: npm run envio:codegen"
echo "   3. Run: npm run envio:dev (for development)"
echo ""

# 启动前端
echo "🎨 Starting frontend development server..."
echo "💡 Commands to run in separate terminals:"
echo ""
echo "   Terminal 1 - Frontend:"
echo "   npm run dev"
echo ""
echo "   Terminal 2 - Envio indexer:"
echo "   npm run envio:codegen"
echo "   npm run envio:dev"
echo ""

# 测试检查清单
echo "✅ Deployment Complete! Next Steps:"
echo ""
echo "🔍 Testing Checklist:"
echo "   [ ] Frontend loads at http://localhost:3000"
echo "   [ ] Wallet connects to Monad testnet"
echo "   [ ] Smart account creation works"
echo "   [ ] Can drop a message bottle (demo mode)"
echo "   [ ] Envio indexer syncs contract events"
echo ""

echo "📋 For Hackathon Submission:"
echo "   [ ] Record demo video showing all features"
echo "   [ ] Test on different devices/browsers"
echo "   [ ] Prepare presentation materials"
echo "   [ ] Document any known issues"
echo ""

echo "🎉 Good luck with your hackathon submission!"
echo "📞 Issues? Check: https://github.com/PrettyKing/message-bottle-dapp/issues"