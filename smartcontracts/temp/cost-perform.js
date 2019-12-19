const Campaigns = artifacts.require('./Campaigns.sol');
const Wallet = artifacts.require('./Wallet.sol');
const Identity = artifacts.require('./Identity.sol');
const Disbursement = artifacts.require('./Disbursement.sol');
const date = Math.floor(Date.now() / 1000);

// Test all step
contract('Perform cost all functions', accounts => {
    const deployer = accounts[0];
    const verifier = accounts[1];
    const creator = accounts[2];
    const backer = accounts[3];

    let token, camp, id, disb;
    console.log('verifier address: ', verifier);
    // ex: 0x93598a39777ED4B4Af3Ac7429d123Ca3bE9658C5
    console.log('creator address: ', creator);
    // ex: 0x41A418C946Fd3201b7b2b30B367De35b0c54A6ce
    console.log('backer address: ', backer);
    // ex: 0x4F85a23A1cD1F99EE4590Ab58b3e3e0C9d74B44e
    before(async () => {
        id = await Identity.new({
            from: deployer
        });
        camp = await Campaigns.new(id.address, {
            from: deployer
        });
        disb = await Disbursement.new(camp.address, {
            from: deployer
        });
        token = await Wallet.new(camp.address, {
            from: deployer
        });
        await camp.linkOtherContracts.sendTransaction(
            token.address,
            disb.address,
            {
                from: deployer
            }
        );
    });

    it('contract Wallet: function deposit', async () => {
        const price = 10 ** 15; // 0.01 ETH
        const amount = 2000; // 2000 tokens
        await token.deposit({
            from: backer,
            value: amount * price
        });
    });
    it('contract Wallet: function withdraw', async () => {
        await token.withdraw.sendTransaction(
            1000,
            {from: backer}
        );
    });

    it('contract Identity: function addVerifier', async () => {
        await id.addVerifier.sendTransaction(
            verifier,
            'AAAAB3NzaC1yc2EAAAADAQABAAAAgQCDxbho2O3XWhktz4Hwi6/61ltfk/lSCqeXLufvjr6O3wh1++MmTZT+KzcO0azsKsiFJTXL7ynC06Vp1Hp9o0BK3Q/QZTo8jRoP3XX1LBu1CLe7OeOA5P2TO/nz2mWtuxz0b11GmRrjO8YoznizlPiolLkv9hoDBvwTy0JonyJ6+w== ',
            { from: deployer }
        );
    });

    it('contract Identity: function changePubKey', async () => {
        await id.changePubKey.sendTransaction(
            verifier,
            'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMjs5j52lzXN6XX+nZ1jsyaBgzVBsA/JlWVux1zL0pw4GocvqPsZrIKwKsTeQycGdf3azjKRKwMga6g8fPFHO+Ayh+6v33B1h+3ckWu81alwsM+Y9ADpcMret5qH2Mv9rDyWi+lmAYeUAOOosAWfmgc6QJz+psSMtuGKOr08q+1wIDAQAB',
            { from: deployer }
        );
    });

    it('contract Identity: function registerIdentity', async () => {
        //const dob = Math.floor((new Date('1996-04-27T03:24:00')).valueOf() / 1000);
        await id.registerIdentity.sendTransaction(
            'KLTN',
            'UIT-HCM, Linh Trung, Thu Duc, HCM',
            830550240,
            'QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq',
            'frPULs0boASMCqSq1guu+jX636wkY+fzhFSRnFQi9dQuK50yzCobUIGm5b/f7oGDea/NrieB5c883EpWiQdgJlO+0B43jJLAtfSfJ/mlbGX3FUPc6LAQzxlCb5FSh7+Q1E4WIUyFwLwoNdipDYFcpuXxtCsKeepjFHwGFhfupxM=',
            verifier,
            { from: creator }
        );
    });

    it('contract Identity: function verify', async () => {
        await id.verify.sendTransaction(
            creator,
            true,
            { from: verifier }
        );
    });

    it('contract Campaigns: function createCampaign (ONE-STAGE)', async() => {
        await camp.createCampaign.sendTransaction(
            77760000, // deadline 15 days
            1000000, // goal 1000.000 tokens
            1, // num stage
            [], // amount for each stage
            0, // mode for disbursement
            [], // deadline for each stage
            '8f1ef45972ebd8ef45b2410e8a0b399181fed3d929738d2eb96baf470758a97d', // description data reference
            'c2337a3217ffcf3b01398d83577a1c32235ceb4f481b8c7be00a055798e95d36', // hash of description data
            { from: creator }
        );
    });

    it('contract Campaigns: function createCampaign (MULTI-STAGE)', async() => {
        await camp.createCampaign.sendTransaction(
            10, // deadline 3s
            1000, // goal 1.000 tokens
            3, // num stage
            [300, 300, 400], // amount for each stage
            0, // mode for disbursement
            [], // deadline for each stage
            '8f1ef45972ebd8ef45b2410e8a0b399181fed3d929738d2eb96baf470758a97d', // description data reference
            'c2337a3217ffcf3b01398d83577a1c32235ceb4f481b8c7be00a055798e95d36', // hash of description data
            { from: creator }
        );
    });

    it('contract Campaigns: function verifyCampaign', async() => {
        await camp.verifyCampaign(
            1, // ID campaign
            true,
            {from: verifier}
        );
    });

    it('contract Campaigns: function donate', async () => {
        await camp.donate.sendTransaction(
            1,
            1000,
            { from: backer }
        );
    });

    it('contract Campaigns: function claimRefund', async () => {
        await camp.claimRefund.sendTransaction(
            1,
            200,
            { from: backer }
        );
    });

    it('contract Campaigns: function donate (again)', async () => {
        await camp.donate.sendTransaction(
            1,
            200,
            { from: backer }
        );
    });

    it('contract Campaigns: function endCampaign', async() => {
        //console.log('Waiting for reach deadline...');
        const deadline = (await camp.getInfo.call(
            1,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime()));

        await camp.endCampaign.sendTransaction(
            1,
            { from: creator }
        );
    });

    it('contract Disbursement: function vote', async() => {
        await disb.vote.sendTransaction(
            1, //campaign ID
            1, //stage
            true, // decision voting
            {from: backer}
        );
    });

    
})