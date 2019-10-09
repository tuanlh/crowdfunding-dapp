pragma solidity ^0.5;

contract Identity {
    enum VerifyStatus {none, pending, verified, rejected}

    struct PersonalData {
        string name;
        string located;
        string privData;
        string shareKey;
        uint dob;
        VerifyStatus status;
    }
    struct VerifierData {
        string pubKey;
        uint task;
    }

    mapping (address => PersonalData) userInfo;
    mapping (address => bool) isVerifier;
    mapping (address => VerifierData) verifierInfo;
    mapping (address => address[]) verifier2users;
    address owner;
    address[] verifiers;

    /* -- Constructor -- */
    //
    /// @notice Constructor to create a Identity contract
    /// @dev Owner is runner of this contract
    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner"
            );
        _;
    }

    modifier onlyVerifier() {
        require(
            isVerifier[msg.sender] == true,
            "Only verifier");
        _;
    }

    /// @notice This function for user can register a identity
    /// @param _name is full name of user
    /// @param _located is located address of user
    /// @param _dob is date of birth of user
    /// @param _data is private data as hash of data that was store on IPFS
    /// @param _shareKey is secret key of user was encrypted
    /// @param _verifier is address of verifier
    function registerIdentity(
        string memory _name,
        string memory _located,
        uint _dob,
        string memory _data,
        string memory _shareKey,
        address _verifier)
    public {
        require(
            bytes(_name).length > 3,
            "Your name is must be greater 3 characters"
        );

        require(
            bytes(_located).length > 10,
            "Your located address must be greater 10 characters"
        );

        require(
            _dob < now && _dob > 0,
            "Date of birth is wrong"
        );

        require(
            userInfo[msg.sender].dob == 0,
            "You have already registered info"
        );

        require(
            isVerifier[_verifier] == true,
            "Address verifier is incorrect");
        
        require(
            verifierInfo[_verifier].task <= 10,
            "The verifier that you selected is no longer available"
        );

        PersonalData memory temp;
        temp.name = _name;
        temp.located = _located;
        temp.dob = _dob;
        temp.privData = _data;
        temp.shareKey = _shareKey;
        temp.status = VerifyStatus.pending;
        userInfo[msg.sender] = temp;
        verifier2users[_verifier].push(msg.sender);
        verifierInfo[_verifier].task += 1;
    }

    /// @notice Get information of an user
    /// @param _user is address of user
    /// @return Name, Located Address, Date of birth and verify status
    function getIdentity(address _user) public view
    returns (
        string memory name,
        string memory located,
        uint dob,
        string memory privData,
        string memory shareKey,
        VerifyStatus status
    ) {
        name = userInfo[_user].name;
        located = userInfo[_user].located;
        dob = userInfo[_user].dob;
        status = userInfo[_user].status;
        privData = userInfo[_user].privData;
        shareKey = userInfo[_user].shareKey;
    }


    /// @notice This function for verifier to verify an identity
    /// @param _user is address of user
    /// @param _status is status include `true` is verified and `false` is rejected
    function verify(address _user, bool _status) public onlyVerifier() {
        require(
            userInfo[_user].status == VerifyStatus.pending,
            "User that you verifiy must be have data"
        );

        require(
            checkVerifier2User(msg.sender, _user) == true,
            "User must be request you"
        );

        userInfo[_user].status = _status ? VerifyStatus.verified : VerifyStatus.rejected;
        verifierInfo[msg.sender].task -= 1;
    }

    /// @notice check if verifier was requested by user to verify
    /// @dev check user's address is exists in `verifier2users` array
    /// @param _verifier is address of verifier
    /// @param _user is address of user
    /// @return `true` if address of user is exists in list
    function checkVerifier2User(address _verifier, address _user) internal view
    returns (bool) {
        for (uint i = 0; i < verifier2users[_verifier].length; i++) {
            if (verifier2users[_verifier][i] == _user) return true;
        }
        return false;
    }

    /// @notice Get status of identity
    /// @param _user is address of user
    /// @return Status (1 => pending, 2 => verified, 3 => reject)
    function getStatus(address _user) public view returns(VerifyStatus) {
        return userInfo[_user].status;
    }

    /// @notice This function for owner to add a verifier
    /// @param _verifier is address of verifier
    /// @param _pubKey is public key of verifier
    function addVerifier(address _verifier, string memory _pubKey) public onlyOwner() {
        require(
            isVerifier[_verifier] == false,
            "This address have already added"
        );
        verifierInfo[_verifier] = VerifierData(_pubKey, 0);
        verifiers.push(_verifier);
        isVerifier[_verifier] = true;
    }

    /// @notice Get list all verifiers
    /// @return array of verifier's addresses and count
    function getVerifierAddresses() public view returns (address[] memory) {
        return verifiers;
    }

    /// @notice Get information of a verifier
    /// @param _verifier is address of verifier
    /// @return Public key and number task of verifier
    function getVerifier(address _verifier) public view
    returns(string memory pubKey, uint task) {
        pubKey = verifierInfo[_verifier].pubKey;
        task = verifierInfo[_verifier].task;
    }

    /// @notice Check identity of an address is verified
    /// @param _user is address of user
    /// @return `true` if identity of address is verified
    function isVerified(address _user) public view returns(bool) {
        return userInfo[_user].status == VerifyStatus.verified;
    }

    /// @notice Get list user that requested by Verifier
    /// @return List of users
    function getUsers() public onlyVerifier() view returns(address[] memory) {
        return verifier2users[msg.sender];
    }

}