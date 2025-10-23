// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Errors
error StartTimestampMustBeBeforeEndTimestamp(
    uint256 startTimestamp,
    uint256 endTimestamp
);
error VoteNotStarted(uint256);
error AlreadyVoted(address);
error RewardsTooSmall(address, uint256);
error DepositTooSmall(address);
error IncorrectSecretKey(bytes32);

interface HBARlockingContract {
    function transferWHbar(address, address, uint256) external returns (bool);

    function checkUserDeposit(address) external returns (uint256);

    function receiveWHbar(address, uint256) external payable;

    function checkWHBARBalance(address) external view returns (uint256);
}

contract CreateVote {
    // Events
    event VoteCast(
        address indexed voter,
        uint256 indexed userPublicKey,
        bytes option
    );

    event PuzzleSolved(address indexed solver, bytes32 indexed unlockedSecret);
    event VoteFinalized(
        uint256 indexed optionA,
        uint256 indexed optionB,
        uint256 indexed winner
    );

    struct VoteConfig {
        uint256 optionA;
        uint256 optionB;
        uint256 rewards;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint32 thresholdVotes;
        address creator;
    }

    struct VoteData {
        uint256 resolvedOption;
        bytes32 unlockedSecret;
        uint32 totalVotes;
        address solver;
    }

    struct PublicParameters {
        bytes N;
        uint256 t;
        uint32 a;
        bytes32 sk_locked;
        bytes32 hashedSK;
        bytes32 publicKey;
    }

    HBARlockingContract public LockingContract;
    VoteConfig public config;
    VoteData public data;
    PublicParameters public pp;

    mapping(address => uint256) public voters; // original (address) -> (uint256) derived PublicKey || mapping of original address to pseudo address (publickey is generated on device)
    mapping(uint256 => bytes) public encryptedVotes; // (uint256) -> votes (bytes) || mapping of pseudo address to their encryptedVotes
    mapping(address => uint256) public deposits; //mapping of original address to their deposits, future:changed to pseudo address

    constructor(
        uint256 _optionA,
        uint256 _optionB,
        uint256 _rewards,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint32 _thresholdVotes,
        address _creator,
        address _hbarLockingContractAddress,
        bytes memory _N,
        uint256 _t,
        uint32 _a,
        bytes32 _skLocked,
        bytes32 _hashedSK,
        bytes32 _publicKey
    ) {
        LockingContract = HBARlockingContract(_hbarLockingContractAddress);
        if (_startTimestamp >= _endTimestamp) {
            revert StartTimestampMustBeBeforeEndTimestamp(
                _startTimestamp,
                _endTimestamp
            );
        }
        if (_rewards < 1e8) {
            revert RewardsTooSmall(_creator, _rewards);
        }
        if (LockingContract.checkUserDeposit(_creator) < _rewards) {
            revert DepositTooSmall(_creator);
        }

        config = VoteConfig({
            optionA: _optionA,
            optionB: _optionB,
            rewards: _rewards,
            startTimestamp: _startTimestamp,
            endTimestamp: _endTimestamp,
            thresholdVotes: _thresholdVotes,
            creator: _creator
        });
        pp = PublicParameters({
            N: _N,
            t: _t,
            a: _a,
            sk_locked: _skLocked,
            hashedSK: _hashedSK,
            publicKey: _publicKey
        });

        LockingContract.transferWHbar(_creator, address(this), _rewards);
    }

    function getPublicParameters()
        public
        view
        returns (PublicParameters memory)
    {
        return pp;
    }

    function getVoteConfig() public view returns (VoteConfig memory) {
        return config;
    }

    function getContractBalance() public view returns (uint256) {
        return LockingContract.checkWHBARBalance(address(this));
    }

    function getDoubleHashedSK() public view returns (bytes32) {
        return keccak256(abi.encodePacked(pp.hashedSK));
    }

    function getVoteData() public view returns (VoteData memory) {
        return data;
    }

    function castVote(
        uint256 _userPublicKey,
        bytes memory _option,
        uint256 _amount
    ) public {
        if (voters[msg.sender] != 0) {
            // (address)->(uint256 / user's pk) checking
            revert AlreadyVoted(msg.sender);
        }
        if (LockingContract.checkUserDeposit(msg.sender) < _amount) {
            revert DepositTooSmall(msg.sender);
        }
        if (
            block.timestamp < config.startTimestamp ||
            block.timestamp > config.endTimestamp
        ) {
            revert VoteNotStarted(config.startTimestamp);
        }
        data.totalVotes++;
        voters[msg.sender] = _userPublicKey;
        encryptedVotes[_userPublicKey] = _option;
        deposits[msg.sender] = _amount;
        LockingContract.transferWHbar(msg.sender, address(this), _amount);
        emit VoteCast(msg.sender, _userPublicKey, _option);
    }

    function verifySecret(bytes32 _userSecret) public returns (bool) {
        bytes32 hashedUserSecret = keccak256(
            abi.encodePacked(keccak256(abi.encodePacked(_userSecret)))
        );
        bytes32 doubleHashedSK = getDoubleHashedSK();
        if (data.solver != address(0)) {
            if (hashedUserSecret == doubleHashedSK) {
                return true;
            } else {
                revert IncorrectSecretKey(_userSecret);
            }
        } else {
            if (hashedUserSecret == doubleHashedSK) {
                data.unlockedSecret = _userSecret;
                data.solver = msg.sender;
                LockingContract.receiveWHbar(
                    msg.sender,
                    (config.rewards * 10) / 100
                );
                emit PuzzleSolved(msg.sender, _userSecret);
                return true;
            } else {
                revert IncorrectSecretKey(_userSecret);
            }
        }
    }

    // function finalizeVote(uint256 _optionACount, uint256 _optionBcount) public {
    //     if (_optionACount > _optionBcount) {
    //         winner = _optionACount;
    //     } else if (_optionACount < _optionBcount) {
    //         winner = _optionBcount;
    //     }
    //     emit WinningOption(, winner);
    // }

    // function getWinner() public view returns (uint256) {
    //     return winner;
    // }

    // function claimRewards() public {}
}
