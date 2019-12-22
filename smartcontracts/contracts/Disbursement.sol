pragma solidity ^0.5.3;
import {Campaigns} from './Campaigns.sol';

contract Disbursement {
    enum Vote {none, Agree, Disagree}
    enum Mode {Flexible, Fixed, TimingFlexible, TimingFixed}
    struct Data {
        uint numStage;
        uint[] amount;
        uint[] time;
        uint[] agreed;
        uint[] amountAgreed;
        Mode mode;
        mapping(address => mapping(uint => Vote)) voting; // user => stage => Vote
    }

    Campaigns internal camp;
    mapping (uint => Data) internal stages;

    /* -- Constructor -- */
    //
    /// @notice Constructor run only one time
    /// @dev This contract MUST be run after TokenSystem
    /// @param addrCampaign is address of Campaigns contract
    constructor(Campaigns addrCampaign) public {
        camp = addrCampaign;
    }

    /// @notice only some contracts MUST be run
    modifier onlyAllowedContract() {
        require(
            msg.sender == address(camp),
            "Only allow linked contract"
            );
        _;
    }

    /// @notice Create disbursement for campaign
    /// @dev This function must be run by Campaigns contract
    /// @param campID is campaign's id
    /// @param numStage is number of stage
    /// @param amount is array amount for each stages (unit: tokens, sum all must be equal with campaign's goal)
    /// @param mode is MODE for disbursement (type and requirement for withdraw)
    /// @param time is array of time for each stages (unit: seconds, start from campaign's end date). Notice: first element is default with zero
    function create(
        uint campID,
        uint numStage,
        uint[] calldata amount,
        Mode mode,
        uint[] calldata time
        )
    external onlyAllowedContract() {
        stages[campID] = Data(
            numStage,
            amount,
            time,
            new uint[](numStage),
            new uint[](numStage),
            mode
        );
        // Data memory temp;
        // temp.numStage = numStage;
        // temp.amount = amount;
        // temp.mode = mode;
        // temp.time = time;
        // stages[campID] = temp;
        // stages[campID].agreed = new uint[](numStage);
        // stages[campID].amountAgreed = new uint[](numStage);
    }

    /// @notice Return disbursement info of a campaign
    /// @param campID is campaign's id
    /// @return Some info as number of stage, array of amount, mode, array of time, array of number agree voted
    function getInfo(uint campID) external view
    returns (
        uint numStage,
        uint[] memory amount,
        Mode mode,
        uint[] memory time,
        uint[] memory agreed) {
        numStage = stages[campID].numStage;
        amount = stages[campID].amount;
        mode = stages[campID].mode;
        time = stages[campID].time;
        agreed = stages[campID].agreed;
    }

    /// @notice This function for backer to vote for a stage of campaign disbursement
    /// @param campID is campaign's id
    /// @param stage is stage number (start with 1. Stage 0 default withdraw without voting)
    /// @param isAgree is decision for vote (Two options: `true` for agree withdraw, otherwise for disagree)
    function vote(uint campID, uint stage, bool isAgree) external {
        require(
            stage > 0,
            "Stage 0 is default full withdraw without voting"
        );
        require(
            stage < stages[campID].numStage,
            "Stage value is invalid"
        );
        require(
            stages[campID].voting[msg.sender][stage] == Vote.none,
            "You already voted for this stage"
        );
        require(
            camp.getDonation(campID, msg.sender) > 0,
            "You don't have right for this action"
        );

        require(
            !(stages[campID].mode >= Mode.TimingFlexible &&
            now < stages[campID].time[stage]),
            "Don't have enough time to do this action"
        );

        if (isAgree == true) {
            stages[campID].voting[msg.sender][stage] = Vote.Agree;
            stages[campID].agreed[stage] += 1;
            stages[campID].amountAgreed[stage] += camp.getDonation(campID, msg.sender);
        } else {
            stages[campID].voting[msg.sender][stage] = Vote.Disagree;
        }
    }

    /// @notice This function return info about withdraw campaign related with multi-stage disbursement
    /// @dev This function was run by Campaigns contract
    /// @param campID is campaign's id
    /// @param stage is stage number (start with 0)
    /// @param numberOfDonors is number of backers (person that backed to campaign)
    /// @param campCollected is total token that campaign was collected
    /// @return Two values: (1) number of stage; (2) amount for withdraw, if don't meet condition, amount will have value is zero
    function getWithdrawInfo(uint campID, uint stage, uint numberOfDonors, uint campCollected)
    external view returns (
        uint numStage,
        uint amount
    ) {
        if (stages[campID].numStage > 0) {
            numStage = stages[campID].numStage;
            if (stage > 0) {
                uint agreed = stages[campID].agreed[stage];
                uint amountAgreed = stages[campID].amountAgreed[stage];
                uint minAgree = numberOfDonors / 2;
                uint minAmount = campCollected / 2;
                amount = agreed > minAgree && amountAgreed > minAmount ? stages[campID].amount[stage] : 0;
                if (
                    (stages[campID].mode == Mode.Fixed ||
                    stages[campID].mode == Mode.TimingFixed) &&
                    stage > 1 &&
                    stages[campID].agreed[stage-1] <= minAgree &&
                    stages[campID].amountAgreed[stage-1] <= minAmount
                ) {
                    amount = 0;
                }
                if (
                    stages[campID].mode >= Mode.TimingFlexible &&
                    now < stages[campID].time[stage]
                ) {
                    amount = 0;
                }
            } else { // stage 0 is default full withdraw without voting
                amount = stages[campID].amount[0];
            }
        } else {
            numStage = 1;
            amount = 0;
        }

    }
}