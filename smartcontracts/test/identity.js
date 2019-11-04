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

    it('Checking add verifier: Should throw error on permission', async () => {
        try {
            await instance.addVerifier.sendTransaction(
                accounts[2],
                'pub key',
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
            'pub key',
            { from: accounts[0] }
        );
        const result = await instance.isVerifier.call(accounts[2], {from: accounts[0]});
        assert.equal(result, true, 'Accounts[2] should is verifier');
        const result2 = await instance.isVerifier.call(accounts[1], {from: accounts[0]});
        assert.equal(result2, false, 'Accounts[1] should is normal user');
    });

    it('Validating input:  throw error on empty name', async () => {
        try {
            await instance.registerIdentity.sendTransaction(
                '',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                dateForRegister,
                '',
                '',
                accounts[2],
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

    it('Validating input:  Sthrow error on empty located', async () => {
        try {
            let output = await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                '',
                dateForRegister,
                '',
                '',
                accounts[2],
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

    it('Validating input: throw error on empty dob', async () => {
        try {
            let output = await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                '',
                '',
                '',
                accounts[2],
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

    it('Validating input: create a example identity', async () => {
        await instance.registerIdentity.sendTransaction(
            'Tuan Le',
            'UIT-HCM, Linh Trung, Thu Duc, HCM',
            dateForRegister,
            'private data',
            'share key',
            accounts[2],
            { from: accounts[1] }
        );
        const result = await instance.getIdentity.call(accounts[1], {from: accounts[0]});
        assert.equal(result.name, 'Tuan Le', 'Incorrect name');
        assert.equal(result.located, 'UIT-HCM, Linh Trung, Thu Duc, HCM', 'Incorrect located');
        assert.equal(result.dob, dateForRegister, 'Incorrect date of birth');
        assert.equal(result.status, '1', 'Incorrect status');
        assert.equal(result.privData, 'private data', 'Incorrect private data');
        assert.equal(result.shareKey, 'share key', 'Incorrect share key');
    });

    it('Checking create identity: Should throw error on double register', async () => {
        try {
            await instance.registerIdentity.sendTransaction(
                'Tuan Le',
                'UIT-HCM, Linh Trung, Thu Duc, HCM',
                dateForRegister,
                'private data',
                'share key',
                accounts[2],
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

    it('Check verify an identity', async() => {
        await instance.verify.sendTransaction(
            accounts[1],
            true,
            {from: accounts[2]}
        );
        const result = await instance.isVerified.call(
            accounts[1],
            {from: accounts[2]}
        );
        assert.equal(result, true, 'value return should is true');
    });

})