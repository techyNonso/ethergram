var Ethergram = artifacts.require("./Ethergram.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Ethergram);
};
