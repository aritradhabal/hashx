// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreateVote.sol";

error AlreadyDeployed(uint256, address);

contract CreateVoteFactory {
    mapping(uint256 => address) public marketContracts;

    event CreateVoteDeployed(
        uint256 indexed marketId,
        address indexed voteContract
    );

    CreateVote public createVoteContract;

    function createVoteContracts(
        uint256 _marketId,
        uint256 _optionA,
        uint256 _optionB,
        uint256 _rewards,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint32 _thresholdVotes,
        address _hbarLockingContractAddress,
        bytes memory _N,
        uint256 _t,
        uint32 _a,
        bytes32 _skLocked,
        bytes32 _hashedSK
    ) external returns (address) {
        if (marketContracts[_marketId] != address(0)) {
            revert AlreadyDeployed(_marketId, marketContracts[_marketId]);
        }
        createVoteContract = new CreateVote(
            _optionA,
            _optionB,
            _rewards,
            _startTimestamp,
            _endTimestamp,
            _thresholdVotes,
            msg.sender, // The creator of the contract
            _hbarLockingContractAddress,
            _N,
            _t,
            _a,
            _skLocked,
            _hashedSK
        );

        marketContracts[_marketId] = address(createVoteContract);
        emit CreateVoteDeployed(_marketId, address(createVoteContract));
        return address(createVoteContract);
    }

    function getContractsByMarket(
        uint256 _marketId
    ) external view returns (address) {
        return marketContracts[_marketId];
    }
}
