// src/graphql/queries.ts
import { gql } from '@apollo/client';

// 获取用户统计信息
export const GET_USER_STATS = gql`
  query GetUserStats($address: String!) {
    user(id: $address) {
      id
      address
      bottlesDropped
      bottlesFound
      totalRewards
      experience
      level
      createdAt
      lastActivity
    }
  }
`;

// 获取用户投放的漂流瓶
export const GET_USER_BOTTLES = gql`
  query GetUserBottles($creator: String!, $first: Int = 20, $skip: Int = 0) {
    bottles(
      where: { creator: $creator }
      first: $first
      skip: $skip
      orderBy: dropTime
      orderDirection: desc
    ) {
      id
      bottleId
      creator
      finder
      bottleType
      rarity
      contentHash
      reward
      latitude
      longitude
      dropTime
      openTime
      isOpened
      isActive
      transactionHash
    }
  }
`;

// 获取用户发现的漂流瓶
export const GET_USER_FINDS = gql`
  query GetUserFinds($finder: String!, $first: Int = 20, $skip: Int = 0) {
    finds(
      where: { finder: $finder }
      first: $first
      skip: $skip
      orderBy: findTime
      orderDirection: desc
    ) {
      id
      findTime
      transactionHash
      bottle {
        id
        bottleId
        creator
        bottleType
        rarity
        contentHash
        reward
        latitude
        longitude
        dropTime
        isOpened
      }
    }
  }
`;

// 获取指定区域的活跃漂流瓶
export const GET_BOTTLES_IN_AREA = gql`
  query GetBottlesInArea(
    $minLat: BigInt!
    $maxLat: BigInt!
    $minLng: BigInt!
    $maxLng: BigInt!
    $first: Int = 50
  ) {
    bottles(
      where: {
        isActive: true
        finder: null
        latitude_gte: $minLat
        latitude_lte: $maxLat
        longitude_gte: $minLng
        longitude_lte: $maxLng
      }
      first: $first
      orderBy: dropTime
      orderDirection: desc
    ) {
      id
      bottleId
      creator
      bottleType
      rarity
      latitude
      longitude
      dropTime
      openTime
      reward
      transactionHash
    }
  }
`;

// 获取最近投放的漂流瓶
export const GET_RECENT_BOTTLES = gql`
  query GetRecentBottles($first: Int = 10) {
    bottles(
      where: { isActive: true }
      first: $first
      orderBy: dropTime
      orderDirection: desc
    ) {
      id
      bottleId
      creator
      bottleType
      rarity
      latitude
      longitude
      dropTime
      reward
    }
  }
`;

// 获取全局统计
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(id: "global") {
      id
      totalBottles
      totalUsers
      totalRewards
      activeBottles
      lastUpdated
    }
  }
`;

// Apollo Client配置
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_ENVIO_ENDPOINT || 'http://localhost:8080/v1/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Bottle: {
        fields: {
          latitude: {
            read(existing) {
              return existing ? Number(existing) / 1e6 : 0;
            }
          },
          longitude: {
            read(existing) {
              return existing ? Number(existing) / 1e6 : 0;
            }
          },
          reward: {
            read(existing) {
              return existing ? Number(existing) / 1e18 : 0;
            }
          }
        }
      },
      User: {
        fields: {
          totalRewards: {
            read(existing) {
              return existing ? Number(existing) / 1e18 : 0;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL Hook工具函数
export const useBottleQueries = () => {
  const getUserStats = async (address: string) => {
    const { data } = await apolloClient.query({
      query: GET_USER_STATS,
      variables: { address },
      fetchPolicy: 'cache-first',
    });
    return data.user;
  };

  const getBottlesInArea = async (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    const { data } = await apolloClient.query({
      query: GET_BOTTLES_IN_AREA,
      variables: {
        minLat: Math.floor(bounds.minLat * 1e6),
        maxLat: Math.floor(bounds.maxLat * 1e6),
        minLng: Math.floor(bounds.minLng * 1e6),
        maxLng: Math.floor(bounds.maxLng * 1e6),
      },
      fetchPolicy: 'network-only',
    });
    return data.bottles;
  };

  const searchBottles = async (filters: {
    bottleType?: string;
    rarity?: string;
    hasReward?: boolean;
    first?: number;
    skip?: number;
  }) => {
    const searchQuery = gql`
      query SearchBottles(
        $bottleType: String
        $rarity: String
        $isActive: Boolean = true
        $hasReward: Boolean
        $first: Int = 20
        $skip: Int = 0
      ) {
        bottles(
          where: {
            bottleType: $bottleType
            rarity: $rarity
            isActive: $isActive
            reward_gt: $hasReward ? "0" : null
          }
          first: $first
          skip: $skip
          orderBy: dropTime
          orderDirection: desc
        ) {
          id
          bottleId
          creator
          finder
          bottleType
          rarity
          contentHash
          reward
          latitude
          longitude
          dropTime
          openTime
          isOpened
          isActive
        }
      }
    `;

    const { data } = await apolloClient.query({
      query: searchQuery,
      variables: {
        ...filters,
        first: filters.first || 20,
        skip: filters.skip || 0,
      },
      fetchPolicy: 'cache-first',
    });
    return data.bottles;
  };

  return {
    getUserStats,
    getBottlesInArea,
    searchBottles,
  };
};