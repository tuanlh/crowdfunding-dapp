pragma solidity ^0.5.3;
import {SafeMath} from "./SafeMath.sol";
import {Wallet} from "./Wallet.sol";
import {Identity} from "./Identity.sol";
import {Disbursement} from "./Disbursement.sol";

/// @title This contract store info about campaigns
/// @author tuanlh
contract Campaigns {
    Wallet internal token;
    Identity internal id;
    Disbursement internal disb;
    using SafeMath for uint;

    /* Explaintation of campaign status
    * During: end date < now
    * Failed: end date >= now AND token collected < goal
    * Succeed: end date >= now AND token collected >= goal
    */
    enum Status {during, failed, succeed}

    /* Explaintation of campaign FINACIAL status
    * Pending: new campaign just added. NOT allow donor fund to campaign
    * Accepted: a campaign was verified => Allow donors fund to campaign
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
        string ref; // store reference to other info as name, description on db
        string hashIntegrity; // hash of data store in server
        address[] donors;
        mapping(address => uint) donation;
        mapping(address => bool) isDonate;
        
    }

    CampaignInfo[] internal campaigns;
    mapping(address => uint[]) internal donor2campaigns; //mapping donors to campaigns id
    address internal deployer;
    event Added(uint id);
    event Accepted(uint id);
    event Donated(uint id, address donor, uint token);
    event Refund(uint id, address donor, uint token);
    event Paid(uint id, address ownerCampaign, uint token);

    /* -- Constructor -- */
    //
    /// @notice Constructor to create a campaign contract
    /// @dev This contract MUST be run after Wallet
    /// @param addrIdentity is address of Identity contract
    constructor(Identity addrIdentity) public {
        deployer = msg.sender;
        id = addrIdentity;
    }

    /// @notice Update address of other contracts
    /// @param addrWallet is address of Wallet contract
    /// @param addrDisb is address of Disbursement contract
    function linkOtherContracts(Wallet addrWallet, Disbursement addrDisb) external {
        require(
            msg.sender == deployer,
            "Only deployer"
        );
        token = addrWallet;
        disb = addrDisb;
    }

    /// @notice Get properties of a campaign
    /// @param i is index of campaigns array
    /// @return object {startDate, endDate, goal, collected, owner, finStatus, status, ref}
    function getInfo(uint i) external view
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
        ref = campaigns[i].ref;
        hashIntegrity = campaigns[i].hashIntegrity;
        startDate = campaigns[i].startDate;
        endDate = campaigns[i].endDate;
        goal = campaigns[i].goal;
        collected = campaigns[i].collected;
        owner = campaigns[i].owner;
        finStatus = campaigns[i].finstt;
        status = getStatus(i);
    }

    /// @notice Create a campaign
    /// @dev Add an element to variable campaigns array
    /// @param deadline is deadline for fundraising of a campaign. (unit: seconds)
    /// @param goal is goal of a campaign. Min-Max: 100.000-1.000.000.000
    /// @param numStage is number of stage withdraw campaign
    /// @param amountStages is amount of each stage withdraw campaign
    /// @param mode is mode for disburse campaign
    /// @param timeStages is deadline for each stage withdraw campaign
    /// @param ref is campaign reference to other information about campaign
    /// @param hashData is hash of data will store in db server, to check integrity
    function createCampaign(
        uint deadline,
        uint goal,
        uint numStage,
        uint[] calldata amountStages,
        Disbursement.Mode mode,
        uint[] calldata timeStages,
        string calldata ref,
        string calldata hashData
        )
    external {
        // To testing, you can comment following lines
        // require(
        //     _goal >= 100000 && _goal <= 1000000000,
        //     "The goal of campaign must be include range is from 100.000 to 1.000.000.000 tokens"
        // );
        require(
            goal >= 1000 && goal <= 1e9,
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
        
        campaigns.push(CampaignInfo(
            msg.sender,
            now,
            now + deadline,
            goal,
            0,
            0,
            FinStatus.pending,
            ref,
            hashData,
            new address[](0)
        ));

        // CampaignInfo memory temp;
        // temp.ref = ref;
        // temp.hashIntegrity = hashData;
        // temp.owner = msg.sender;
        // temp.startDate = now;
        // temp.endDate = now + deadline;
        // temp.goal = goal;
        // temp.collected = 0;
        // temp.finstt = FinStatus.pending; //In current Testing, default set Finacial Status is Accepted
        // campaigns.push(temp);
        if (numStage > 1) {
            if (amountStages.length != numStage) {
                revert('number element amount stage is invalid');
            }
            if (mode >= Disbursement.Mode.TimingFlexible && timeStages.length != numStage) {
                revert('Number of deadline is invalid');
            }
            uint sumOfAmount;
            uint[] memory times = new uint[](numStage);
            for (uint i = 0; i < numStage; i++) {
                sumOfAmount += amountStages[i];
                if (mode >= Disbursement.Mode.TimingFlexible) {
                    if (i == 0) {
                        times[0] = now + deadline;
                    } else {
                        times[i] = times[i-1] + timeStages[i];
                    }
                }
            }
            if (sumOfAmount != goal) {
                revert('Sum of amount must be equal goal');
            }

            disb.create(
                campaigns.length-1,
                numStage,
                amountStages,
                mode,
                times
            );
        }

        emit Added(campaigns.length - 1);
    }

    /// @notice Count how many people donated into a campaign
    /// @param i is index of campaign
    /// @return Number of donors of a campaign
    function getNumberOfDonors(uint i) external view returns(uint) {
        return campaigns[i].donors.length;
    }

    /// @notice Determine a campaign is allow all donor can invest to that campaign
    /// @param i is index of campaigns array
    /// @param isAccept is variable used for decide a campaign be allowed transact
    function verifyCampaign(uint i, bool isAccept) external {
        require(
            id.isVerifier(msg.sender),
            "You MUST be verifier");
        campaigns[i].finstt = isAccept ? FinStatus.accepted : FinStatus.rejected;
        emit Accepted(i);
    }

    /// @notice Allow donor can donate to a campaign
    /// @param i is index of campaigns array
    /// @param amount is amount of token that you want to donate
    function donate(uint i, uint amount) external {
        CampaignInfo memory campaign = campaigns[i];
        require(
            amount > 0,
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
            campaign.collected + amount <= campaign.goal,
            "Amount without goal of campaign"
        );
        require(
            campaigns[i].finstt == FinStatus.accepted,
            "This campaign MUST be accepted and NOT paid"
        );
        require(
            amount <= (token.balances(msg.sender) - getAllDonation(msg.sender)),
            "You don't have enough token");

        campaigns[i].donation[msg.sender] = campaigns[i].donation[msg.sender].add(amount);
        if (!campaigns[i].isDonate[msg.sender]) {
            donor2campaigns[msg.sender].push(i);
            campaigns[i].isDonate[msg.sender] = true;
            campaigns[i].donors.push(msg.sender);
        }
        campaigns[i].collected = campaigns[i].collected.add(amount);
        emit Donated(i, msg.sender, amount);
    }

    /// @notice Allow donor can claim refund when campaign during
    /// when campaign failed, you don't need claim refund, because it is automatic proccess
    /// @param i is index of campaigns array
    /// @param amount Amount donor want withdraw
    function claimRefund(uint i, uint amount) external {
        require(
            amount > 0,
            "amount of token must be greater than zero"
        );
        require(
            campaigns[i].donation[msg.sender] >= amount,
            "You don't have enough to claim refund"
        );
        require(
            getStatus(i) == Status.during,
            "You only can claim refund when campaigns during"
        );

        campaigns[i].donation[msg.sender] -= amount;
        campaigns[i].collected -= amount;
        emit Refund(i, msg.sender, amount);
    }

    /// @notice Handle after campaign. Only allow campaign's owner run this function
    /// @dev If campaign is succeed, campaign's owner will receive funds
    /// @param i is index of campaign array
    function endCampaign(uint i) external {
        require(
            msg.sender == campaigns[i].owner,
            "This function MUST be run by owner"
        );
        require(
            getStatus(i) == Status.succeed,
            "Campaign MUST be succeed"
        );
        require(
            campaigns[i].finstt == FinStatus.accepted,
            "Campaign MUST be accepted (NOT reject or paid)");

        uint numStage = 1;
        uint amount = 0;
        bool isCompleted = false;
        (numStage, amount) = disb.getWithdrawInfo(
                i,
                campaigns[i].stage,
                campaigns[i].donors.length,
                campaigns[i].collected
            );
        if (numStage > 1) {
            if (amount > 0) {
                campaigns[i].stage += 1;
                if (campaigns[i].stage == numStage) {
                    isCompleted = true;
                }
            } else {
                revert("Missing condition for withdraw");
            }
        } else {
            // Important: set status PAID before call external function to withdraw
            isCompleted = true;
            amount = campaigns[i].collected;
        }

        if (amount > 0) {
            if (isCompleted) {
                campaigns[i].finstt = FinStatus.paid;
            }
            emit Paid(i, msg.sender, amount);
            if(!token.addToken(msg.sender, amount)) {
                if (isCompleted) {
                    campaigns[i].finstt = FinStatus.accepted;
                }
                if (numStage > 1) {
                    campaigns[i].stage -= 1;
                }
            }
        }
    }

    /// @notice Get token donated for a campaign of donor
    /// @param i is index of campaigns
    /// @param donor is address of donor that you want to check
    /// @return Number of token that donor donated for a campaign
    function getDonation(uint i, address donor) external view returns(uint) {
        return campaigns[i].donation[donor];
    }

    /// @notice Get all amount of donor that invest to campaigns
    /// @dev Get all amount of donor that donated and have checked campaign failed or succeed
    /// If campaign is failed, NOT count that token
    /// @param donor is address that you want check to amount of invest
    /// @return Number of token that donated all campaigns
    function getAllDonation(address donor) public view returns(uint) {
        uint tokens = 0;
        uint[] memory campaignsOf = donor2campaigns[donor];
        for (uint i = 0; i < campaignsOf.length; i++) {
            uint campID = campaignsOf[i];
            if (getStatus(campID) != Status.failed) {
                if (campaigns[campID].donation[donor] > 0) {
                    tokens += campaigns[campID].donation[donor];
                }
            }
        }
        return tokens;
    }

    /// @notice Get list of campaign that donor donated
    /// @param donor is address of donor
    /// @return Array of campaign's id
    function getCampaignList(address donor) external view returns(uint[] memory) {
        return donor2campaigns[donor];
    }

    /// @notice Get status of a campaign
    /// @param i is index of campaigns array
    /// @return {0 => during, 1 => failed, 2 => succeed, 3 => paid}
    function getStatus(uint i) public view returns(Status) {
        if (now < campaigns[i].endDate) {
            return Status.during;
        } else {
            if (campaigns[i].collected < campaigns[i].goal) {
                return Status.failed;
            } else {
                return Status.succeed;
            }
        }
    }

    /// @notice Get financial status of campaign
    /// @param i is index of campaign
    /// @return {0 => pending, 1 => accepted, 2 => paid}
    function getFinStatus(uint i) external view returns(FinStatus) {
        return campaigns[i].finstt;
    }

    /// @notice Get number of campaigns
    /// @return Number of campaigns
    function length() external view returns(uint) {
        return campaigns.length;
    }

}