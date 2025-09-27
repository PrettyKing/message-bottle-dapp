const { ethers } = require("hardhat");

async function main() {
  console.log("🌊 部署 Message Bottle 智能合约到 Monad 测试网...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 部署合约
  const MessageBottle = await ethers.getContractFactory("MessageBottleSimple");
  const messageBottle = await MessageBottle.deploy();

  await messageBottle.waitForDeployment();
  const contractAddress = await messageBottle.getAddress();

  console.log("\n🎉 合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("网络:", network.name);
  console.log("区块确认:", await messageBottle.deploymentTransaction()?.confirmations() || 1);

  // 保存部署信息
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  const path = require('path');

  // 创建 deployments 目录
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // 保存部署信息到文件
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("✅ 部署信息已保存到:", deploymentFile);

  // 验证合约功能
  console.log("\n🧪 验证合约基本功能...");

  try {
    const totalBottles = await messageBottle.getTotalBottles();
    console.log("初始瓶子总数:", totalBottles.toString());

    const availableBottles = await messageBottle.getAvailableBottleIds();
    console.log("可用瓶子数量:", availableBottles.length.toString());

    console.log("✅ 合约功能验证成功!");
  } catch (error) {
    console.error("❌ 合约验证失败:", error.message);
  }

  console.log("\n📋 下一步:");
  console.log("1. 更新前端配置中的合约地址");
  console.log("2. 启动 Envio 索引器");
  console.log("3. 测试前端应用");
  console.log("\n🚀 准备就绪，开始使用你的漂流瓶 DApp!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });