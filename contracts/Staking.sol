// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

interface IOracle {
    function getQuestion(uint256 _questionId) external view returns (string memory answer);
}

contract Staking is Ownable, ReentrancyGuard {
    using SafeCast for uint256;

    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(address => uint256)) public stakedBalances;
    IOracle public oracle;

    struct RewardParams {
        uint256 baseRewardRate;
        uint256 timeBasedRate;
        uint256 questionId;
    }
    mapping(address => RewardParams) public rewardParams;
    mapping(address => mapping(address => uint256)) public lastClaimedTimestamp;

    event Staked(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event RewardPaid(address indexed user, address indexed token, uint256 amount);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event OracleAddressUpdated(address indexed oracleAddress);
    event RewardParamsUpdated(address indexed token, uint256 baseRewardRate, uint256 timeBasedRate, uint256 questionId);

    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    function setOracleAddress(address _oracleAddress) external onlyOwner {
        oracle = IOracle(_oracleAddress);
        emit OracleAddressUpdated(_oracleAddress);
    }

    function addSupportedToken(address token, uint256 _baseRewardRate, uint256 _timeBasedRate, uint256 _questionId) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        rewardParams[token] = RewardParams(_baseRewardRate, _timeBasedRate, _questionId);
        emit TokenAdded(token);
        emit RewardParamsUpdated(token, _baseRewardRate, _timeBasedRate, _questionId);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        supportedTokens[token] = false;
        delete rewardParams[token];
         emit TokenRemoved(token);
    }

    function setRewardParams(address token, uint256 _baseRewardRate, uint256 _timeBasedRate, uint256 _questionId) external onlyOwner onlySupportedToken(token) {
        rewardParams[token] = RewardParams(_baseRewardRate, _timeBasedRate, _questionId);
        emit RewardParamsUpdated(token, _baseRewardRate, _timeBasedRate, _questionId);
    }

    function stake(address token, uint256 amount) external nonReentrant onlySupportedToken(token) {
        require(amount > 0, "Amount must be greater than zero");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        stakedBalances[token][msg.sender] += amount;
        lastClaimedTimestamp[token][msg.sender] = block.timestamp;
        emit Staked(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external nonReentrant onlySupportedToken(token) {
        require(amount > 0, "Amount must be greater than zero");
        require(stakedBalances[token][msg.sender] >= amount, "Insufficient balance");
        stakedBalances[token][msg.sender] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, token, amount);
    }

    function calculateReward(address token, address user) public view returns (uint256) {
         RewardParams memory params = rewardParams[token];
        uint256 stakedAmount = stakedBalances[token][user];
        uint256 timeStaked = block.timestamp - lastClaimedTimestamp[token][user];
        if (stakedAmount == 0) return 0;
        string memory oracleAnswer = oracle.getQuestion(params.questionId);
        uint256 dynamicRewardFactor = uint256(keccak256(abi.encodePacked(oracleAnswer))) % 100 + 100;
        
        uint256 baseReward = (stakedAmount * params.baseRewardRate) ;
        uint256 timeBasedReward = (stakedAmount * params.timeBasedRate * timeStaked) / 1000000000;
        
        return (baseReward + timeBasedReward) * dynamicRewardFactor / 100;
    }

    function claimRewards(address token) external nonReentrant onlySupportedToken(token) {
         uint256 rewardAmount = calculateReward(token, msg.sender);
         if(rewardAmount > 0 ){
            IERC20(token).transfer(msg.sender, rewardAmount);
            lastClaimedTimestamp[token][msg.sender] = block.timestamp;
            emit RewardPaid(msg.sender, token, rewardAmount);
        }
    }
}