// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Errors

error SENDER_NOT_OWNER(address);
error HBAR_AMOUNT_TOO_SMALL(uint256);
error USER_HAS_LESS_BALANCE(address, uint256);
error CONVERSION_FAILED(address, uint256);
error WHBAR_TRANSFER_FAILED(address, uint256);
error HBAR_TRANSFER_FAILED(address, uint256);
error WITHDRAWAL_FAILED(address, uint256);
error ALREADY_DEPOSITED_FUNDS(address, uint256);
error TIME_TO_LEFT_WITHDRAW(address, uint256);

interface IWHBAR {
    function deposit() external payable;

    function balanceOf(address) external view returns (uint256);

    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(address, address, uint256) external returns (bool);

    function withdraw(uint256) external;
}

contract LockingContract is ReentrancyGuard {
    uint256 public contractBalance;
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userDepositTimestamps;
    uint256 public totalBalanceInPool;
    address public constant WHBAR_CONTRACT_ADDRESS =
        address(0xb1F616b8134F602c3Bb465fB5b5e6565cCAd37Ed); //should be immutable
    IWHBAR public whbarContract = IWHBAR(WHBAR_CONTRACT_ADDRESS);
    address public immutable OWNER;
    uint256 public userDepositLockingPeriod; // should be immutable too

    constructor() {
        OWNER = msg.sender;
    }

    function setUserDepositLockingPeriod(
        uint256 _userDepositLockingPeriod
    ) public {
        if (msg.sender != OWNER) {
            revert SENDER_NOT_OWNER(msg.sender);
        }
        userDepositLockingPeriod = _userDepositLockingPeriod;
    }

    function stakeWithHBAR() public payable {
        uint256 _userDeposit = msg.value;
        address _userAddress = msg.sender;
        if (_userDeposit < 1e8) {
            revert HBAR_AMOUNT_TOO_SMALL(_userDeposit);
        }
        totalBalanceInPool += _userDeposit;
        userDeposits[_userAddress] += _userDeposit;
        userDepositTimestamps[_userAddress] = block.timestamp;
        whbarContract.deposit{value: _userDeposit}();
    }

    function checkWHBARBalance(address _address) public view returns (uint256) {
        return whbarContract.balanceOf(_address);
    }

    // use "get" instead of "check"
    // function getWHBARBalance(address _address) public view returns (uint256) {
    //     return whbarContract.balanceOf(_address);
    // }

    function checkUserDeposit(address _address) public view returns (uint256) {
        return userDeposits[_address];
    }

    // use "get" instead of "check"
    // function getUserDeposit(address _address) public view returns (uint256) {
    //     return userDeposits[_address];
    // }

    function transferWHbar(
        address _payerAddress,
        address payable _payeeAddress,
        uint256 _amount
    ) external returns (bool) {
        if (userDeposits[_payerAddress] < _amount) {
            revert USER_HAS_LESS_BALANCE(
                _payerAddress,
                userDeposits[_payerAddress]
            );
        }
        userDeposits[_payerAddress] -= _amount;
        totalBalanceInPool -= _amount;
        bool success = whbarContract.transfer(_payeeAddress, _amount);
        if (!success) {
            revert WHBAR_TRANSFER_FAILED(_payeeAddress, _amount);
        }
        return success;
    }

    function receiveWHbar(
        address _receiverAddress,
        uint256 _amount
    ) external payable {
        userDeposits[_receiverAddress] += _amount;
        totalBalanceInPool += _amount;
    }

    function transferHbar(
        address payable _receiverAddress,
        uint256 _amount
    ) private {
        (bool success, ) = _receiverAddress.call{value: _amount}("");
        if (!success) revert HBAR_TRANSFER_FAILED(_receiverAddress, _amount);
    }

    function unstake(uint256 _amount) public nonReentrant {
        uint256 _userBalance = userDeposits[msg.sender];
        address _userAddress = msg.sender;
        uint256 lockReleaseTime = userDepositTimestamps[_userAddress] +
            userDepositLockingPeriod;

        if (_userBalance < _amount) {
            revert USER_HAS_LESS_BALANCE(_userAddress, _userBalance);
        }
        uint256 _remainingTimeToWithdraw = 0;
        if (lockReleaseTime > block.timestamp) {
            _remainingTimeToWithdraw = lockReleaseTime - block.timestamp;
            revert TIME_TO_LEFT_WITHDRAW(
                _userAddress,
                _remainingTimeToWithdraw
            );
        }
        userDeposits[_userAddress] -= _amount;
        totalBalanceInPool -= _amount;
        whbarContract.withdraw(_amount);
        contractBalance -= _amount;
        transferHbar(payable(_userAddress), _amount);
    }

    function contractDeposit() public payable {
        contractBalance += msg.value;
    }

    receive() external payable {
        contractDeposit();
    }

    fallback() external payable {
        contractDeposit();
    }
}
