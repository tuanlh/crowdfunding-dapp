const TokenSystem = artifacts.require("./TokenSystem.sol");
const Campaigns = artifacts.require("./Campaigns.sol");

/* module.exports = function (deployer) {
  deployer.deploy(TokenSystem).then(() => {
    return deployer.deploy(Campaigns, TokenSystem.address);
    }).then(() => {
      Campaigns.deployed().then(instance => {
        instance.updateCampaignAddr(instance.address, {gas: 50000});
      })
    });
}; */

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
