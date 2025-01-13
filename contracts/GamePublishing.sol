// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOracle {
    function getQuestion(uint256 _questionId) external view returns (string memory answer);
}

contract GamePublishing {
    address public immutable publisher;
    address public immutable developer;
    string public gameTitle;
    uint256 public immutable royaltyRate;
    uint256 public immutable publishDate;
    bool public isPublished;
    IOracle public oracle;

    event GamePublished(address indexed publisher, address indexed developer, string gameTitle);
    event RoyaltyPaid(address indexed developer, uint256 amount);

    constructor(address _developer, string memory _gameTitle, uint256 _royaltyRate, uint256 _publishDate, address _oracleAddress) {
        require(_developer != address(0), "Developer address cannot be zero");
        require(_royaltyRate <= 100, "Royalty rate must be less than or equal to 100");
        publisher = msg.sender;
        developer = _developer;
        gameTitle = _gameTitle;
        royaltyRate = _royaltyRate;
        publishDate = _publishDate;
        isPublished = false;
        oracle = IOracle(_oracleAddress);
    }


    modifier onlyPublisher() {
        require(msg.sender == publisher, "Only publisher can call this function");
        _;
    }

    function publishGame() external onlyPublisher {
        require(!isPublished, "Game is already published");
        require(block.timestamp >= publishDate, "Publish date has not been reached");
        isPublished = true;
        emit GamePublished(publisher, developer, gameTitle);
    }

    function calculateRoyalty(uint256 _revenue) public view returns (uint256) {
        return (_revenue * royaltyRate) / 100;
    }

   function payRoyalty(uint256 _revenue) external onlyPublisher {
        require(isPublished, "Game is not published yet");
        require(_revenue > 0, "Revenue must be greater than zero");
        uint256 royaltyAmount = calculateRoyalty(_revenue);
        (bool success,) = payable(developer).call{value: royaltyAmount}("");
         require(success, "Transfer failed.");
        emit RoyaltyPaid(developer, royaltyAmount);
    }

    function getOracleQuestion(uint256 _questionId) external view returns (string memory) {
        return oracle.getQuestion(_questionId);
    }

    function setOracleAddress(address _oracleAddress) external onlyPublisher{
        require(_oracleAddress != address(0), "Oracle address cannot be zero");
      oracle = IOracle(_oracleAddress);
    }
}