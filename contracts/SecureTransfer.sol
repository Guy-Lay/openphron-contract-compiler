// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SecureTransfer is ReentrancyGuard {
    using Address for address;

    mapping(address => bool) public isAuthenticated;
    address public owner;

    event TransferInitiated(
        address indexed sender,
        address indexed recipient,
        address tokenAddress,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function authenticateUser(address _user) public onlyOwner {
        isAuthenticated[_user] = true;
    }

    function deauthenticateUser(address _user) public onlyOwner {
        isAuthenticated[_user] = false;
    }

    function isUserAuthenticated(address _user) public view returns (bool) {
        return isAuthenticated[_user];
    }

    function transfer(
        address _recipient,
        address _tokenAddress,
        uint256 _amount
    ) public payable nonReentrant {
        require(isAuthenticated[msg.sender], "User is not authenticated");
        require(_recipient != address(0), "Recipient address cannot be zero address");
        require(_amount > 0, "Amount must be greater than zero");

        if (_tokenAddress == address(0)) {
            // ETH transfer
            require(msg.value == _amount, "Incorrect ETH amount sent");
            (bool success, ) = payable(_recipient).call{value: _amount}("");
             require(success, "ETH transfer failed");
        } else {
            // ERC20 token transfer
            IERC20 token = IERC20(_tokenAddress);
            require(token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
            require(token.balanceOf(msg.sender) >= _amount, "Insufficient token balance");
            bool success = token.transferFrom(msg.sender, _recipient, _amount);
             require(success, "Token transfer failed");
        }

        emit TransferInitiated(msg.sender, _recipient, _tokenAddress, _amount);
    }


    function withdraw(address _recipient, address _tokenAddress, uint256 _amount) public onlyOwner nonReentrant {
        require(_recipient != address(0), "Recipient address cannot be zero address");
        require(_amount > 0, "Amount must be greater than zero");


        if (_tokenAddress == address(0)) {
           (bool success, ) = payable(_recipient).call{value: _amount}("");
           require(success, "ETH withdraw failed");
        } else {
            IERC20 token = IERC20(_tokenAddress);
            uint256 contractBalance = token.balanceOf(address(this));
            require(contractBalance >= _amount, "Insufficient contract balance");
            bool success = token.transfer(_recipient, _amount);
            require(success, "Token withdraw failed");
        }
    }


    receive() external payable {}
}