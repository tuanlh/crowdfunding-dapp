const Campaigns = artifacts.require('./Campaigns.sol');
const Wallet = artifacts.require('./Wallet.sol');
const Identity = artifacts.require('./Identity.sol');
const Disbursement = artifacts.require('./Disbursement.sol');
const date = Math.floor(Date.now() / 1000);

// Test all step
contract('Campaign - multi stage disbursement', accounts => {
    const deployer = accounts[0];
    const verifier = accounts[1];
    const creator = accounts[2];
    const backers = accounts.slice(3, 8);

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

    it('Deposit wallet: 5 accounts with 1200 tokens / account', async () => {
        const price = 10 ** 15; // 0.01 ETH
        const amount = 1200; // 1000 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            await token.deposit({
                from: backers[i],
                value: amount * price
            });
            const lastBalance = await token.getBalance.call(backers[i], { from: backers[i] });
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
        const result2 = await id.isVerifier.call(backers[0], { from: deployer });
        assert.equal(result2, false, 'Backer should is normal user');
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
        assert.equal(result, true, 'Value return should is true');
    });

    it('Create first campaign: multi stages (MODE 1)', async () => {
        const expectedDeadline = 3; // 3 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1500; // 1.500 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';
        const expectedStage = 3;
        const expectedAmountStage = [300, 500, 700];
        const expectedModeStage = 0;
        const expectedDeadlineStage = [];

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            expectedStage,
            expectedAmountStage,
            expectedModeStage,
            expectedDeadlineStage,
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
        await camp.verifyCampaign(
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

    it('Checking disbursement: should throw error on sum amount stage not equal with goal', async () => {
        try {
            await camp.createCampaign.sendTransaction(
                3, // deadline (seconds)
                10000, // goal (tokens)
                3, // num stage
                [1000, 5000, 3000], // amount for each stage (tokens)
                0, // is timing stage
                [], // deadline for each stage
                'data',
                'hash',
                { from: creator }
            );
            assert.fail(true, false, 'The function should throw error');
        } catch(err) {
            assert.include( 
                String(err),
                'Sum of amount must be equal goal',
                'throw different error'
            )
        }
    });

    it('Back to first campaign', async () => {
        const amount = 300; // 300 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            await camp.donate.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('1st campaign: Withdraw stage 0', async() => {
        console.log('Waiting for reach deadline...');
        const deadline = (await camp.getInfo.call(
            campID,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime()));

        const prevBalance = await token.getBalance.call(creator, { from: creator });

        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];
        
        assert.equal(lastBalance-prevBalance, parseInt(amount[0]), 'Balance is incorrect');
    });

    it('1st campaign: Voting for stage 1 (3/5 agree)', async() => {
        const stage = 1;
        const decision = [true, true, true, false, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))["agreed"][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('1st campaign: Withdraw stage 1', async() => {
        const prevBalance = await token.getBalance.call(creator, { from: creator });
        
        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];

        assert.equal(lastBalance-prevBalance, parseInt(amount[1]), 'Balance is incorrect');
    });

    it('1st campaign: Checking withdraw stage 2 without voting', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('1st campaign: Voting for stage 2 (2/5 agree)', async() => {
        const stage = 2;
        const decision = [true, true, false, false, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))["agreed"][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('1st campaign: Withdraw stage 2 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('Create second campaign: multi stages (MODE 2)', async () => {
        const expectedDeadline = 3; // 3 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1500; // 1.500 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';
        const expectedStage = 3;
        const expectedAmountStage = [300, 500, 700];
        const expectedModeStage = 1;
        const expectedDeadlineStage = [];

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            expectedStage,
            expectedAmountStage,
            expectedModeStage,
            expectedDeadlineStage,
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
        await camp.verifyCampaign(
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
        const amount = 300; // 300 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            await camp.donate.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('2nd campaign: Withdraw stage 0', async() => {
        console.log('Waiting for reach deadline...');
        const deadline = (await camp.getInfo.call(
            campID,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime()));

        const prevBalance = await token.getBalance.call(creator, { from: creator });

        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];
        
        assert.equal(lastBalance-prevBalance, parseInt(amount[0]), 'Balance is incorrect');
    });

    it('2nd campaign: Voting for stage 1 (2/5 agree)', async() => {
        const stage = 1;
        const decision = [true, true, false, false, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))["agreed"][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('2nd campaign: Withdraw stage 1 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('2nd campaign: Checking withdraw stage 2 without voting', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('2nd campaign: Voting for stage 2 (5/5 agree)', async() => {
        const stage = 2;
        const decision = [true, true, true, true, true];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))["agreed"][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('2nd campaign: Withdraw stage 2 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('Create third campaign: multi stages (MODE 3)', async () => {
        const expectedDeadline = 3; // 3 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1500; // 1.500 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';
        const expectedStage = 3;
        const expectedAmountStage = [300, 500, 700];
        const expectedModeStage = 2;
        const expectedDeadlineStage = [0, 3, 2]; //stage 1 (3s) | stage 2 (2s)

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            expectedStage,
            expectedAmountStage,
            expectedModeStage,
            expectedDeadlineStage,
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
        await camp.verifyCampaign(
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

    it('Back to third campaign', async () => {
        const amount = 300; // 300 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            
            await camp.donate.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('3rd campaign: Withdraw stage 0', async() => {
        console.log('Waiting for reach deadline...');
        const deadline = (await camp.getInfo.call(
            campID,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime()));

        const prevBalance = await token.getBalance.call(creator, { from: creator });

        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];
        
        assert.equal(lastBalance-prevBalance, parseInt(amount[0]), 'Balance is incorrect');
    });

    it('3rd campaign: Voting for stage 1 => should error before time', async() => {
        const stage = 1;
        const decision = [true, true, false, false, false];
        try {
            for(let i = 0; i < backers.length; i++) {
                await disb.vote.sendTransaction(
                    campID,
                    stage,
                    decision[i],
                    {from: backers[i]}
                );
            }
        } catch(err) {
            assert.include(
                String(err),
                "Don't have enough time to do this action",
                'show differ error'
            );
        } 
    });

    it('3rd campaign: Voting for stage 1 (5/5 agree)', async() => {
        const stage = 1;
        const deadline = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['time'][stage] * 1000;
        
        while (deadline >= (new Date().getTime())); //waiting for reach deadline
        
        const decision = [true, true, true, true, true];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['agreed'][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('3rd campaign: Withdraw stage 1', async() => {
        const prevBalance = await token.getBalance.call(creator, { from: creator });
        
        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];

        assert.equal(lastBalance-prevBalance, parseInt(amount[1]), 'Balance is incorrect');
    });

    it('3rd campaign: Voting for stage 2 => should error before time', async() => {
        const stage = 2;
        const decision = [true, true, false, false, false];
        try {
            for(let i = 0; i < backers.length; i++) {
                await disb.vote.sendTransaction(
                    campID,
                    stage,
                    decision[i],
                    {from: backers[i]}
                );
            }
        } catch(err) {
            assert.include(
                String(err),
                "Don't have enough time to do this action",
                'show differ error'
            );
        } 
    });

    it('3rd campaign: Voting for stage 2 (2/5 agree)', async() => {
        const stage = 2;
        const deadline = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['time'][stage] * 1000;
        
        while (deadline >= (new Date().getTime())); //waiting for reach deadline
        
        const decision = [true, true, false, false, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['agreed'][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('3rd campaign: Withdraw stage 2 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('Create fourth campaign: multi stages (MODE 4)', async () => {
        const expectedDeadline = 4; // 4 seconds for testing
        const expectedExpire = Math.floor(Date.now() / 1000) + expectedDeadline; // now + 15 seconds
        const expectedGoal = 1500; // 1.500 tokens
        const expectedData = 'description';
        const expectedHash = 'hash';
        const expectedStage = 4;
        const expectedAmountStage = [300, 500, 400, 300];
        const expectedModeStage = 3;
        const expectedDeadlineStage = [0, 3, 3, 2]; //stage 1 (3s) | stage 2 (2s)

        await camp.createCampaign.sendTransaction(
            expectedDeadline,
            expectedGoal,
            expectedStage,
            expectedAmountStage,
            expectedModeStage,
            expectedDeadlineStage,
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
        await camp.verifyCampaign(
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

    it('Back to fourth campaign', async () => {
        const amount = 300; // 300 tokens
        for(let i = 0; i < backers.length; i++) {
            const prevBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            
            await camp.donate.sendTransaction(
                campID,
                amount,
                { from: backers[i] }
            );
            const lastBalance = await token.getBalance.call(backers[i], { from: backers[i] });
            
            assert.equal(prevBalance-lastBalance, amount, 'Balance is incorrect');
        }
        
        // check value after back
        const result = await camp.getInfo.call(
            campID,
            { from: deployer }
        );
        assert.equal(result.collected, amount*backers.length, 'Tokens is incorrect');
    });

    it('4th campaign: Withdraw stage 0', async() => {
        console.log('Waiting for reach deadline...');
        const deadline = (await camp.getInfo.call(
            campID,
            { from: deployer }
        ))['endDate'] * 1000;
        while (deadline >= (new Date().getTime()));

        const prevBalance = await token.getBalance.call(creator, { from: creator });

        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];
        
        assert.equal(lastBalance-prevBalance, parseInt(amount[0]), 'Balance is incorrect');
    });

    it('4th campaign: Voting for stage 1 => should error before time', async() => {
        const stage = 1;
        const decision = [true, true, false, false, false];
        try {
            for(let i = 0; i < backers.length; i++) {
                await disb.vote.sendTransaction(
                    campID,
                    stage,
                    decision[i],
                    {from: backers[i]}
                );
            }
        } catch(err) {
            assert.include(
                String(err),
                "Don't have enough time to do this action",
                'show differ error'
            );
        } 
    });

    it('4th campaign: Voting for stage 1 (4/5 agree)', async() => {
        const stage = 1;
        const deadline = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['time'][stage] * 1000;
        
        while (deadline >= (new Date().getTime())); //waiting for reach deadline
        
        const decision = [true, true, true, true, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['agreed'][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('4th campaign: Withdraw stage 1', async() => {
        const prevBalance = await token.getBalance.call(creator, { from: creator });
        
        await camp.endCampaign.sendTransaction(
            campID,
            { from: creator }
        );

        const lastBalance = await token.getBalance.call(creator, { from: creator });
        
        const amount = (await disb.getInfo.call(
             campID,
             { from: deployer }
        ))['amount'];

        assert.equal(lastBalance-prevBalance, parseInt(amount[1]), 'Balance is incorrect');
    });

    it('4th campaign: Voting for stage 2 => should error before time', async() => {
        const stage = 2;
        const decision = [true, true, false, false, false];
        try {
            for(let i = 0; i < backers.length; i++) {
                await disb.vote.sendTransaction(
                    campID,
                    stage,
                    decision[i],
                    {from: backers[i]}
                );
            }
        } catch(err) {
            assert.include(
                String(err),
                "Don't have enough time to do this action",
                'show differ error'
            );
        } 
    });

    it('4th campaign: Voting for stage 2 (2/5 agree)', async() => {
        const stage = 2;
        const deadline = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['time'][stage] * 1000;
        
        while (deadline >= (new Date().getTime())); //waiting for reach deadline
        
        const decision = [true, true, false, false, false];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['agreed'][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('4th campaign: Withdraw stage 2 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });

    it('4th campaign: Voting for stage 3 (5/5 agree)', async() => {
        const stage = 3;
        const deadline = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['time'][stage] * 1000;
        
        while (deadline >= (new Date().getTime())); //waiting for reach deadline
        
        const decision = [true, true, true, true, true];
        for(let i = 0; i < backers.length; i++) {
            await disb.vote.sendTransaction(
                campID,
                stage,
                decision[i],
                {from: backers[i]}
            );
        }
        
        const agreed = (await disb.getInfo.call(
            campID,
            {from: deployer}
        ))['agreed'][stage];
        const expectedAgreed = decision.filter(Boolean).length;
        assert.equal(agreed, expectedAgreed, 'Incorrect number voted');
    });

    it('4th campaign: Withdraw stage 3 -> fail', async() => {
        try {
            await camp.endCampaign.sendTransaction(
                campID,
                { from: creator }
            );
            assert.fail(true, false, 'should throw error');
        } catch(err) {
            assert.include(
                String(err),
                'Missing condition for withdraw',
                'Throw different error'
            );
        }
    });
})