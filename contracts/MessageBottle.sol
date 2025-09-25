// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MessageBottle is ReentrancyGuard, Ownable {

    enum BottleType {
        MESSAGE,    // 普通消息瓶
        TREASURE,   // 宝藏瓶 (包含奖励)
        WISH,       // 许愿瓶
        TIME_CAPSULE // 时间胶囊
    }

    enum Rarity {
        COMMON,     // 普通 - 90%
        RARE,       // 稀有 - 8%
        EPIC,       // 史诗 - 1.5%
        LEGENDARY   // 传说 - 0.5%
    }

    struct Bottle {
        uint256 id;
        address creator;
        BottleType bottleType;
        Rarity rarity;
        string message;
        uint256 reward;        // 宝藏瓶的奖励金额
        uint256 timestamp;
        uint256 latitude;      // 经度 * 1e6 (用于地理位置)
        uint256 longitude;     // 纬度 * 1e6
        bool isFound;
        address finder;
        uint256 foundTimestamp;
    }

    struct UserStats {
        uint256 bottlesDropped;
        uint256 bottlesFound;
        uint256 totalRewardsEarned;
        uint256 totalRewardsPaid;
        uint256 experience;
        uint256 level;
    }

    // State variables
    uint256 private _bottleIdCounter;
    mapping(uint256 => Bottle) public bottles;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userBottles; // 用户创建的瓶子
    mapping(address => uint256[]) public userFoundBottles; // 用户找到的瓶子

    // Arrays for efficient querying
    uint256[] public allBottleIds;
    uint256[] public availableBottleIds; // 未被发现的瓶子

    // Events
    event BottleDropped(
        uint256 indexed bottleId,
        address indexed creator,
        BottleType bottleType,
        Rarity rarity,
        uint256 reward,
        uint256 latitude,
        uint256 longitude
    );

    event BottleFound(
        uint256 indexed bottleId,
        address indexed finder,
        uint256 reward,
        uint256 experience
    );

    event LevelUp(
        address indexed user,
        uint256 newLevel
    );

    constructor() Ownable(msg.sender) {
        _bottleIdCounter = 1;
    }

    /**
     * @dev 投放漂流瓶
     */
    function dropBottle(
        BottleType _bottleType,
        string calldata _message,
        uint256 _latitude,
        uint256 _longitude
    ) external payable nonReentrant {
        require(bytes(_message).length > 0, "Message cannot be empty");
        require(bytes(_message).length <= 500, "Message too long");

        uint256 bottleId = _bottleIdCounter++;
        uint256 reward = 0;

        // 如果是宝藏瓶，需要包含奖励
        if (_bottleType == BottleType.TREASURE) {
            require(msg.value > 0, "Treasure bottles must include reward");
            reward = msg.value;
        }

        // 生成稀有度
        Rarity rarity = _generateRarity();

        // 创建瓶子
        bottles[bottleId] = Bottle({
            id: bottleId,
            creator: msg.sender,
            bottleType: _bottleType,
            rarity: rarity,
            message: _message,
            reward: reward,
            timestamp: block.timestamp,
            latitude: _latitude,
            longitude: _longitude,
            isFound: false,
            finder: address(0),
            foundTimestamp: 0
        });

        // 更新数组
        allBottleIds.push(bottleId);
        availableBottleIds.push(bottleId);
        userBottles[msg.sender].push(bottleId);

        // 更新用户统计
        userStats[msg.sender].bottlesDropped++;
        _addExperience(msg.sender, 10); // 投放瓶子获得10经验

        emit BottleDropped(bottleId, msg.sender, _bottleType, rarity, reward, _latitude, _longitude);
    }

    /**
     * @dev 发现漂流瓶 (随机发现)
     */
    function findBottle() external nonReentrant {
        require(availableBottleIds.length > 0, "No bottles available");

        // 随机选择一个可用的瓶子
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            availableBottleIds.length
        ))) % availableBottleIds.length;

        uint256 bottleId = availableBottleIds[randomIndex];

        _findBottle(bottleId);
    }

    /**
     * @dev 在指定区域搜索漂流瓶
     */
    function searchInArea(
        uint256 _centerLat,
        uint256 _centerLng,
        uint256 _radius
    ) external view returns (uint256[] memory) {
        uint256[] memory nearbyBottles = new uint256[](availableBottleIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < availableBottleIds.length; i++) {
            uint256 bottleId = availableBottleIds[i];
            Bottle memory bottle = bottles[bottleId];

            // 简化的距离计算 (实际应用中需要更精确的地理距离计算)
            uint256 latDiff = bottle.latitude > _centerLat ?
                bottle.latitude - _centerLat : _centerLat - bottle.latitude;
            uint256 lngDiff = bottle.longitude > _centerLng ?
                bottle.longitude - _centerLng : _centerLng - bottle.longitude;

            if (latDiff <= _radius && lngDiff <= _radius) {
                nearbyBottles[count] = bottleId;
                count++;
            }
        }

        // 调整数组大小
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = nearbyBottles[i];
        }

        return result;
    }

    /**
     * @dev 发现指定的漂流瓶
     */
    function findSpecificBottle(uint256 _bottleId) external nonReentrant {
        require(_isBottleAvailable(_bottleId), "Bottle not available");
        _findBottle(_bottleId);
    }

    /**
     * @dev 内部函数：处理发现瓶子的逻辑
     */
    function _findBottle(uint256 _bottleId) internal {
        Bottle storage bottle = bottles[_bottleId];
        require(!bottle.isFound, "Bottle already found");
        require(bottle.creator != msg.sender, "Cannot find your own bottle");

        // 标记为已发现
        bottle.isFound = true;
        bottle.finder = msg.sender;
        bottle.foundTimestamp = block.timestamp;

        // 从可用列表中移除
        _removeFromAvailableBottles(_bottleId);

        // 添加到用户发现列表
        userFoundBottles[msg.sender].push(_bottleId);

        // 计算奖励和经验
        uint256 reward = bottle.reward;
        uint256 baseExperience = 50; // 基础经验

        // 根据稀有度调整经验
        uint256 experience = _calculateExperienceByRarity(baseExperience, bottle.rarity);

        // 更新统计
        userStats[msg.sender].bottlesFound++;
        userStats[msg.sender].totalRewardsEarned += reward;
        _addExperience(msg.sender, experience);

        // 发放奖励
        if (reward > 0) {
            payable(msg.sender).transfer(reward);
        }

        emit BottleFound(_bottleId, msg.sender, reward, experience);
    }

    /**
     * @dev 生成稀有度
     */
    function _generateRarity() internal view returns (Rarity) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        ))) % 1000;

        if (random < 5) return Rarity.LEGENDARY;    // 0.5%
        if (random < 20) return Rarity.EPIC;        // 1.5%
        if (random < 100) return Rarity.RARE;       // 8%
        return Rarity.COMMON;                       // 90%
    }

    /**
     * @dev 根据稀有度计算经验值
     */
    function _calculateExperienceByRarity(uint256 baseExp, Rarity rarity) internal pure returns (uint256) {
        if (rarity == Rarity.LEGENDARY) return baseExp * 4;
        if (rarity == Rarity.EPIC) return baseExp * 3;
        if (rarity == Rarity.RARE) return baseExp * 2;
        return baseExp;
    }

    /**
     * @dev 添加经验值并检查升级
     */
    function _addExperience(address user, uint256 exp) internal {
        userStats[user].experience += exp;

        uint256 newLevel = _calculateLevel(userStats[user].experience);
        if (newLevel > userStats[user].level) {
            userStats[user].level = newLevel;
            emit LevelUp(user, newLevel);
        }
    }

    /**
     * @dev 根据经验值计算等级
     */
    function _calculateLevel(uint256 experience) internal pure returns (uint256) {
        if (experience < 100) return 1;
        if (experience < 300) return 2;
        if (experience < 600) return 3;
        if (experience < 1000) return 4;
        if (experience < 1500) return 5;
        return 5 + (experience - 1500) / 500; // 每500经验一级
    }

    /**
     * @dev 检查瓶子是否可用
     */
    function _isBottleAvailable(uint256 _bottleId) internal view returns (bool) {
        for (uint256 i = 0; i < availableBottleIds.length; i++) {
            if (availableBottleIds[i] == _bottleId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev 从可用列表中移除瓶子
     */
    function _removeFromAvailableBottles(uint256 _bottleId) internal {
        for (uint256 i = 0; i < availableBottleIds.length; i++) {
            if (availableBottleIds[i] == _bottleId) {
                availableBottleIds[i] = availableBottleIds[availableBottleIds.length - 1];
                availableBottleIds.pop();
                break;
            }
        }
    }

    // View functions
    function getBottle(uint256 _bottleId) external view returns (Bottle memory) {
        return bottles[_bottleId];
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getUserBottles(address _user) external view returns (uint256[] memory) {
        return userBottles[_user];
    }

    function getUserFoundBottles(address _user) external view returns (uint256[] memory) {
        return userFoundBottles[_user];
    }

    function getAvailableBottleIds() external view returns (uint256[] memory) {
        return availableBottleIds;
    }

    function getAllBottleIds() external view returns (uint256[] memory) {
        return allBottleIds;
    }

    function getTotalBottles() external view returns (uint256) {
        return _bottleIdCounter - 1;
    }

    function getAvailableBottlesCount() external view returns (uint256) {
        return availableBottleIds.length;
    }
}