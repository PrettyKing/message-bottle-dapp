# 🌐 Monad Testnet 网络配置文档

## ✅ 官方网络配置

### 基本信息
- **网络名称**: Monad Testnet
- **Chain ID**: 10143 (十进制) / 0x279f (十六进制)
- **原生代币符号**: MON
- **小数位数**: 18

### ⚠️ 常见 Chain ID 错误
- ❌ **错误**: 0x2797 = 10135 (经常被误用)
- ✅ **正确**: 0x279f = 10143 (Monad Testnet 官方)

### RPC 端点 (按优先级排序)
1. **官方 RPC** (推荐): `https://testnet-rpc.monad.xyz/`
   - 提供商: QuickNode
   - 限制: 25 请求/秒
   - 批处理限制: 100

2. **Ankr RPC** (备用): `https://rpc.ankr.com/monad_testnet`
   - 限制: 300 请求/10 秒
   - 批处理限制: 100
   - 注意: 不支持 debug_* 方法

### 区块浏览器
- **官方浏览器**: https://testnet.monadexplorer.com/

### 有用链接
- **测试网中心**: https://testnet.monad.xyz
- **水龙头**: https://faucet.monad.xyz
- **官方文档**: https://docs.monad.xyz

## 🔧 MetaMask 添加配置

```javascript
{
  chainId: '0x279f',              // 10143 in hex (修正!)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: [
    'https://testnet-rpc.monad.xyz/',
    'https://rpc.ankr.com/monad_testnet'
  ],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
}
```

## 🛠️ Hardhat 配置

```javascript
networks: {
  monad: {
    url: "https://testnet-rpc.monad.xyz/",
    chainId: 10143,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gasPrice: 1000000000, // 1 gwei
  }
}
```

## 🔍 常见问题解决

### Chain ID 不匹配错误
- **原因**: 配置中的 Chain ID 与实际网络不符
- **解决**: 确保使用 10143 (十进制) 或 0x2797 (十六进制)

### RPC 连接失败
- **原因**: RPC 端点不可用或网络问题
- **解决**: 尝试使用备用 RPC 或检查网络连接

### 网络添加失败
- **原因**: MetaMask 配置参数错误
- **解决**: 检查所有参数格式是否正确

## ⚡ 性能特性

- **TPS**: 10,000
- **出块时间**: ~400ms
- **最终性**: ~800ms
- **兼容性**: 100% EVM 兼容

## 🔐 安全注意事项

1. 仅用于测试目的，不要在主网使用测试网私钥
2. 测试网代币无实际价值
3. 定期从水龙头获取测试代币

---

**最后更新**: 2025-09-25
**验证状态**: ✅ 已验证官方配置