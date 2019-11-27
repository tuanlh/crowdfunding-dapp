pragma solidity ^0.5;
import {Campaigns} from './Campaigns.sol';

/// @title This contract store disbursement for each campaigns
/// @author tuanlh
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
    /// @param _camp is address of Campaigns contract
    constructor(Campaigns _camp) public {
        camp = _camp;
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
    /// @param _campID is campaign's id
    /// @param _numStage is number of stage
    /// @param _amount is array amount for each stages (unit: tokens, sum all must be equal with campaign's goal)
    /// @param _mode is MODE for disbursement (type and requirement for withdraw)
    /// @param _time is array of time for each stages (unit: seconds, start from campaign's end date). Notice: first element is default with zero
    function create(
        uint _campID,
        uint _numStage,
        uint[] calldata _amount,
        Mode _mode,
        uint[] calldata _time
        )
    external onlyAllowedContract() {
        Data memory temp;
        temp.numStage = _numStage;
        temp.amount = _amount;
        temp.mode = _mode;
        temp.time = _time;
        stages[_campID] = temp;
        stages[_campID].agreed = new uint[](_numStage);
        stages[_campID].amountAgreed = new uint[](_numStage);
    }

    /// @notice Return disbursement info of a campaign
    /// @param _campID is campaign's id
    /// @return Some info as number of stage, array of amount, mode, array of time, array of number agree voted
    function getInfo(uint _campID) external view
    returns (
        uint numStage,
        uint[] memory amount,
        Mode mode,
        uint[] memory time,
        uint[] memory agreed) {
        numStage = stages[_campID].numStage;
        amount = stages[_campID].amount;
        mode = stages[_campID].mode;
        time = stages[_campID].time;
        agreed = stages[_campID].agreed;
    }

    /// @notice This function for backer to vote for a stage of campaign disbursement
    /// @param _campID is campaign's id
    /// @param _stage is stage number (start with 1. Stage 0 default withdraw without voting)
    /// @param _decision is decision for vote (Two options: `true` for agree withdraw, otherwise for disagree)
    function vote(uint _campID, uint _stage, bool _decision) external {
        require(
            _stage > 0,
            "Stage 0 is default full withdraw without voting"
        );
        require(
            _stage < stages[_campID].numStage,
            "Stage value is invalid"
        );
        require(
            stages[_campID].voting[msg.sender][_stage] == Vote.none,
            "You already voted for this stage"
        );
        require(
            camp.getDonation(_campID, msg.sender) > 0,
            "You don't have right for this action"
        );

        require(
            !(stages[_campID].mode >= Mode.TimingFlexible &&
            now < stages[_campID].time[_stage]),
            "Don't have enough time to do this action"
        );

        if (_decision == true) {
            stages[_campID].voting[msg.sender][_stage] = Vote.Agree;
            stages[_campID].agreed[_stage] += 1;
            stages[_campID].amountAgreed[_stage] += camp.getDonation(_campID, msg.sender);
        } else {
            stages[_campID].voting[msg.sender][_stage] = Vote.Disagree;
        }
    }

    /// @notice This function return info about withdraw campaign related with multi-stage disbursement
    /// @dev This function was run by Campaigns contract
    /// @param _campID is campaign's id
    /// @param _stage is stage number (start with 0)
    /// @param _numUser is number of backers (person that backed to campaign)
    /// @return Two values: (1) number of stage; (2) amount for withdraw, if don't meet condition, amount will have value is zero
    function getWithdrawInfo(uint _campID, uint _stage, uint _numUser, uint _collected)
    external view returns (
        uint numStage,
        uint amount
    ) {
        if (stages[_campID].numStage > 0) {
            numStage = stages[_campID].numStage;
            if (_stage > 0) {
                uint agreed = stages[_campID].agreed[_stage];
                uint amountAgreed = stages[_campID].amountAgreed[_stage];
                uint minAgree = _numUser / 2;
                uint minAmount = _collected / 2;
                amount = agreed > minAgree && amountAgreed > minAmount ? stages[_campID].amount[_stage] : 0;
                if (
                    (stages[_campID].mode == Mode.Fixed ||
                    stages[_campID].mode == Mode.TimingFixed) &&
                    _stage > 1 &&
                    stages[_campID].agreed[_stage-1] <= minAgree &&
                    stages[_campID].amountAgreed[_stage-1] <= minAmount
                ) {
                    amount = 0;
                }
                if (
                    stages[_campID].mode >= Mode.TimingFlexible &&
                    now < stages[_campID].time[_stage]
                ) {
                    amount = 0;
                }
            } else { // stage 0 is default full withdraw without voting
                amount = stages[_campID].amount[0];
            }
        } else {
            numStage = 1;
            amount = 0;
        }

    }
}