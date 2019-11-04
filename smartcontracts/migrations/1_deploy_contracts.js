const TokenSystem = artifacts.require("./TokenSystem.sol");
const Campaigns = artifacts.require("./Campaigns.sol");
const Identity = artifacts.require("./Identity.sol");
const Disbursement = artifacts.require("./Disbursement.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(Identity);
    await deployer.deploy(Campaigns, Identity.address);
    await deployer.deploy(Disbursement, Campaigns.address);
    await deployer.deploy(TokenSystem, Campaigns.address);

    let instance = await Campaigns.deployed();
    return Promise.all([
      instance.linkOtherContracts(TokenSystem.address, Disbursement.address)
    ]);
  });
}
