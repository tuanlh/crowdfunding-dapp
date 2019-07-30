pragma solidity ^0.5;
import {SafeMath} from "./SafeMath.sol";
import {Campaigns} from "./Campaigns.sol";

/// @title This is contract for hold all token of users in system
/// @author tuanlh
contract TokenSystem {
    using SafeMath for uint;

    struct Investment {
        uint id;
        uint amount;
    }

    Campaigns internal campaigns;
    address internal admin;
    uint internal mGranularity; //Minium value of Wei 
    mapping(address => uint) internal mBalances; // wei
    uint internal mTotalBalances;
    mapping(address => Investment[]) investment;

    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);

    /* -- Constructor -- */
    //
    /// @notice Constructor to create a TokenSystem
    /// @dev This contract is deployed by system and only once deploy
    /// set Granularity is the minimum transferable chunk
    /// Or it is the minimum value of wei corresponds to a token
    /// Or it is price of token
    /// 1 token = mGranularity (wei)
    /// Set admin = msg.sender (runner contract)
    constructor() public {    
        admin = msg.sender;
        mGranularity = 10**15; // 1 ETH = 1000 tokens
        mTotalBalances = 0;
    }
    
    /// @dev granularity can be understood as the price of a token. 1 token = granularity form as wei
    /// @return the granularity of the token
    function granularity() public view returns (uint) { return mGranularity; }

    /// @dev Get token of user without campaigns
    /// @param _addr is address of user that you want check token
    /// @return Number of token
    function balances(address _addr) public view returns(uint) {
        return mBalances[_addr].div(mGranularity);
    }

    /// @notice get my balance (form as Token) of msg.sender with campaign
    /// @param _addr is address of user
    /// @return Result is number of token
    function getBalance(address _addr) public view returns (uint) {
        if (mBalances[msg.sender] == 0) {
            return 0;
        }
        uint balance;
        balance = mBalances[msg.sender].div(mGranularity);
        balance = balance.sub(campaigns.getTotalInvest(_addr));
        return balance;
    }

    /// @dev Call function getBalance() with params is msg.sender
    /// @return Number of token of sender
    function getMyBalance() public view returns (uint) {
        return getBalance(msg.sender);
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
        requireMultiple(msg.value);
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
    function withdraw(uint _amountToken) public returns (bool) {
        require(
            _amountToken > 0,
            "Amount to deposit MUST be greater zero"
        );
        require(
            _amountToken <= getMyBalance(),
            "You don't have enough token"
        );
        uint amount = _amountToken.mul(mGranularity);
        // It is important to subtract amount before real transfer
        // because the recipient can call this function again as part of the receiving call
        // before `send` returns.
        mBalances[msg.sender] = mBalances[msg.sender].sub(amount);
        mTotalBalances = mTotalBalances.sub(amount);
        if (!msg.sender.send(amount)) {
            mBalances[msg.sender] = mBalances[msg.sender].add(amount);
            mTotalBalances = mTotalBalances.add(amount);
            return false;
        }
        emit Withdraw(msg.sender, amount);
        return true;
        
    }

     /// @dev This function add address of campaign contract
    /// @param _campaign is an address
    function updateCampaignAddr(Campaigns _campaign) public {
        require(
            msg.sender == admin, 
            "You MUST be owner of this contract");
        campaigns = _campaign;
    }

    /// @notice Allow campaign owner (startups) can withdraw token from a succeed campaign
    /// @dev This function MUST be run by a contract
    /// @param _i is index of campaign
    /// @param _owner is owner of campaign
    /// @param _tokenCollected total token was sold in campaign
    /// @return `true` if withdraw process successful
    function withdrawFromCampaign(uint _i, address _owner, uint _tokenCollected) public
    returns(bool)
    {
        require(
            isContractAddress(msg.sender),
            "Run this contract MUST be a contract"
        );
        require(
            address(campaigns) == msg.sender,
            "Sender this function is invalid"
        );
        require(
            _tokenCollected > 0,
            "Amount MUST be greater zero"
        );
        require(
            campaigns.getFinStatus(_i) >= Campaigns.FinStatus.accepted,
            "Campaign MUST be accepted"
        );
        require(
            campaigns.getStatus(_i) >= Campaigns.Status.succeed,
            "Campaign MUST be succeed"
        );

        uint _amount = _tokenCollected.mul(mGranularity);
        mBalances[_owner] = mBalances[_owner].add(_amount);
        return true;
    }

    /// @notice check wether is admin
    /// @dev This function is called by a contract to verify address of sender
    /// @param _addr is address that you want to check
    /// @return `true` if _addr == admin
    function isAdmin(address _addr) public view returns(bool) {
        return admin == _addr;
    }

    /* -- Helper Functions -- */
    //
    /// @notice Internal function that ensures `_amount` is multiple of the granularity
    /// @param _amount The quantity that want's to be checked
    function requireMultiple(uint _amount) internal view {
        require(_amount % mGranularity == 0, "Amount is not a multiple of granualrity");
    }

    /// @notice Check whether an address is an address belong to contract or not.
    /// @param _addr Address of the contract that has to be checked
    /// @return `true` if `_addr` is a contract address
    function isContractAddress(address _addr) internal view returns(bool) {
        uint size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }

    function () external payable {deposit();}
}