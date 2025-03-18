pragma solidity ^0.8.16;

interface IOracle {
    function getAnswer(uint256 questionId) external view returns (string memory);
    function getAnswerNoOlderThan(
        uint256 questionId,
        uint256 maxAge
    ) external view returns (string memory);
    function updateFeeds(bytes memory data) external;
    function subscribe(
        uint256 _oracleId,
        address userContract,
        uint256 price,
        uint256 expire,
        address payable owner,
        bytes memory signature
    ) external payable;
}

contract PriceConsumer {
    IOracle public oracle;
    constructor(address _oracleAddress) {
        oracle = IOracle(_oracleAddress);
    }
    function getPrice(uint256 questionId) public view returns (string memory) {
        string memory answer = oracle.getAnswer(questionId);
        require(bytes(answer).length > 0, "Price not found");
        return answer;
    }
    function getPriceWithAge(
        uint256 questionId,
        uint256 maxAge
    ) public view returns (string memory) {
        string memory answer = oracle.getAnswerNoOlderThan(questionId, maxAge);
        require(bytes(answer).length > 0, "Price not found or too old");
        return answer;
    }
    function updateOracleFeeds(bytes memory data) public {
        oracle.updateFeeds(data);
    }
    function subscribeToOracle(
        uint256 _oracleId,
        address userContract,
        uint256 price,
        uint256 expire,
        address payable owner,
        bytes memory signature
    ) public payable {
        oracle.subscribe(
            _oracleId,
            userContract,
            price,
            expire,
            owner,
            signature
        );
    }
}
