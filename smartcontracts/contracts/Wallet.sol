pragma solidity ^0.5.3;
import {SafeMath} from "./SafeMath.sol";
import {Campaigns} from "./Campaigns.sol";

contract Wallet {
    using SafeMath for uint;

    Campaigns internal camp;
    uint internal mGranularity; //Minium value of Wei
    uint internal mTotalBalances;
    address internal deployer;
    mapping(address => uint) internal mBalances; // wei

    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);

    /* -- Constructor -- */
    //
    /// @notice Constructor to create a Wallet
    /// @dev This contract is deployed by system and only once deploy
    /// @param addrCampaign is address of Campaign contract
    constructor(Campaigns addrCampaign) public {
        camp = addrCampaign;
        deployer = msg.sender;
        mGranularity = 10**15; // 1 ETH = 1000 tokens
    }

    /// @dev granularity can be understood as the price of a token. 1 token = granularity form as wei
    /// @return the granularity of the token
    function granularity() external view returns (uint) { return mGranularity; }

    /// @dev Get token of user without campaigns
    /// @param user is address of user that you want check token
    /// @return Number of token
    function balances(address user) external view returns(uint) {
        return mBalances[user] / mGranularity;
    }

    /// @notice get my balance (form as Token) of msg.sender with campaign
    /// @param user is address of user
    /// @return Result is number of token
    function getBalance(address user) public view returns (uint) {
        if (mBalances[msg.sender] == 0) {
            return 0;
        }
        uint balance;
        balance = mBalances[msg.sender] / mGranularity;
        balance = balance.sub(camp.getAllDonation(user));
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
    /// @param amount number of token that you want withdraw
    /// @return `true` if withdraw process successful
    function withdraw(uint amount) external returns (bool) {
        require(
            amount > 0,
            "Amount to deposit MUST be greater zero"
        );
        require(
            amount <= getBalance(msg.sender),
            "You don't have enough token"
        );
        uint weiValue = amount.mul(mGranularity); // exchange from token to Wei
        
        mBalances[msg.sender] -= weiValue;
        mTotalBalances = mTotalBalances.sub(weiValue);
        emit Withdraw(msg.sender, weiValue);
        if (!msg.sender.send(weiValue)) {
            mBalances[msg.sender] = mBalances[msg.sender].add(weiValue);
            mTotalBalances = mTotalBalances.add(weiValue);
            return false;
        } else {
            assert(address(this).balance >= mTotalBalances);
            return true;
        }
    }

    /// @notice Allow campaign owner (startups) can withdraw token from a succeed campaign
    /// @dev This function MUST be run by Campaign contract
    /// @param to is owner of campaign
    /// @param amount total token was sold in campaign
    /// @return `true` if withdraw process successful
    function addToken(address to, uint amount) external
    returns(bool)
    {
        require(
            address(camp) == msg.sender,
            "Sender address is invalid"
        );
        require(
            amount > 0,
            "Amount MUST be greater zero"
        );

        mBalances[to] = mBalances[to] + (amount * mGranularity);
        return true;
    }

    /// @notice This function for contract owner to change granularity
    /// @param newGranularity is new value of granularity
    function changeGranularity(uint newGranularity) external {
        require(
            msg.sender == deployer,
            "This function must be run by deployer"
        );
        mGranularity = newGranularity;
    }

    function () external payable {deposit();}
}