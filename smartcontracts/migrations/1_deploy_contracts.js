const TokenSystem = artifacts.require("./TokenSystem.sol");
const Campaigns = artifacts.require("./Campaigns.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(TokenSystem);
    await deployer.deploy(Campaigns, TokenSystem.address);

    let instance = await TokenSystem.deployed();
    return Promise.all([
      instance.updateCampaignAddr(Campaigns.address)
    ])
  })
}
