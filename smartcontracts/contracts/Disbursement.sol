pragma solidity ^0.5;
import {Campaigns} from './Campaigns.sol';

contract Disbursement {
    enum Vote {none, Agree, Disagree}
    enum Mode {Flexible, Fixed, TimingFlexible, TimingFixed}
    struct Data {
        uint numStage;
        uint[] amount;
        uint[] time;
        uint[] agreed;
        Mode mode;
        mapping(address => mapping(uint => Vote)) voting; // user => stage => Vote
    }

    Campaigns camp;
    mapping (uint => Data) stages;
    constructor(Campaigns _camp) public {
        camp = _camp;
    }

    modifier onlyAllowedContract() {
        require(
            msg.sender == address(camp),
            "Only allow linked contract"
            );
        _;
    }

    /// @notice create disbursement for campaign id
    /// @param _campID is id of campaign
    /// @param _numStage is number of stages
    /// @param _amount is amount of money for each stages
    function create(
        uint _campID,
        uint _numStage,
        uint[] memory _amount,
        Mode _mode,
        uint[] memory _time
        )
     public onlyAllowedContract() {
        Data memory temp;
        temp.numStage = _numStage;
        temp.amount = _amount;
        temp.mode = _mode;
        temp.time = _time;
        stages[_campID] = temp;
        stages[_campID].agreed.length = _numStage;
    }

    function getInfo(uint _campID) public view
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

    function vote(uint _campID, uint _stage, bool _decision) public {
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
            camp.getInvest(_campID, msg.sender) > 0,
            "You don't have right for this action"
        );

        if (
            stages[_campID].mode >= Mode.TimingFlexible &&
            now < stages[_campID].time[_stage]
        ) {
            revert("Don't have enough time to do this action");
        }

        if (_decision == true) {
            stages[_campID].voting[msg.sender][_stage] = Vote.Agree;
            stages[_campID].agreed[_stage] += 1;
        } else {
            stages[_campID].voting[msg.sender][_stage] = Vote.Disagree;
        }
    }

    function getWithdrawInfo(uint _campID, uint _stage, uint _numUser)
    public view returns (
        uint numStage,
        uint amount
    ) {
        if (stages[_campID].numStage > 0) {
            numStage = stages[_campID].numStage;
            if (_stage > 0) {
                uint agreed = stages[_campID].agreed[_stage];
                uint minAgree = _numUser / 2;
                amount = agreed > minAgree ? stages[_campID].amount[_stage] : 0;
                if (
                    (stages[_campID].mode == Mode.Fixed ||
                    stages[_campID].mode == Mode.TimingFixed) &&
                    _stage > 1 &&
                    stages[_campID].agreed[_stage-1] <= minAgree
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