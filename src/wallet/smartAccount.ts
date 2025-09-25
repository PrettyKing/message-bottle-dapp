// src/wallet/smartAccount.ts - Monad 测试网钱包集成
import { ethers } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';

// Monad 测试网配置 (修正版)
const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex (修正)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: [
    'https://testnet-rpc.monad.xyz/',           // 官方 RPC
    'https://rpc.ankr.com/monad_testnet',       // Ankr 备用 RPC
    'https://monad-testnet-rpc.publicnode.com/' // PublicNode 备用 RPC
  ],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

// 智能账户管理类
export class SmartAccountManager {
  private sdk: MetaMaskSDK;
  private provider: ethers.BrowserProvider | null;
  private signer: ethers.JsonRpcSigner | null;

  constructor() {
    this.provider = null;
    this.signer = null;
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'Message Bottle DApp',
        url: typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
      },
      preferDesktop: false,
    });
  }

  // 连接 MetaMask 钱包
  async connect() {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      // 获取以太坊提供者
      const ethereum = this.sdk.getProvider();
      if (!ethereum) {
        throw new Error('MetaMask not installed');
      }

      console.log('🔗 Connecting to MetaMask...');

      // 请求连接账户
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts connected');
      }

      console.log('✅ Account connected:', accounts[0]);

      // 设置提供者
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();

      // 检查并切换到 Monad 测试网
      await this.switchToMonadTestnet();

      // 验证网络连接
      const isCorrectNetwork = await this.verifyNetwork();
      if (!isCorrectNetwork) {
        console.warn('⚠️  Warning: Not connected to Monad Testnet');
      }

      return {
        eoaAddress: accounts[0],
        smartAccountAddress: accounts[0], // 简化版本，直接使用EOA
        isDeployed: true,
      };
    } catch (error) {
      console.error('❌ 连接钱包失败:', error);
      throw error;
    }
  }

  // 切换到 Monad 测试网
  private async switchToMonadTestnet() {
    try {
      const ethereum = this.sdk.getProvider();
      if (!ethereum) {
        throw new Error('MetaMask provider not available');
      }

      console.log('🔄 Attempting to switch to Monad Testnet (Chain ID: 10143)');

      // 尝试切换到 Monad 测试网
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
        });
        console.log('✅ Successfully switched to Monad Testnet');
      } catch (switchError: unknown) {
        const error = switchError as { code?: number; message?: string };
        console.log('⚠️  Switch failed, attempting to add network:', error.message);

        // 处理不同的错误码
        if (error.code === 4902 || error.code === -32002) {
          console.log('➕ Network not found, adding Monad Testnet to MetaMask...');

          // 验证 Chain ID 格式
          const chainIdDecimal = parseInt(MONAD_TESTNET_CONFIG.chainId, 16);
          console.log(`🔍 Chain ID validation: ${MONAD_TESTNET_CONFIG.chainId} (hex) = ${chainIdDecimal} (decimal)`);

          if (chainIdDecimal !== 10143) {
            throw new Error(`Chain ID configuration error: expected 10143 (0x279f), got ${chainIdDecimal} (${MONAD_TESTNET_CONFIG.chainId})`);
          }

          // 尝试用不同的 RPC 添加网络
          await this.addNetworkWithFallback();

          console.log('✅ Successfully added Monad Testnet');

          // 等待一下再尝试切换
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 添加网络后再次尝试切换
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
          });

          console.log('✅ Successfully switched to newly added Monad Testnet');
        } else if (error.code === 4001) {
          throw new Error('User rejected network switch request');
        } else {
          console.error('Unexpected error during network switch:', error);
          throw new Error(`Network switch failed: ${error.message || 'Unknown error'} (Code: ${error.code})`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to switch to Monad testnet:', error);
      throw error;
    }
  }

  // 添加网络，支持 RPC 回退
  private async addNetworkWithFallback() {
    const ethereum = this.sdk.getProvider();
    if (!ethereum) throw new Error('Ethereum provider not available');

    for (let i = 0; i < MONAD_TESTNET_CONFIG.rpcUrls.length; i++) {
      const rpcUrl = MONAD_TESTNET_CONFIG.rpcUrls[i];
      console.log(`🔗 Trying RPC ${i + 1}/${MONAD_TESTNET_CONFIG.rpcUrls.length}: ${rpcUrl}`);

      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: MONAD_TESTNET_CONFIG.chainId,
            chainName: MONAD_TESTNET_CONFIG.chainName,
            nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
            rpcUrls: [rpcUrl],
            blockExplorerUrls: MONAD_TESTNET_CONFIG.blockExplorerUrls,
          }],
        });

        console.log(`✅ Successfully added network with RPC: ${rpcUrl}`);
        return;
      } catch (error) {
        console.warn(`⚠️  Failed to add network with RPC ${rpcUrl}:`, error);
        if (i === MONAD_TESTNET_CONFIG.rpcUrls.length - 1) {
          throw new Error('All RPC endpoints failed when adding network');
        }
      }
    }
  }

  // 验证当前网络
  private async verifyNetwork(): Promise<boolean> {
    try {
      if (!this.provider) {
        console.warn('Provider not available for network verification');
        return false;
      }

      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const expectedChainId = 10143;
      const isCorrectNetwork = currentChainId === expectedChainId;

      console.log('🔍 Network Verification:');
      console.log(`   Current Chain ID: ${currentChainId}`);
      console.log(`   Expected Chain ID: ${expectedChainId}`);
      console.log(`   Network Name: ${network.name || 'unknown'}`);
      console.log(`   Match Status: ${isCorrectNetwork ? '✅ CORRECT' : '❌ MISMATCH'}`);

      if (!isCorrectNetwork) {
        console.warn(`⚠️  Chain ID mismatch detected!`);
        console.warn(`   Expected: 10143 (Monad Testnet)`);
        console.warn(`   Actual: ${currentChainId}`);
      }

      return isCorrectNetwork;
    } catch (error) {
      console.error('❌ Network verification failed:', error);
      return false;
    }
  }

  // 获取智能账户地址
  getSmartAccountAddress(): string | null {
    return this.signer?.address || null;
  }

  // 检查智能账户是否已部署
  async isSmartAccountDeployed(): Promise<boolean> {
    // 简化版本，假设账户已部署
    return true;
  }

  // 发送交易
  async sendTransaction(tx: ethers.TransactionRequest) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = await this.signer.sendTransaction(tx);
      return transaction;
    } catch (error) {
      console.error('发送交易失败:', error);
      throw error;
    }
  }

  // 获取余额
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    const targetAddress = address || await this.signer?.getAddress();
    if (!targetAddress) {
      throw new Error('No address available');
    }

    const balance = await this.provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  // 估算 Gas 费
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    return await this.provider.estimateGas(tx);
  }

  // 获取网络信息
  async getNetwork() {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    return await this.provider.getNetwork();
  }

  // 断开连接
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.sdk.terminate();
  }

  // 监听账户变化
  onAccountsChanged(callback: (accounts: string[]) => void) {
    const ethereum = this.sdk.getProvider();
    if (ethereum) {
      ethereum.on('accountsChanged', callback);
    }
  }

  // 监听网络变化
  onChainChanged(callback: (chainId: string) => void) {
    const ethereum = this.sdk.getProvider();
    if (ethereum) {
      ethereum.on('chainChanged', callback);
    }
  }

  // 移除事件监听器
  removeAllListeners() {
    const ethereum = this.sdk.getProvider();
    if (ethereum) {
      ethereum.removeAllListeners('accountsChanged');
      ethereum.removeAllListeners('chainChanged');
    }
  }

  // 获取合约实例
  getContract(address: string, abi: ethers.InterfaceAbi) {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    return new ethers.Contract(address, abi, this.signer);
  }

  // 演示模式：模拟投放漂流瓶
  async dropBottleDemo(
    bottleType: number,
    contentHash: string,
    latitude: number,
    longitude: number,
    openTime: number = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
    reward: string = "0"
  ): Promise<string> {
    try {
      // 模拟交易哈希
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('🎯 Demo: Bottle dropped successfully', {
        type: bottleType,
        content: contentHash,
        location: [latitude, longitude],
        reward
      });

      return mockTxHash;
    } catch (error) {
      console.error('❌ Demo bottle drop failed:', error);
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