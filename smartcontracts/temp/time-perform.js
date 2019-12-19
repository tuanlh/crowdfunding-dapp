const Campaigns = artifacts.require('./Campaigns.sol');
const Wallet = artifacts.require('./Wallet.sol');
const Identity = artifacts.require('./Identity.sol');
const Disbursement = artifacts.require('./Disbursement.sol');
const date = Math.floor(Date.now() / 1000);

// Test all step
contract('Perform timing', accounts => {
    const deployer = accounts[0];
    const verifier = accounts[1];
    const creator = accounts[2];
    const backers = accounts[3];
    let token, camp, id, disb;
    const numberOfRequest = 900;
    console.log("Number of request: ", numberOfRequest);
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

    it('Perform deposit function', async () => {
        const price = 10 ** 15; // 0.01 ETH
        const amount = 1; // 1 tokens
        for (let i = 0; i < numberOfRequest; i++) {
            await token.deposit({
                from: backers,
                value: amount * price
            });
        }
    });

    it('Setup identity', async () => {
        await id.addVerifier.sendTransaction(
            verifier,
            'pub key',
            { from: deployer }
        );
        let result = await id.isVerifier.call(verifier, { from: deployer });
        assert.equal(result, true, 'verifier should is verifier');
        const dob = Math.floor((new Date('1996-04-27T03:24:00')).valueOf() / 1000);
        await id.registerIdentity.sendTransaction(
            'Tuan Le',
            'UIT-HCM, Linh Trung, Thu Duc, HCM',
            dob,
            'private data',
            'share key',
            verifier,
            { from: creator }
        );
        result = await id.getIdentity.call(creator, { from: deployer });
        assert.equal(result.name, 'Tuan Le', 'Incorrect name');
        assert.equal(result.located, 'UIT-HCM, Linh Trung, Thu Duc, HCM', 'Incorrect located');
        assert.equal(result.dob, dob, 'Incorrect date of birth');
        assert.equal(result.status, '1', 'Incorrect status');
        assert.equal(result.privData, 'private data', 'Incorrect private data');
        assert.equal(result.shareKey, 'share key', 'Incorrect share key');

        await id.verify.sendTransaction(
            creator,
            true,
            { from: verifier }
        );
        result = await id.isVerified.call(
            creator,
            { from: verifier }
        );
        assert.equal(result, true, 'value return should is true');
    });

    it('Perform createCampaign: one-stage mode', async () => {
        for (let i = 0; i < numberOfRequest; i++) {
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
        }
    });

    it('Perform createCampaign: multi-stage mode', async () => {
        for (let i = 0; i < numberOfRequest; i++) {
            await camp.createCampaign.sendTransaction(
                77760000, // deadline 15 days
                1000000, // goal 1000.000 tokens
                3, // num stage
                [300000, 300000, 400000], // amount for each stage
                2, // mode for disbursement
                [0, 7200, 7200], // deadline for each stage
                '8f1ef45972ebd8ef45b2410e8a0b399181fed3d929738d2eb96baf470758a97d', // description data reference
                'c2337a3217ffcf3b01398d83577a1c32235ceb4f481b8c7be00a055798e95d36', // hash of description data
                { from: creator }
            );
        }
    });

    it('Accept first campaign', async () => {
        await camp.verifyCampaign(
            0,
            true,
            { from: verifier }
        );
        const result = await camp.getInfo.call(
            0,
            { from: deployer }
        );
        assert.equal(result.finStatus, 1, 'Fin Status must be set to Accepted');
    });

    it('Perform donate function', async () => {
        for (let i = 0; i < numberOfRequest; i++) {
            await camp.donate.sendTransaction(
                0, // campaign id
                1, // tokens
                { from: backers }
            );
        }
    });

})