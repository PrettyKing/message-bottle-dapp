// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MessageBottleSimple {
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
        uint256 reward;
        uint256 timestamp;
        uint256 latitude;
        uint256 longitude;
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
    mapping(address => uint256[]) public userBottles;
    mapping(address => uint256[]) public userFoundBottles;

    uint256[] public allBottleIds;
    uint256[] public availableBottleIds;

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

    constructor() {
        _bottleIdCounter = 1;
    }

    function dropBottle(
        BottleType _bottleType,
        string calldata _message,
        uint256 _latitude,
        uint256 _longitude
    ) external payable {
        require(bytes(_message).length > 0, "Message cannot be empty");
        require(bytes(_message).length <= 500, "Message too long");

        uint256 bottleId = _bottleIdCounter++;
        uint256 reward = 0;

        if (_bottleType == BottleType.TREASURE) {
            require(msg.value > 0, "Treasure bottles must include reward");
            reward = msg.value;
        }

        Rarity rarity = _generateRarity();

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

        allBottleIds.push(bottleId);
        availableBottleIds.push(bottleId);
        userBottles[msg.sender].push(bottleId);

        userStats[msg.sender].bottlesDropped++;
        _addExperience(msg.sender, 10);

        emit BottleDropped(bottleId, msg.sender, _bottleType, rarity, reward, _latitude, _longitude);
    }

    function findBottle() external {
        require(availableBottleIds.length > 0, "No bottles available");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            availableBottleIds.length
        ))) % availableBottleIds.length;

        uint256 bottleId = availableBottleIds[randomIndex];
        _findBottle(bottleId);
    }

    function _findBottle(uint256 _bottleId) internal {
        Bottle storage bottle = bottles[_bottleId];
        require(!bottle.isFound, "Bottle already found");
        require(bottle.creator != msg.sender, "Cannot find your own bottle");

        bottle.isFound = true;
        bottle.finder = msg.sender;
        bottle.foundTimestamp = block.timestamp;

        _removeFromAvailableBottles(_bottleId);
        userFoundBottles[msg.sender].push(_bottleId);

        uint256 reward = bottle.reward;
        uint256 baseExperience = 50;
        uint256 experience = _calculateExperienceByRarity(baseExperience, bottle.rarity);

        userStats[msg.sender].bottlesFound++;
        userStats[msg.sender].totalRewardsEarned += reward;
        _addExperience(msg.sender, experience);

        if (reward > 0) {
            payable(msg.sender).transfer(reward);
        }

        emit BottleFound(_bottleId, msg.sender, reward, experience);
    }

    function _generateRarity() internal view returns (Rarity) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % 1000;

        if (random < 5) return Rarity.LEGENDARY;
        if (random < 20) return Rarity.EPIC;
        if (random < 100) return Rarity.RARE;
        return Rarity.COMMON;
    }

    function _calculateExperienceByRarity(uint256 baseExp, Rarity rarity) internal pure returns (uint256) {
        if (rarity == Rarity.LEGENDARY) return baseExp * 4;
        if (rarity == Rarity.EPIC) return baseExp * 3;
        if (rarity == Rarity.RARE) return baseExp * 2;
        return baseExp;
    }

    function _addExperience(address user, uint256 exp) internal {
        userStats[user].experience += exp;
        uint256 newLevel = _calculateLevel(userStats[user].experience);
        if (newLevel > userStats[user].level) {
            userStats[user].level = newLevel;
            emit LevelUp(user, newLevel);
        }
    }

    function _calculateLevel(uint256 experience) internal pure returns (uint256) {
        if (experience < 100) return 1;
        if (experience < 300) return 2;
        if (experience < 600) return 3;
        if (experience < 1000) return 4;
        if (experience < 1500) return 5;
        return 5 + (experience - 1500) / 500;
    }

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

    function getAvailableBottleIds() external view returns (uint256[] memory) {
        return availableBottleIds;
    }

    function getTotalBottles() external view returns (uint256) {
        return _bottleIdCounter - 1;
    }
}