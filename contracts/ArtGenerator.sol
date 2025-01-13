// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IOracle {
    function getQuestion(uint256 _questionId) external view returns (string memory answer);
}

contract ArtGenerator is Ownable {
    using Strings for uint256;

    IOracle public oracle;
    uint256 public questionId;
    string public oracleAnswer;

    struct ArtData {
        uint256 id;
        string modelName;
        string style;
        string colorPalette;
        string prompt;
        string metadata;
    }

    mapping(uint256 => ArtData) public artData;
    uint256 public artCount;

    event ArtGenerated(uint256 indexed artId, string modelName, string style, string colorPalette, string prompt, string metadata);
    event OracleAnswerReceived(uint256 questionId, string answer);

    constructor(address _oracleAddress) {
        if (_oracleAddress == address(0)) revert InvalidAddress();
        oracle = IOracle(_oracleAddress);
    }

    function generateArt(string memory _modelName, string memory _style, string memory _colorPalette, string memory _prompt, string memory _metadata) public {
        artCount++;
        artData[artCount] = ArtData(artCount, _modelName, _style, _colorPalette, _prompt, _metadata);
        emit ArtGenerated(artCount, _modelName, _style, _colorPalette, _prompt, _metadata);
    }

    function setOracleAddress(address _oracleAddress) public onlyOwner {
        if (_oracleAddress == address(0)) revert InvalidAddress();
        oracle = IOracle(_oracleAddress);
    }


    function setQuestionId(uint256 _questionId) public onlyOwner {
        questionId = _questionId;
    }

    function getOracleAnswer() public {
        oracleAnswer = oracle.getQuestion(questionId);
        emit OracleAnswerReceived(questionId, oracleAnswer);
    }

    function getArtData(uint256 _artId) public view returns (ArtData memory) {
        if(_artId == 0 || _artId > artCount) revert InvalidArtId();
        return artData[_artId];
    }

    function getArtCount() public view returns (uint256) {
        return artCount;
    }
    
    error InvalidAddress();
    error InvalidArtId();
}