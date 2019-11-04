pragma solidity ^0.5;
import {SafeMath} from "./SafeMath.sol";
import {TokenSystem} from "./TokenSystem.sol";
import {Identity} from "./Identity.sol";
import {Disbursement} from "./Disbursement.sol";

/// @title This contract store info about campaigns
/// @author tuanlh
contract Campaigns {
    TokenSystem token;
    Identity id;
    Disbursement disb;
    using SafeMath for uint;

    /* Explaintation of campaign status
    * During: end date < now
    * Failed: end date >= now AND token collected < goal
    * Succeed: end date >= now AND token collected >= goal
    */
    enum Status {during, failed, succeed}

    /* Explaintation of campaign FINACIAL status
    * Pending: new campaign just added. NOT allow investor fund to campaign
    * Accepted: a campaign was verified => Allow investors fund to campaign
    * Paid: a campaign that owner withdraw token completed => end campaign
    */
    enum FinStatus {pending, accepted, rejected, paid}

    struct CampaignInfo {
        address owner;
        uint startDate;
        uint endDate;
        uint goal;
        uint collected;
        uint stage;
        FinStatus finstt;
        address[] investors;
        mapping(address => uint) investment;
        mapping(address => bool) isInvest;
        string ref; // store reference to other info as name, description on db
        string hashIntegrity; // hash of data store in server
    }

    CampaignInfo[] internal campaigns;
    mapping(address => uint[]) internal investors; //mapping investors to campaigns id
    address admin;
    event Added(uint id);
    event Accepted(uint id);
    event Invested(uint id, address invester, uint token);
    event Refund(uint id, address investor, uint token);
    event Paid(uint id, address ownerCampaign, uint token);

     /* -- Constructor -- */
    //
    /// @notice Constructor to create a campaign contract
    /// @dev This contract MUST be run after TokenSystem
    /// @param _id is address of Identity contract
    constructor(Identity _id) public {
        admin = msg.sender;
        id = _id;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Only admin"
            );
        _;
    }

    /// @notice Update address of other contracts
    /// @param _token is address of TokenSystem contract
    /// @param _disb is address of Disbursement contract
    function linkOtherContracts(TokenSystem _token, Disbursement _disb)
    public onlyAdmin() {
        token = _token;
        disb = _disb;
    }

    /// @notice Get properties of a campaign
    /// @param _index is index of campaigns array
    /// @return object {startDate, endDate, goal, collected, owner, finStatus, status, ref}
    function getInfo(uint _index) public view
    returns(
        uint startDate,
        uint endDate,
        uint goal,
        uint collected,
        address owner,
        FinStatus finStatus,
        Status status,
        string memory ref,
        string memory hashIntegrity
        ) {
        ref = campaigns[_index].ref;
        hashIntegrity = campaigns[_index].hashIntegrity;
        startDate = campaigns[_index].startDate;
        endDate = campaigns[_index].endDate;
        goal = campaigns[_index].goal;
        collected = campaigns[_index].collected;
        owner = campaigns[_index].owner;
        finStatus = campaigns[_index].finstt;
        status = getStatus(_index);
    }

    /// @notice Create a campaign
    /// @dev Add an element to variable campaigns array
    /// @param _deadline is deadline for fundraising of a campaign. (unit: second)
    /// @param _goal is goal of a campaign. Min-Max: 100.000-1.000.000.000
    /// @param _numStage is number of stage withdraw campaign
    /// @param _amountStages is amount of each stage withdraw campaign
    /// @param _mode is mode for disburse campaign
    /// @param _timeStages is deadline for each stage withdraw campaign
    /// @param _ref is campaign reference to other information about campaign
    /// @param _hash is hash of data will store in db server, to check integrity
    function createCampaign(
        uint _deadline,
        uint _goal,
        uint _numStage,
        uint[] memory _amountStages,
        Disbursement.Mode _mode,
        uint[] memory _timeStages,
        string memory _ref,
        string memory _hash
        )
    public {
        // To testing, you can comment following lines
        // require(
        //     _goal >= 100000 && _goal <= 1000000000,
        //     "The goal of campaign must be include range is from 100.000 to 1.000.000.000 tokens"
        // );
        require(
            _goal >= 1000 && _goal <= 1000000000,
            "Campaign's goal must be include range is from 1000 to 1.000.000.000 tokens"
        );

        require(
            id.isVerified(msg.sender),
            "You must be register identity and be accepted"
        );

        // To testing, you can comment following lines
        //require(
        //    _days >= 15,
        //    "The minimum fundraising time for the campaign is 15 days."
        //);

        CampaignInfo memory temp;
        temp.ref = _ref;
        temp.hashIntegrity = _hash;
        temp.owner = msg.sender;
        temp.startDate = now;
        temp.endDate = now + _deadline;
        temp.goal = _goal;
        temp.collected = 0;
        temp.finstt = FinStatus.pending; //In current Testing, default set Finacial Status is Accepted
        campaigns.push(temp);
        
        if (_numStage > 1) {
            if (_amountStages.length != _numStage) {
                revert('number element amount stage is invalid');
            }
            if (_mode >= Disbursement.Mode.TimingFlexible && _timeStages.length != _numStage) {
                revert('Number of deadline is invalid');
            }
            uint sumOfAmount;
            uint[] memory timeStages = new uint[](_numStage);
            for (uint i = 0; i < _numStage; i++) {
                sumOfAmount += _amountStages[i];
                if (_mode >= Disbursement.Mode.TimingFlexible) {
                    if (i == 0) {
                        timeStages[0] = temp.endDate;
                    } else {
                        timeStages[i] = timeStages[i-1] + _timeStages[i];
                    }
                }
            }
            if (sumOfAmount != _goal) {
                revert('Sum of amount must be equal goal');
            }

            disb.create(
                length()-1,
                _numStage,
                _amountStages,
                _mode,
                timeStages
            );
        }

        emit Added(campaigns.length - 1);
    }

    /// @notice Count how many people invested into a campaign
    /// @param _i is index of campaign
    /// @return Number of investors of a campaign
    function getNumberOfInvestors(uint _i) public view returns(uint result) {
        result = campaigns[_i].investors.length;
    }

    /// @notice Accept a campaign is allow all investor can invest to that campaign
    /// @param _i is index of campaigns array
    /// @param _isAccept is variable used for decide a campaign be allowed transact
    function acceptCampaign(uint _i, bool _isAccept) public {
        require(
            id.isVerifier(msg.sender),
            "You MUST be verifier");
        campaigns[_i].finstt = _isAccept ? FinStatus.accepted : FinStatus.rejected;
        emit Accepted(_i);
    }

    /// @notice Allow user can buy token of campaign
    /// @param _i is index of campaigns array
    /// @param _token is amount of token that you buy
    /// function will call token.fundToCampaign to verify
    function invest(uint _i, uint _token) public {
        CampaignInfo memory campaign = campaigns[_i];
        require(
            _token > 0,
            "amount of token must be greater than zero"
        );
        require(
            now <= campaign.endDate,
            "Campaign is ended"
        );
        require(
            campaign.collected < campaign.goal,
            "Campaign is reached goal"
        );
        require(
            campaign.collected + _token <= campaign.goal,
            "Amount without goal of campaign"
        );
        require(
            campaigns[_i].finstt == FinStatus.accepted,
            "This campaign MUST be accepted and NOT paid"
        );
        require(
            _token <= (token.balances(msg.sender) - getTotalInvest(msg.sender)),
            "You don't have enough token");

        campaigns[_i].investment[msg.sender] = campaigns[_i].investment[msg.sender].add(_token);
        if (!campaigns[_i].isInvest[msg.sender]) {
            investors[msg.sender].push(_i);
            campaigns[_i].isInvest[msg.sender] = true;
            campaigns[_i].investors.push(msg.sender);
        }
        campaigns[_i].collected = campaigns[_i].collected.add(_token);
        emit Invested(_i, msg.sender, _token);
    }

    /// @notice Allow investor can claim refund when campaign during
    /// when campaign failed, you don't need claim refund, because it is automatic proccess
    /// @param _i is index of campaigns array
    /// @param _token Amount investor want withdraw
    function claimRefund(uint _i, uint _token) public {
        require(
            _token > 0,
            "amount of token must be greater than zero"
        );
        require(
            campaigns[_i].investment[msg.sender] >= _token,
            "You don't have enough to claim refund"
        );
        require(
            getStatus(_i) == Status.during,
            "You only can claim refund when campaigns during"
        );

        campaigns[_i].investment[msg.sender] = campaigns[_i].investment[msg.sender].sub(_token);
        campaigns[_i].collected = campaigns[_i].collected.sub(_token);
        emit Refund(_i, msg.sender, _token);
    }

    /// @notice Handle after campaign. Only allow campaign owner run this function
    /// @dev If campaign is succeed, fundraiser will receive funds
    /// @param _i is index of campaign array
    function endCampaign(uint _i) public {
        require(
            msg.sender == campaigns[_i].owner,
            "This function MUST be run by owner"
        );
        require(
            getStatus(_i) == Status.succeed,
            "Campaign MUST be succeed"
        );
        require(
            campaigns[_i].finstt == FinStatus.accepted,
            "Campaign MUST be accepted (NOT reject or paid)");

        uint numStage;
        uint amount;

        (numStage, amount) = disb.getWithdrawInfo(_i, campaigns[_i].stage, campaigns[_i].investors.length);
        if (numStage > 1) {
            if (amount > 0) {
                campaigns[_i].stage = campaigns[_i].stage.add(1);
                if(!token.withdrawFromCampaign(_i, msg.sender, amount)) {
                    campaigns[_i].stage = campaigns[_i].stage.sub(1);
                } else {
                    if (campaigns[_i].stage == numStage) {
                        campaigns[_i].finstt = FinStatus.paid;
                    }
                    emit Paid(_i, msg.sender, amount);
                }
            } else {
                revert("Missing condition for withdraw");
            }
        } else {
            // Important: set status PAID before call external function to withdraw
            campaigns[_i].finstt = FinStatus.paid;
            if(!token.withdrawFromCampaign(_i, msg.sender, campaigns[_i].collected)) {
                campaigns[_i].finstt = FinStatus.accepted;
            } else {
                emit Paid(_i, msg.sender, campaigns[_i].collected);
            }
        }
    }

    /// @notice Get token invested for a campaign of investor
    /// @param _i is index of campaigns
    /// @param _addr is address of investor that you want to check
    /// @return Number of token that investor invested for a campaign
    function getInvest(uint _i, address _addr) public view returns(uint) {
        return campaigns[_i].investment[_addr];
    }

    /// @notice Get all amount of investor that invest to campaigns
    /// @dev Get all amount of investor that invested and have checked campaign failed or succeed
    /// If campaign is failed, NOT count that token
    /// @param _addr is address that you want check to amount of invest
    /// @return Number of token that invested all campaigns
    function getTotalInvest(address _addr) public view returns(uint) {
        uint tokens = 0;
        uint[] memory campaignsOf = investors[_addr];
        for (uint i = 0; i < campaignsOf.length; i++) {
            uint campID = campaignsOf[i];
            if (getStatus(campID) != Status.failed) {
                if (campaigns[campID].investment[_addr] > 0) {
                    tokens = tokens.add(campaigns[campID].investment[_addr]);
                }
            }
        }
        return tokens;
    }

    /// @notice Get status of a campaign
    /// @param _i is index of campaigns array
    /// @return {0 => during, 1 => failed, 2 => succeed, 3 => paid}
    function getStatus(uint _i) public view returns(Status) {
        if (now < campaigns[_i].endDate) {
            return Status.during;
        } else {
            if (campaigns[_i].collected < campaigns[_i].goal) {
                return Status.failed;
            } else {
                return Status.succeed;
            }
        }
    }

    /// @notice Get financial status of campaign
    /// @param _i is index of campaign
    /// @return {0 => pending, 1 => accepted, 2 => paid}
    function getFinStatus(uint _i) public view returns(FinStatus) {
        return campaigns[_i].finstt;
    }

    /// @notice Get number of campaigns
    /// @return Number of campaigns
    function length() public view returns(uint) {
        return campaigns.length;
    }

}