pragma solidity ^0.5;
import {SafeMath} from "./SafeMath.sol";
import {Campaigns} from "./Campaigns.sol";

/// @title This is contract for hold all token of users in system
/// @author tuanlh
contract Wallet {
    using SafeMath for uint;

    struct Investment {
        uint id;
        uint amount;
    }

    Campaigns internal camp;
    uint internal mGranularity; //Minium value of Wei
    mapping(address => uint) internal mBalances; // wei
    uint internal mTotalBalances;
    mapping(address => Investment[]) internal investment;
    address internal deployer;

    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);

    /* -- Constructor -- */
    //
    /// @notice Constructor to create a Wallet
    /// @dev This contract is deployed by system and only once deploy
    /// set Granularity is the minimum transferable chunk
    /// Or it is the minimum value of wei corresponds to a token
    /// Or it is price of token
    /// 1 token = mGranularity (wei)
    /// Set deployer = msg.sender (runner contract)
    constructor(Campaigns _camp) public {
        camp = _camp;
        deployer = msg.sender;
        mGranularity = 10**15; // 1 ETH = 1000 tokens
    }

    /// @dev granularity can be understood as the price of a token. 1 token = granularity form as wei
    /// @return the granularity of the token
    function granularity() external view returns (uint) { return mGranularity; }

    /// @dev Get token of user without campaigns
    /// @param _addr is address of user that you want check token
    /// @return Number of token
    function balances(address _addr) external view returns(uint) {
        return mBalances[_addr] / mGranularity;
    }

    /// @notice get my balance (form as Token) of msg.sender with campaign
    /// @param _addr is address of user
    /// @return Result is number of token
    function getBalance(address _addr) public view returns (uint) {
        if (mBalances[msg.sender] == 0) {
            return 0;
        }
        uint balance;
        balance = mBalances[msg.sender] / mGranularity;
        balance = balance.sub(camp.getAllDonation(_addr));
        return balance;
    }

    /// @notice Allow user transfer balances to this contract
    /// @dev This function will receive balance that user send into contract and store in contract
    /// value will be stored in the mBalances variable
    /// Amount is msg.value form as Wei (1 ETH = 10^18 wei)
    function deposit() public payable {
        require(
            msg.value > 0,
            "Amount to deposit MUST be greater zero"
        );
        require(
            msg.value % mGranularity == 0,
            "Amount is not a multiple of granualrity"
        );
        mBalances[msg.sender] = mBalances[msg.sender].add(msg.value);
        mTotalBalances = mTotalBalances.add(msg.value);
        assert(address(this).balance >= mTotalBalances);
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice This function allow user withdraw balances in contract to ETH
    /// @dev Withdraw token in system to ETH. (Wei = token * mGranularity)
    /// @param _amountToken number of token that you want withdraw
    /// amount of token MUST be multiple with mGranularity before send
    /// @return `true` if withdraw process successful
    function withdraw(uint _amountToken) external returns (bool) {
        require(
            _amountToken > 0,
            "Amount to deposit MUST be greater zero"
        );
        require(
            _amountToken <= getBalance(msg.sender),
            "You don't have enough token"
        );
        uint amount = _amountToken.mul(mGranularity);
        // It is important to subtract amount before real transfer
        // because the recipient can call this function again as part of the receiving call
        // before `send` returns.
        mBalances[msg.sender] -= amount;
        mTotalBalances = mTotalBalances.sub(amount);
        if (!msg.sender.send(amount)) {
            mBalances[msg.sender] = mBalances[msg.sender].add(amount);
            mTotalBalances = mTotalBalances.add(amount);
            return false;
        } else {
            assert(address(this).balance >= mTotalBalances);
        }
        emit Withdraw(msg.sender, amount);
        return true;
    }

    /// @notice Allow campaign owner (startups) can withdraw token from a succeed campaign
    /// @dev This function MUST be run by a contract
    /// @param _i is index of campaign
    /// @param _owner is owner of campaign
    /// @param _tokenCollected total token was sold in campaign
    /// @return `true` if withdraw process successful
    function withdrawFromCampaign(uint _i, address _owner, uint _tokenCollected) external
    returns(bool)
    {
        require(
            address(camp) == msg.sender,
            "Sender address is invalid"
        );
        require(
            _tokenCollected > 0,
            "Amount MUST be greater zero"
        );
        require(
            camp.getFinStatus(_i) >= Campaigns.FinStatus.accepted,
            "Campaign MUST be accepted"
        );
        require(
            camp.getStatus(_i) >= Campaigns.Status.succeed,
            "Campaign MUST be succeed"
        );

        uint _amount = _tokenCollected * mGranularity;
        mBalances[_owner] = mBalances[_owner] + _amount;
        return true;
    }

    /// @notice This function for contract owner to change granularity
    /// @param _newGranularity is new value of granularity
    function changeGranularity(uint _newGranularity) external {
        require(
            msg.sender == deployer,
            "This function must be run by deployer"
        );
        mGranularity = _newGranularity;
    }

    function () external payable {deposit();}
}