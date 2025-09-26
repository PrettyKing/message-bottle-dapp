// envio/src/EventHandlers.ts
// 临时类型定义，等待 Envio 生成完整的类型文件
interface MessageBottle {
  id: string;
  sender: string;
  bottleType: string;
  message: string;
  reward: bigint;
  location: string;
  timestamp: bigint;
  found: boolean;
  finder?: string;
}

interface Bottle {
  id: string;
  sender: string;
  bottleType: string;
  message: string;
  reward: bigint;
  location: string;
  timestamp: bigint;
  found: boolean;
  finder?: string | null;
  [key: string]: any; // 允许其他属性
}

interface User {
  id: string;
  address: string;
  bottlesDropped: bigint;
  bottlesFound: bigint;
  totalRewards: bigint;
  experience: bigint;
  level: bigint;
  lastActivity: bigint;
}

interface Find {
  id: string;
  finder: string;
  bottle: string;
  timestamp: bigint;
  reward: bigint;
  [key: string]: any; // 允许其他属性
}

interface Reward {
  id: string;
  user: string;
  amount: bigint;
  source: string;
  timestamp: bigint;
  [key: string]: any; // 允许其他属性
}

interface GlobalStats {
  id: string;
  totalBottles: bigint;
  totalFound: bigint;
  totalRewards: bigint;
  activeUsers: bigint;
  lastUpdate: bigint;
  [key: string]: any; // 允许其他属性
}

// 漂流瓶类型映射
const BOTTLE_TYPES = ["MESSAGE", "TREASURE", "WISH", "TIME_CAPSULE"];
const RARITY_TYPES = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

// 获取或创建用户
async function getOrCreateUser(
  context: any,
  address: string,
  timestamp: bigint
): Promise<User> {
  let user = await context.User.get(address);
  
  if (!user) {
    user = {
      id: address,
      address: address,
      bottlesDropped: BigInt(0),
      bottlesFound: BigInt(0),
      totalRewards: BigInt(0),
      experience: BigInt(0),
      level: BigInt(1),
      lastActivity: timestamp,
    };
    context.User.set(user);
  } else {
    // 更新最后活动时间
    user.lastActivity = timestamp;
    context.User.set(user);
  }
  
  return user;
}

// 获取或创建全局统计
async function getOrCreateGlobalStats(
  context: any,
  timestamp: bigint
): Promise<GlobalStats> {
  let stats = await context.GlobalStats.get("global");
  
  if (!stats) {
    stats = {
      id: "global",
      totalBottles: BigInt(0),
      totalUsers: BigInt(0),
      totalRewards: BigInt(0),
      activeUsers: BigInt(0),
      lastUpdated: timestamp,
    };
  }
  
  stats.lastUpdated = timestamp;
  context.GlobalStats.set(stats);
  return stats;
}

// 导出事件处理函数供 Envio 使用
const BottleDroppedHandler = async ({ event, context }: any) => {
  const {
    bottleId,
    creator,
    bottleType,
    latitude,
    longitude,
  } = event.params;

  const timestamp = BigInt(event.block.timestamp);
  const blockNumber = BigInt(event.block.number);
  const transactionHash = event.transaction.hash;

  // 获取或创建用户
  const user = await getOrCreateUser(context, creator, timestamp);
  
  // 更新用户统计
  user.bottlesDropped += BigInt(1);
  user.experience += BigInt(100); // 投放经验
  user.level = user.experience / BigInt(1000) + BigInt(1); // 每1000经验升级
  context.User.set(user);

  // 创建漂流瓶记录
  const bottle: Bottle = {
    id: bottleId.toString(),
    sender: creator,
    bottleType: BOTTLE_TYPES[Number(bottleType)] || "MESSAGE",
    message: "", // 需要从合约读取
    reward: BigInt(0), // 需要从合约读取
    location: `${latitude},${longitude}`,
    timestamp: timestamp,
    found: false,
    finder: null,
    // 额外属性
    bottleId: bottleId,
    creator: creator,
    rarity: "COMMON", // 默认稀有度，需要从合约读取
    contentHash: "", // 需要从合约读取
    latitude: latitude,
    longitude: longitude,
    dropTime: timestamp,
    openTime: BigInt(0), // 需要从合约读取
    isOpened: false,
    isActive: true,
    blockNumber: blockNumber,
    transactionHash: transactionHash,
  };

  context.Bottle.set(bottle);

  // 更新全局统计
  const globalStats = await getOrCreateGlobalStats(context, timestamp);
  globalStats.totalBottles += BigInt(1);
  globalStats.totalFound += BigInt(0); // 保持兼容
  
  // 检查是否为新用户
  if (user.bottlesDropped === BigInt(1)) {
    globalStats.activeUsers += BigInt(1);
  }
  
  context.GlobalStats.set(globalStats);

  console.log(`Bottle ${bottleId} dropped by ${creator} at (${latitude}, ${longitude})`);
};

// 处理漂流瓶发现事件
const BottleFoundHandler = async ({ event, context }: any) => {
  const {
    bottleId,
    finder,
    creator,
    reward,
  } = event.params;

  const timestamp = BigInt(event.block.timestamp);
  const blockNumber = BigInt(event.block.number);
  const transactionHash = event.transaction.hash;

  // 获取漂流瓶
  const bottle = await context.Bottle.get(bottleId.toString());
  if (!bottle) {
    console.error(`Bottle ${bottleId} not found`);
    return;
  }

  // 更新漂流瓶状态
  bottle.finder = finder;
  context.Bottle.set(bottle);

  // 获取或创建发现者用户
  const finderUser = await getOrCreateUser(context, finder, timestamp);
  finderUser.bottlesFound += BigInt(1);
  finderUser.experience += BigInt(200); // 发现经验
  finderUser.level = finderUser.experience / BigInt(1000) + BigInt(1);
  context.User.set(finderUser);

  // 创建发现记录
  const find: Find = {
    id: `${bottleId.toString()}-${finder}`,
    bottle: bottleId.toString(),
    finder: finder,
    timestamp: timestamp,
    reward: reward,
    findTime: timestamp,
    blockNumber: blockNumber,
    transactionHash: transactionHash,
  };

  context.Find.set(find);

  // 更新全局统计
  const globalStats = await getOrCreateGlobalStats(context, timestamp);
  globalStats.totalFound += BigInt(1);
  context.GlobalStats.set(globalStats);

  console.log(`Bottle ${bottleId} found by ${finder}, reward: ${reward}`);
};

// 处理漂流瓶开启事件
const BottleOpenedHandler = async ({ event, context }: any) => {
  const { bottleId, opener } = event.params;

  const timestamp = BigInt(event.block.timestamp);

  // 获取漂流瓶
  const bottle = await context.Bottle.get(bottleId.toString());
  if (!bottle) {
    console.error(`Bottle ${bottleId} not found`);
    return;
  }

  // 更新漂流瓶状态
  bottle.isOpened = true;
  context.Bottle.set(bottle);

  // 更新用户经验
  const user = await getOrCreateUser(context, opener, timestamp);
  user.experience += BigInt(50); // 开启经验
  user.level = user.experience / BigInt(1000) + BigInt(1);
  context.User.set(user);

  console.log(`Bottle ${bottleId} opened by ${opener}`);
};

// 处理奖励领取事件
const RewardClaimedHandler = async ({ event, context }: any) => {
  const { user, amount } = event.params;

  const timestamp = BigInt(event.block.timestamp);
  const blockNumber = BigInt(event.block.number);
  const transactionHash = event.transaction.hash;

  // 获取用户
  const userEntity = await getOrCreateUser(context, user, timestamp);
  userEntity.totalRewards += amount;
  context.User.set(userEntity);

  // 创建奖励记录
  const reward: Reward = {
    id: `${transactionHash}-${user}`,
    user: user,
    amount: amount,
    source: "claim",
    timestamp: timestamp,
    claimTime: timestamp,
    blockNumber: blockNumber,
    transactionHash: transactionHash,
  };

  context.Reward.set(reward);

  // 更新全局统计
  const globalStats = await getOrCreateGlobalStats(context, timestamp);
  globalStats.totalRewards += amount;
  context.GlobalStats.set(globalStats);

  console.log(`Reward ${amount} claimed by ${user}`);
};

// 导出所有处理器
export {
  BottleDroppedHandler,
  BottleFoundHandler,
  BottleOpenedHandler,
  RewardClaimedHandler,
};