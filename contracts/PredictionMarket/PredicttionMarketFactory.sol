// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PredictionMarket.sol";

error AlreadyDeployed(uint256 marketId, address existing);

contract PredictionMarketFactory {
    mapping(uint256 => address) public marketContracts;

    event PredictionMarketDeployed(
        uint256 indexed marketId,
        address indexed market
    );

    PredictionMarket public predictionMarketContract;

    function createPredictionMarket(
        uint256 _marketId,
        address _oracle,
        string memory _question,
        string memory _description,
        uint256 _initialTokenValue,
        address _hbarLockingContractAddress,
        uint8 _initialYesProbability,
        uint8 _percentageToLock,
        uint256 _s_ethCollateral
    ) external returns (address) {
        if (marketContracts[_marketId] != address(0)) {
            revert AlreadyDeployed(_marketId, marketContracts[_marketId]);
        }

        predictionMarketContract = new PredictionMarket(
            msg.sender,
            _oracle,
            _question,
            _description,
            _initialTokenValue,
            _hbarLockingContractAddress,
            _initialYesProbability,
            _percentageToLock,
            _s_ethCollateral
        );

        marketContracts[_marketId] = address(predictionMarketContract);
        emit PredictionMarketDeployed(
            _marketId,
            address(predictionMarketContract)
        );
        return address(predictionMarketContract);
    }

    function getContractsByMarket(
        uint256 _marketId
    ) external view returns (address) {
        return marketContracts[_marketId];
    }
}
