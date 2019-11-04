const Campaigns = artifacts.require('./Campaigns.sol');
const TokenSystem = artifacts.require('./TokenSystem.sol');
const Identity = artifacts.require('./Identity.sol');
const Disbursement = artifacts.require('./Disbursement.sol');
const date = Math.floor(Date.now() / 1000);

// Test all step
contract('Campaign - one stage disbursement', accounts => {
    const deployer = accounts[0];
    const verifier = accounts[1];
    const creator = accounts[2];
    const backers = accounts.slice(8, 10);
    let token, camp, id, disb;
    let campID;
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
        token = await TokenSystem.new(camp.address, {
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

    it('Deposit wallet: 2 accounts with 1000 tokens / account', async () => {
        const price = 10 ** 15; // 0.01 ETH
        const amount = 1000; // 1000 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getMyBalance.call({ from: backers[i] });
            await token.deposit({
                from: backers[i],
                value: amount * price
            });
            const lastBalance = await token.getMyBalance.call({ from: backers[i] });
            assert.equal(lastBalance - prevBalance, amount, 'Balance is incorrect');
        }
    });

    it('Add verifier', async () => {
        await id.addVerifier.sendTransaction(
            verifier,
            'pub key',
            { from: deployer }
        );
        const result = await id.isVerifier.call(verifier, { from: deployer });
        assert.equal(result, true, 'verifier should is verifier');
    });

    it('Register identity', async () => {
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
        const result = await id.getIdentity.call(creator, { from: deployer });
        assert.equal(result.name, 'Tuan Le', 'Incorrect name');
        assert.equal(result.located, 'UIT-HCM, Linh Trung, Thu Duc, HCM', 'Incorrect located');
        assert.equal(result.dob, dob, 'Incorrect date of birth');
        assert.equal(result.status, '1', 'Incorrect status');
        assert.equal(result.privData, 'private data', 'Incorrect private data');
        assert.equal(result.shareKey, 'share key', 'Incorrect share key');
    });

    it('Verify an identity', async () => {
        await id.verify.sendTransaction(
            creator,
            true,
            { from: verifier }
        );
        const result = await id.isVerified.call(
            creator,
            { from: verifier }
        );
        assert.equal(result, true, 'value return should is true');
    });

    it('Create first campaign', async () => {
        const expectedDeadline = 3; // 3 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1000; // 1000 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            1, // num stage
            [], // amount for each stage
            0, // mode for disbursement
            [], // deadline for each stage
            expectedData,
            expectedHash,
            { from: creator }
        );
        // check result
        campID = await camp.length.call({ from: deployer }) - 1;
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.goal, expectedGoal, 'Goal value is incorrect');
        assert.equal(result.collected, 0, 'Collected is must be zero');
        assert.equal(result.owner, creator, 'Owner address is incorrect');
        assert.equal(result.finStatus, 0, 'FinStatus is incorrect');
        assert.equal(result.status, 0, 'Status campaign is incorrect');
        assert.equal(result.ref, expectedData, 'Reference data is incorrect');
        assert.equal(result.hashIntegrity, expectedHash, 'Hash data is incorrect');
        assert.isTrue(result.endDate >= expectedExpire, 'End data is incorrect');
    });

    it('Accept campaign after create', async() => {
        await camp.acceptCampaign(
            campID,
            true,
            {from: verifier}
        );
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.finStatus, 1, 'Fin Status must be set to Accepted');
    });

    it('Back to first campaign (succeed campaign)', async () => {
        const amount = 500; // 500 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getMyBalance.call({ from: backers[i] });
            await camp.invest.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getMyBalance.call({ from: backers[i] });
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('Withdraw from a campaign', async () => {
        console.log('Waiting for reach deadline...');
        const info = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        const deadline = info.endDate * 1000;
        while (deadline >= (new Date().getTime())); //waiting for reach deadline

        const prevBalance = await token.getMyBalance.call({ from: creator });
        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );
        const lastBalance = await token.getMyBalance.call({ from: creator });
        
        assert.equal(lastBalance-prevBalance, parseInt(info.collected), 'Balance is incorrect');
    });

    it('Withdraw from Token to ETH', async() => {
        const prevETH = await web3.eth.getBalance(creator);
        const transaction = await token.withdraw.sendTransaction(
            1000,
            {from: creator}
        );

        const tx = await web3.eth.getTransaction(transaction.tx);
        const gasCost = tx.gasPrice * transaction.receipt.gasUsed;
        const balance = await token.getMyBalance.call(
            { from: creator }
        );
        assert.equal(balance, 0, 'Balance is incorrect');
        const lastETH = await web3.eth.getBalance(creator);
        const receiveETH = 10**18 - gasCost + 2000;
        assert.equal(lastETH - prevETH, receiveETH, "Incorrect ETH");
    });

    it('Create second campaign (failed campaign)', async () => {
        const expectedDeadline = 3; // 5 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1000; // 1.000 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            1, // num stage
            [], // amount for each stage
            0, // mode for disbursement
            [], // deadline for each stage
            expectedData,
            expectedHash,
            { from: creator }
        );
        // check result
        campID = await camp.length.call({ from: deployer }) - 1;
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.goal, expectedGoal, 'Goal value is incorrect');
        assert.equal(result.collected, 0, 'Collected is must be zero');
        assert.equal(result.owner, creator, 'Owner address is incorrect');
        assert.equal(result.finStatus, 0, 'FinStatus is incorrect');
        assert.equal(result.status, 0, 'Status campaign is incorrect');
        assert.equal(result.ref, expectedData, 'Reference data is incorrect');
        assert.equal(result.hashIntegrity, expectedHash, 'Hash data is incorrect');
        assert.isTrue(result.endDate >= expectedExpire, 'End data is incorrect');
    });

    it('Accept campaign after create', async() => {
        await camp.acceptCampaign(
            campID,
            true,
            {from: verifier}
        );
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.finStatus, 1, 'Fin Status must be set to Accepted');
    });

    it('Back to second campaign', async () => {
        const amount = 400; // 400 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getMyBalance.call({ from: backers[i] });
            await camp.invest.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getMyBalance.call({ from: backers[i] });
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('Checking auto refund', async () => {
        console.log('Waiting for reach deadline...');
        let prevBalances = [];
        let amounts = [];
        for (let i = 0; i < backers.length; i++) {
            prevBalances[i] = await token.getMyBalance.call({ from: backers[i] });
            amounts[i] = await camp.getInvest(
                campID,
                backers[i],
                {from: backers[i]}
            );
        }
        const deadline = (await camp.getInfo.call(
            campID,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime())); //waiting for reach deadline

        for (let i = 0; i < backers.length; i++) {
            const lastBalances = await token.getMyBalance.call({ from: backers[i] });
            assert.equal(lastBalances-prevBalances[i], amounts[i], 'Balance is incorrect');
        }
    });
})