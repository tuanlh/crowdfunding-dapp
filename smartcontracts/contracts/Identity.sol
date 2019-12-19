pragma solidity ^0.5.3;

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
    /// @param name is full name of user
    /// @param located is located address of user
    /// @param dob is date of birth of user
    /// @param data is private data as hash of data that was store on IPFS
    /// @param shareKey is secret key of user was encrypted
    /// @param verifier is address of verifier
    function registerIdentity(
        string calldata name,
        string calldata located,
        uint dob,
        string calldata data,
        string calldata shareKey,
        address verifier)
    external {
        require(
            bytes(name).length > 3,
            "Your name is must be greater 3 characters"
        );

        require(
            bytes(located).length > 10,
            "Your located address must be greater 10 characters"
        );

        require(
            dob < now && dob > 0,
            "Date of birth is wrong"
        );

        require(
            userInfo[msg.sender].dob == 0,
            "You have already registered info"
        );

        require(
            isVerifyRight[verifier] == true,
            "Address verifier is incorrect");
        
        require(
            verifierInfo[verifier].task <= 10,
            "The verifier that you selected is no longer available"
        );

        userInfo[msg.sender] = PersonalData(
            name,
            located,
            data,
            shareKey,
            dob,
            VerifyStatus.pending
        );
        // PersonalData memory temp;
        // temp.name = name;
        // temp.located = located;
        // temp.dob = dob;
        // temp.privData = data;
        // temp.shareKey = shareKey;
        // temp.status = VerifyStatus.pending;
        // userInfo[msg.sender] = temp;
        verifier2users[verifier].push(msg.sender);
        verifierInfo[verifier].task += 1;
    }

    /// @notice Get information of an user
    /// @param user is address of user
    /// @return Name, Located Address, Date of birth and verify status
    function getIdentity(address user) external view
    returns (
        string memory name,
        string memory located,
        uint dob,
        string memory privData,
        string memory shareKey,
        VerifyStatus status
    ) {
        name = userInfo[user].name;
        located = userInfo[user].located;
        dob = userInfo[user].dob;
        status = userInfo[user].status;
        privData = userInfo[user].privData;
        shareKey = userInfo[user].shareKey;
    }


    /// @notice This function for verifier to verify an identity
    /// @param user is address of user
    /// @param status is status include `true` is verified and `false` is rejected
    function verify(address user, bool status) external onlyVerifier() {
        require(
            userInfo[user].status == VerifyStatus.pending,
            "User that you verifiy must be have data"
        );

        uint loopLimit = verifier2users[msg.sender].length;
        bool isVerifier2User = false;
        for (uint i = 0; i < loopLimit; i++) {
            if (verifier2users[msg.sender][i] == user) {
                isVerifier2User = true;
            }
        }
        require(
            isVerifier2User == true,
            "User must be requested verifier"
        );

        userInfo[user].status = status ? VerifyStatus.verified : VerifyStatus.rejected;
        verifierInfo[msg.sender].task -= 1;
    }

    /// @notice Get status of identity
    /// @param user is address of user
    /// @return Status (1 => pending, 2 => verified, 3 => rejected)
    function getStatus(address user) external view returns(VerifyStatus) {
        return userInfo[user].status;
    }

    /// @notice This function for owner to add a verifier
    /// @param verifier is address of verifier
    /// @param pubKey is public key of verifier
    function addVerifier(address verifier, string calldata pubKey) external onlyOwner() {
        require(
            isVerifyRight[verifier] == false,
            "This address have already added"
        );
        verifierInfo[verifier] = VerifierData(pubKey, 0);
        verifiers.push(verifier);
        isVerifyRight[verifier] = true;
    }

    /// @notice Get list all verifiers
    /// @return array of verifier's addresses and count
    function getVerifierAddresses() external view returns (address[] memory) {
        return verifiers;
    }

    /// @notice Get information of a verifier
    /// @param verifier is address of verifier
    /// @return Public key and number task of verifier
    function getVerifier(address verifier) external view
    returns(string memory pubKey, uint task) {
        pubKey = verifierInfo[verifier].pubKey;
        task = verifierInfo[verifier].task;
    }

    /// @notice Check identity of an address is verified
    /// @param user is address of user
    /// @return `true` if identity of address is verified
    function isVerified(address user) external view returns(bool) {
        return userInfo[user].status == VerifyStatus.verified;
    }

    /// @notice Get list user that requested by Verifier
    /// @return List of users
    function getUsersRequested() external onlyVerifier() view returns(address[] memory) {
        return verifier2users[msg.sender];
    }

    /// @notice Function is used for other contract
    /// @param verifier is address of user that you want to check
    /// @return `true` if address is verifier
    function isVerifier(address verifier) external view returns(bool) {
        return isVerifyRight[verifier];
    }

    /// @notice Change public key of verifier
    /// @param verifier is address of verifier
    /// @param newPubKey is new public key
    function changePubKey (address verifier, string calldata newPubKey)
    external onlyOwner {
        verifierInfo[verifier].pubKey = newPubKey;
    }

    /// @notice Function is used to check if owner
    /// @return `true` if sender is owner of contract
    function isOwner() external view returns(bool) {
        return msg.sender == owner;
    }
}