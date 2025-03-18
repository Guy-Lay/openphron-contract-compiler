pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleMarketplace is Ownable {
    struct Question {
        uint256 id;
        uint256 oracleId;
        string answer;
        uint256 updatedAt;
    }

    struct UpdateFeedsData {
        uint256 questionId;
        uint256 oracleId;
        string answer;
        uint256 updatedAt;
    }

    mapping(uint256 => Question) private questions;
    mapping(address => mapping(uint256 => uint256))
        public subscriptionExpiration;

    address public operator;

    event Subscribed(
        address indexed user,
        address indexed userContract,
        uint256 indexed oracleId,
        uint256 expire
    );
    event QuestionUpdated(
        uint256 indexed questionId,
        uint256 indexed oracleId,
        string answer,
        uint256 updatedAt
    );
    event SignatureVerificationFailed(address signer);
    event OperatorChanged(address newOwner);

    constructor(address _operator) {
        operator = _operator;
    }

    function subscribe(
        uint256 _oracleId,
        address userContract,
        uint256 price,
        uint256 expire,
        address payable owner,
        bytes memory signature
    ) external payable {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_oracleId, userContract, price, expire, owner)
        );
        verifySignature(messageHash, signature);
        require(msg.value == price, "Incorrect payment amount");
        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "Transfer failed");
        subscriptionExpiration[userContract][_oracleId] = expire;
        emit Subscribed(msg.sender, userContract, _oracleId, expire);
    }

    function getAnswer(
        uint256 questionId
    ) external view returns (string memory) {
        return _getAnswer(questionId, msg.sender);
    }

    function getAnswerNoOlderThan(
        uint256 questionId,
        uint256 maxAge
    ) external view returns (string memory) {
        Question memory question = questions[questionId];
        require(
            question.updatedAt > block.timestamp - maxAge,
            "Question is too old"
        );
        return _getAnswer(questionId, msg.sender);
    }

    function _getAnswer(
        uint256 questionId,
        address userContractAddress
    ) internal view returns (string memory) {
        Question memory question = questions[questionId];
        require(question.id != 0, "Question does not exist");
        require(
            subscriptionExpiration[userContractAddress][question.oracleId] >
                block.timestamp,
            "Subscription required or expired"
        );
        return question.answer;
    }

    function updateFeeds(bytes memory encodedData) external {
        (
            uint256 questionId,
            uint256 oracleId,
            string memory answer,
            uint256 updatedAt,
            bytes memory signature
        ) = abi.decode(encodedData, (uint256, uint256, string, uint256, bytes));

        bytes32 messageHash = keccak256(
            abi.encodePacked(questionId, oracleId, answer, updatedAt)
        );
        verifySignature(messageHash, signature);
        if (questions[questionId].id == 0) {
            questions[questionId] = Question(
                questionId,
                oracleId,
                answer,
                updatedAt
            );
        } else {
            questions[questionId].answer = answer;
            questions[questionId].updatedAt = updatedAt;
        }
        emit QuestionUpdated(questionId, oracleId, answer, updatedAt);
    }

    function verifySignature(
        bytes32 _messageHash,
        bytes memory _signature
    ) public view {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        address signer = recoverSigner(ethSignedMessageHash, _signature);
        require(signer == operator, "Signature verification failed");
    }

    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory _sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    function setOperator(address newOperator) external onlyOwner {
        operator = newOperator;
        emit OperatorChanged(newOperator);
    }
}
