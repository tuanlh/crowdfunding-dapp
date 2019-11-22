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

    mapping (address => PersonalData) internal userInfo;
    mapping (address => bool) internal isVerifyRight;
    mapping (address => VerifierData) internal verifierInfo;
    mapping (address => address[]) internal verifier2users;
    address internal owner;
    address[] internal verifiers;

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
            isVerifyRight[msg.sender] == true,
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
        string calldata _name,
        string calldata _located,
        uint _dob,
        string calldata _data,
        string calldata _shareKey,
        address _verifier)
    external {
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
            isVerifyRight[_verifier] == true,
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
    function getIdentity(address _user) external view
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
    function verify(address _user, bool _status) external onlyVerifier() {
        require(
            userInfo[_user].status == VerifyStatus.pending,
            "User that you verifiy must be have data"
        );

        uint loopLimit = verifier2users[msg.sender].length;
        bool isVerifier2User;
        for (uint i = 0; i < loopLimit; i++) {
            if (verifier2users[msg.sender][i] == _user) {
                isVerifier2User = true;
            }
        }
        require(
            isVerifier2User == true,
            "User must be requested verifier"
        );

        userInfo[_user].status = _status ? VerifyStatus.verified : VerifyStatus.rejected;
        verifierInfo[msg.sender].task -= 1;
    }

    /// @notice Get status of identity
    /// @param _user is address of user
    /// @return Status (1 => pending, 2 => verified, 3 => rejected)
    function getStatus(address _user) external view returns(VerifyStatus) {
        return userInfo[_user].status;
    }

    /// @notice This function for owner to add a verifier
    /// @param _verifier is address of verifier
    /// @param _pubKey is public key of verifier
    function addVerifier(address _verifier, string calldata _pubKey) external onlyOwner() {
        require(
            isVerifyRight[_verifier] == false,
            "This address have already added"
        );
        verifierInfo[_verifier] = VerifierData(_pubKey, 0);
        verifiers.push(_verifier);
        isVerifyRight[_verifier] = true;
    }

    /// @notice Get list all verifiers
    /// @return array of verifier's addresses and count
    function getVerifierAddresses() external view returns (address[] memory) {
        return verifiers;
    }

    /// @notice Get information of a verifier
    /// @param _verifier is address of verifier
    /// @return Public key and number task of verifier
    function getVerifier(address _verifier) external view
    returns(string memory pubKey, uint task) {
        pubKey = verifierInfo[_verifier].pubKey;
        task = verifierInfo[_verifier].task;
    }

    /// @notice Check identity of an address is verified
    /// @param _user is address of user
    /// @return `true` if identity of address is verified
    function isVerified(address _user) external view returns(bool) {
        return userInfo[_user].status == VerifyStatus.verified;
    }

    /// @notice Get list user that requested by Verifier
    /// @return List of users
    function getUsersRequested() external onlyVerifier() view returns(address[] memory) {
        return verifier2users[msg.sender];
    }

    /// @notice Function is used for other contract
    /// @param _verifier is address of user that you want to check
    /// @return `true` if address is verifier
    function isVerifier(address _verifier) external view returns(bool) {
        return isVerifyRight[_verifier];
    }

    /// @notice Change public key of verifier
    /// @param _verifier is address of verifier
    /// @param _newPubKey is new public key
    function changePubKey (address _verifier, string calldata _newPubKey)
    external onlyOwner {
        verifierInfo[_verifier].pubKey = _newPubKey;
    }

    /// @notice Function is used to check if owner
    /// @return `true` if sender is owner of contract
    function isOwner() external view returns(bool) {
        return msg.sender == owner;
    }
}