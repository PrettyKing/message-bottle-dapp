// src/wallet/smartAccount.ts - 更新网络配置
import { DelegationFramework } from '@metamask/delegation-framework';
import { ethers } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';

// 更新的Monad测试网配置
const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex (修正)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://rpc-testnet.monad.xyz',
        'https://monad-testnet-rpc.publicnode.com'
      ],
    },
    public: {
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://rpc-testnet.monad.xyz'
      ],
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
  private delegationFramework: DelegationFramework | null = null;
  private provider: ethers.providers.JsonRpcProvider;
  private walletClient: any;
  private publicClient: any;
  
  constructor() {
    // 使用备用RPC端点
    this.provider = this.createProvider();
    
    // 初始化viem客户端
    this.walletClient = createWalletClient({
      chain: MONAD_TESTNET_CONFIG,
      transport: http(MONAD_TESTNET_CONFIG.rpcUrls.default.http[0]),
    });
    
    this.publicClient = createPublicClient({
      chain: MONAD_TESTNET_CONFIG,
      transport: http(MONAD_TESTNET_CONFIG.rpcUrls.default.http[0]),
    });
  }

  // 创建提供者，支持多个RPC端点
  private createProvider(): ethers.providers.JsonRpcProvider {
    const rpcUrls = MONAD_TESTNET_CONFIG.rpcUrls.default.http;
    
    // 尝试连接第一个RPC端点
    for (const rpcUrl of rpcUrls) {
      try {
        return new ethers.providers.JsonRpcProvider(rpcUrl);
      } catch (error) {
        console.warn(`Failed to connect to ${rpcUrl}:`, error);
        continue;
      }
    }
    
    // 如果所有端点都失败，使用第一个作为默认值
    return new ethers.providers.JsonRpcProvider(rpcUrls[0]);
  }

  // 连接MetaMask钱包
  async connect() {
    try {
      // 连接EOA钱包（MetaMask）
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 先检查网络连接
      await this.checkNetworkConnection();
      
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

      // 设置提供者
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();

      // 暂时使用EOA地址作为智能账户地址（演示模式）
      const smartAccountAddress = eoaAddress;
      const isDeployed = true;

      return {
        eoaAddress: accounts[0],
        smartAccountAddress: accounts[0], // 简化版本，直接使用EOA
        isDeployed: true,
      };
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }

  // 检查网络连接
  private async checkNetworkConnection(): Promise<void> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`Connected to Monad testnet, block number: ${blockNumber}`);
    } catch (error) {
      console.warn('Network connection check failed:', error);
      throw new Error('无法连接到Monad测试网，请检查网络状态');
    }
  }

  // 添加Monad网络到MetaMask（使用多个RPC尝试）
  private async addMonadNetwork(): Promise<void> {
    const rpcUrls = MONAD_TESTNET_CONFIG.rpcUrls.default.http;
    
    for (const rpcUrl of rpcUrls) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${MONAD_TESTNET_CONFIG.id.toString(16)}`,
              chainName: MONAD_TESTNET_CONFIG.name,
              nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorers.default.url],
            },
          ],
        });
        console.log(`Successfully added Monad network with RPC: ${rpcUrl}`);
        return;
      } catch (error) {
        console.warn(`Failed to add network with RPC ${rpcUrl}:`, error);
        continue;
      }
    }
    
    throw new Error('无法添加Monad测试网到MetaMask');
  }

  // 检查智能账户是否已部署
  private async isAccountDeployed(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.warn('Failed to check account deployment:', error);
      return false;
    }
  }

  // 获取账户余额
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0.0';
    }
  }

  // 模拟投放漂流瓶（演示模式）
  async dropBottleDemo(
    bottleType: number,
    contentHash: string,
    latitude: number,
    longitude: number,
    openTime: number = 0,
    reward: string = "0"
  ): Promise<string> {
    try {
      // 模拟交易哈希
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Demo: Bottle dropped successfully', {
        type: bottleType,
        content: contentHash,
        location: [latitude, longitude],
        reward
      });
      
      return mockTxHash;
    } catch (error) {
      console.error('Demo bottle drop failed:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const smartAccountManager = new SmartAccountManager();

// 导出工具函数
export const connectWallet = () => smartAccountManager.connect();
export const disconnectWallet = () => smartAccountManager.disconnect();
export const getBalance = (address?: string) => smartAccountManager.getBalance(address);
export const sendTransaction = (tx: ethers.TransactionRequest) => smartAccountManager.sendTransaction(tx);