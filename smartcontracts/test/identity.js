const Identity = artifacts.require('./Identity.sol');
const dateForRegister = Math.floor((new Date('1996-04-27T03:24:00')).valueOf() / 1000);

contract('Identity', accounts => {
    /// User list
    /// @accounts[0] is owner contract (admin/deployer)
    /// @accounts[1] is normal user
    /// @accounts[2] is verifier

    let instance;
    before(async () => {
        instance = await Identity.new({
            from: accounts[0],
            data: Identity.bytecode
        });
        console.log('Contract mined at ', instance.address);
    });

    it('Checking create identity: Should throw error on empty name', async () => {
        try {
            let output = await instance.registerIdentity.sendTransaction(
                '',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                dateForRegister,
                '',
                { from: accounts[1] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'Your name is must be greater 3 characters',
                'throws different error'
            );
        }
    });

    it('Checking create identity: Should throw error on empty located', async () => {
        try {
            let output = await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                '',
                dateForRegister,
                '',
                { from: accounts[1] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'Your located address must be greater 10 characters',
                'throws different error'
            );
        }
    });

    it('Checking create identity: Should throw error on empty dob', async () => {
        try {
            let output = await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                '',
                '',
                { from: accounts[1] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'Date of birth is wrong',
                'throws different error'
            );
        }
    });

    it('Checking create identity: create a example identity', async () => {
        await instance.registerIdentity.sendTransaction(
            'Tuan Le',
            'UIT-HCM, Linh Trung, Thu Duc, HCM',
            dateForRegister,
            'private data',
            { from: accounts[1] }
        );
        const result = await instance.getIdentity.call(accounts[1], {from: accounts[0]});
        assert.equal(result.name, 'Tuan Le', 'Incorrect name');
        assert.equal(result.located, 'UIT-HCM, Linh Trung, Thu Duc, HCM', 'Incorrect located');
        assert.equal(result.dob, dateForRegister, 'Incorrect date of birth');
        assert.equal(result.status, '0', 'Incorrect status');
    });

    it('Checking create identity: Should throw error on double register', async () => {
        try {
            await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                dateForRegister,
                'private data',
                { from: accounts[1] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'You have already registered info',
                'throws different error'
            );
        }
    });

    it('Checking add verifier: Should throw error on permission', async () => {
        try {
            await instance.addVerifier.sendTransaction(
                accounts[2],
                { from: accounts[1] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'Only owner',
                'throws different error'
            );
        }
    });

    it('Checking add verifier', async () => {
        await instance.addVerifier.sendTransaction(
            accounts[2],
            { from: accounts[0] }
        );
        const result = await instance.isVerifier.call(accounts[2], {from: accounts[0]});
        assert.equal(result, true, 'Accounts[2] should is verifier');
        const result2 = await instance.isVerifier.call(accounts[1], {from: accounts[0]});
        assert.equal(result2, false, 'Accounts[1] should is normal user');
    });

    it('Checking request identity: Should throw error on permission', async () => {
        try {
            await instance.requestIdentity.sendTransaction(
                accounts[1],
                'pub_key',
                { from: accounts[3] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                'Only verifier',
                'throws different error'
            );
        }
    });

    it('Checking request identity: Should throw error on empty pub key field', async () => {
        try {
            await instance.requestIdentity.sendTransaction(
                accounts[1],
                '',
                { from: accounts[2] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                '_data should not empty',
                'throws different error'
            );
        }
    });

    it('Checking request identity from verifier', async () => {
        await instance.requestIdentity.sendTransaction(
            accounts[1],
            'pub_key_example',
            { from: accounts[2] }
        );

        const result = await instance.getRequest.call(accounts[1], {from: accounts[1]});
        assert.equal(result.verifier, accounts[2], 'Address of verifier NOT correct');
        assert.equal(result.pub_key, 'pub_key_example', 'Pubkey NOT correct')
    });

    it('Checking response identity: Should throw error on incorrect user address', async () => {
        try {
            await instance.responseIdentity.sendTransaction(
                '',
                { from: accounts[2] }
            );
            assert.fail(true, false, "The function should throw error");
        }
        catch (err) {
            assert.include(
                String(err),
                '_data should not empty',
                'throws different error'
            );
        }
    });
})