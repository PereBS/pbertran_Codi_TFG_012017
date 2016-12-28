//MECENATGE

pragma solidity ^0.4.2;
contract token { function transfer(address receiver, uint amount){  } }

contract Mecenatge {
    address public beneficiary;
    uint public fundingGoal; uint public amountRaised; uint public deadline; uint public price;
    token public tokenReward;
    mapping(uint256 => Funder) public funders;
    bool fundingGoalReached = false;
    event GoalReached(address beneficiary, uint amountRaised);
    event FundTransfer(address backer, uint amount, bool isContribution);
    bool crowdsaleClosed = false;
	uint public numFunders;

    /* data structure to hold information about campaign contributors */
    struct Funder {
        address addr;
        uint amount;
    }
    /*  at initialization, setup the owner */
    function Mecenatge(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint durationInMinutes,
        uint etherCostOfEachToken,
        token addressOfTokenUsedAsReward
    ) {
        beneficiary = ifSuccessfulSendTo;
        fundingGoal = fundingGoalInEthers * 1 ether;
        deadline = now + durationInMinutes * 1 minutes;
        price = etherCostOfEachToken * 1 ether;
        tokenReward = token(addressOfTokenUsedAsReward);
    }

    /* The function without name is the default function that is called whenever anyone sends funds to a contract */
    function ()  {
        if (crowdsaleClosed) throw;
        uint amount = msg.value;
        Funder c= funders[numFunders++];
		c.addr = msg.sender;
		c.amount = msg.value;
        amountRaised += amount;
        tokenReward.transfer(msg.sender, amount / price);
        FundTransfer(msg.sender, amount, true);
    }

    modifier afterDeadline() { if (now >= deadline) _; }

    /* checks if the goal or time limit has been reached and ends the campaign */
    function checkGoalReached() afterDeadline {
        if (amountRaised >= fundingGoal){
            fundingGoalReached = true;
			if(beneficiary.send(amountRaised)){
            FundTransfer(beneficiary, amountRaised, false);}
			amountRaised = 0;
        }else{
			  for (uint i = 0; i < numFunders; ++i) {
              if(funders[i].addr.send(funders[i].amount)){  
              FundTransfer(funders[i].addr, funders[i].amount, false);}
            } 
		}
        crowdsaleClosed = true;
    }
}