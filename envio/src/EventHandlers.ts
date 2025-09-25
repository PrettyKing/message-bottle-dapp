// envio/src/EventHandlers.ts
import {
  MessageBottle,
  Bottle,
  User,
  Find,
  Reward,
  GlobalStats,
} from "generated";

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
      bottlesDropped: 0n,
      bottlesFound: 0n,
      totalRewards: 0n,
      experience: 0n,
      level: 1n,
      createdAt: timestamp,
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
      totalBottles: 0n,
      totalUsers: 0n,
      totalRewards: 0n,
      activeBottles: 0n,
      lastUpdated: timestamp,
    };
  }
  
  stats.lastUpdated = timestamp;
  context.GlobalStats.set(stats);
  return stats;
}

// 处理漂流瓶投放事件
MessageBottle.BottleDropped.handler(async ({ event, context }) => {
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
  user.bottlesDropped += 1n;
  user.experience += 100n; // 投放经验
  user.level = user.experience / 1000n + 1n; // 每1000经验升级
  context.User.set(user);

  // 创建漂流瓶记录
  const bottle: Bottle = {
    id: bottleId.toString(),
    bottleId: bottleId,
    creator: creator,
    finder: null,
    bottleType: BOTTLE_TYPES[Number(bottleType)] || "MESSAGE",
    rarity: "COMMON", // 默认稀有度，需要从合约读取
    contentHash: "", // 需要从合约读取
    reward: 0n, // 需要从合约读取
    latitude: latitude,
    longitude: longitude,
    dropTime: timestamp,
    openTime: 0n, // 需要从合约读取
    isOpened: false,
    isActive: true,
    blockNumber: blockNumber,
    transactionHash: transactionHash,
  };

  context.Bottle.set(bottle);

  // 更新全局统计
  const globalStats = await getOrCreateGlobalStats(context, timestamp);
  globalStats.totalBottles += 1n;
  globalStats.activeBottles += 1n;
  
  // 检查是否为新用户
  if (user.bottlesDropped === 1n) {
    globalStats.totalUsers += 1n;
  }
  
  context.GlobalStats.set(globalStats);

  console.log(`Bottle ${bottleId} dropped by ${creator} at (${latitude}, ${longitude})`);
});

// 处理漂流瓶发现事件
MessageBottle.BottleFound.handler(async ({ event, context }) => {
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
  finderUser.bottlesFound += 1n;
  finderUser.experience += 200n; // 发现经验
  finderUser.level = finderUser.experience / 1000n + 1n;
  context.User.set(finderUser);

  // 创建发现记录
  const find: Find = {
    id: `${bottleId.toString()}-${finder}`,
    bottle: bottleId.toString(),
    finder: finder,
    findTime: timestamp,
    blockNumber: blockNumber,
    transactionHash: transactionHash,
  };

  context.Find.set(find);

  // 更新全局统计
  const globalStats = await getOrCreateGlobalStats(context, timestamp);
  globalStats.activeBottles -= 1n;
  context.GlobalStats.set(globalStats);

  console.log(`Bottle ${bottleId} found by ${finder}, reward: ${reward}`);
});

// 处理漂流瓶开启事件
MessageBottle.BottleOpened.handler(async ({ event, context }) => {
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
  user.experience += 50n; // 开启经验
  user.level = user.experience / 1000n + 1n;
  context.User.set(user);

  console.log(`Bottle ${bottleId} opened by ${opener}`);
});

// 处理奖励领取事件
MessageBottle.RewardClaimed.handler(async ({ event, context }) => {
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
});

// 导出处理器
export {
  MessageBottle,
};