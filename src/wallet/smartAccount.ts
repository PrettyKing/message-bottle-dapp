// src/wallet/smartAccount.ts
import { DelegationFramework } from '@metamask/delegation-framework';
import { ethers } from 'ethers';
import { createWalletClient, createPublicClient, http } from 'viem';

// Monad测试网配置
const MONAD_TESTNET_CONFIG = {
  id: 41279,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
};

// 智能账户管理类
export class SmartAccountManager {
  private delegationFramework: DelegationFramework;
  private provider: ethers.providers.JsonRpcProvider;
  private walletClient: any;
  private publicClient: any;
  
  constructor() {
    // 初始化提供者
    this.provider = new ethers.providers.JsonRpcProvider(
      MONAD_TESTNET_CONFIG.rpcUrls.default.http[0]
    );
    
    // 初始化viem客户端
    this.walletClient = createWalletClient({
      chain: MONAD_TESTNET_CONFIG,
      transport: http(),
    });
    
    this.publicClient = createPublicClient({
      chain: MONAD_TESTNET_CONFIG,
      transport: http(),
    });
    
    // 初始化委托框架
    this.delegationFramework = new DelegationFramework({
      chain: MONAD_TESTNET_CONFIG,
      bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL,
      paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL,
    });
  }

  // 连接钱包并创建智能账户
  async connectWallet(): Promise<{
    smartAccountAddress: string;
    eoaAddress: string;
    isDeployed: boolean;
  }> {
    try {
      // 连接EOA钱包（MetaMask）
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 切换到Monad测试网
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${MONAD_TESTNET_CONFIG.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
          await this.addMonadNetwork();
        } else {
          throw switchError;
        }
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      const eoaAddress = accounts[0];

      // 创建智能账户
      const smartAccount = await this.delegationFramework.createSmartAccount({
        owner: eoaAddress,
        index: 0, // 可以创建多个智能账户
      });

      const smartAccountAddress = await smartAccount.getAddress();
      const isDeployed = await this.isAccountDeployed(smartAccountAddress);

      return {
        smartAccountAddress,
        eoaAddress,
        isDeployed,
      };
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }

  // 添加Monad网络到MetaMask
  private async addMonadNetwork(): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${MONAD_TESTNET_CONFIG.id.toString(16)}`,
          chainName: MONAD_TESTNET_CONFIG.name,
          nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
          rpcUrls: MONAD_TESTNET_CONFIG.rpcUrls.default.http,
          blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorers.default.url],
        },
      ],
    });
  }

  // 检查智能账户是否已部署
  private async isAccountDeployed(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address);
    return code !== '0x';
  }

  // 无Gas费交易：投放漂流瓶
  async dropBottleGasless(
    contractAddress: string,
    bottleType: number,
    contentHash: string,
    latitude: number,
    longitude: number,
    openTime: number = 0,
    reward: string = "0"
  ): Promise<string> {
    try {
      const smartAccount = await this.delegationFramework.getSmartAccount();
      
      // 构建交易数据
      const messageBottleInterface = new ethers.utils.Interface([
        "function dropBottle(uint8 _type, string memory _contentHash, int256 _latitude, int256 _longitude, uint256 _openTime) external payable"
      ]);
      
      const data = messageBottleInterface.encodeFunctionData("dropBottle", [
        bottleType,
        contentHash,
        Math.floor(latitude * 1e6),
        Math.floor(longitude * 1e6),
        openTime
      ]);

      // 使用Paymaster支付Gas费
      const userOperation = await smartAccount.buildUserOperation({
        target: contractAddress,
        data: data,
        value: ethers.utils.parseEther(reward).add(ethers.utils.parseEther("0.001")), // 奖励 + 手续费
      });

      // 发送用户操作
      const userOpHash = await smartAccount.sendUserOperation(userOperation);
      
      // 等待交易确认
      const receipt = await smartAccount.waitForUserOperationReceipt(userOpHash);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('无Gas费投放失败:', error);
      throw error;
    }
  }

  // 批量投放漂流瓶
  async batchDropBottles(
    contractAddress: string,
    bottles: Array<{
      type: number;
      contentHash: string;
      latitude: number;
      longitude: number;
      openTime?: number;
      reward?: string;
    }>
  ): Promise<string> {
    try {
      const smartAccount = await this.delegationFramework.getSmartAccount();
      
      // 构建批量交易
      const calls = bottles.map(bottle => {
        const messageBottleInterface = new ethers.utils.Interface([
          "function dropBottle(uint8 _type, string memory _contentHash, int256 _latitude, int256 _longitude, uint256 _openTime) external payable"
        ]);
        
        return {
          target: contractAddress,
          data: messageBottleInterface.encodeFunctionData("dropBottle", [
            bottle.type,
            bottle.contentHash,
            Math.floor(bottle.latitude * 1e6),
            Math.floor(bottle.longitude * 1e6),
            bottle.openTime || 0
          ]),
          value: ethers.utils.parseEther(bottle.reward || "0").add(ethers.utils.parseEther("0.001"))
        };
      });

      // 构建批量用户操作
      const userOperation = await smartAccount.buildBatchUserOperation(calls);
      
      // 发送批量操作
      const userOpHash = await smartAccount.sendUserOperation(userOperation);
      const receipt = await smartAccount.waitForUserOperationReceipt(userOpHash);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('批量投放失败:', error);
      throw error;
    }
  }

  // 获取账户余额
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
}

// 导出单例实例
export const smartAccountManager = new SmartAccountManager();