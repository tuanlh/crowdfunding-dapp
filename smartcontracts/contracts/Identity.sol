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

    mapping (address => PersonalData) data;
    mapping (address => bool) isVerifier;
    mapping (address => string) pubKeyVerifiers;
    mapping (address => address[]) verifier2users;
    mapping (address => uint) counter; // count number of user that verifier processing
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
            data[msg.sender].dob == 0,
            "You have already registered info"
        );

        require(
            isVerifier[_verifier] == true,
            "Address verifier is incorrect");
        
        require(
            counter[_verifier] <= 10,
            "The verifier that you selected is no longer available"
        );

        PersonalData memory temp;
        temp.name = _name;
        temp.located = _located;
        temp.dob = _dob;
        temp.privData = _data;
        temp.shareKey = _shareKey;
        temp.status = VerifyStatus.pending;
        data[msg.sender] = temp;
        verifier2users[_verifier].push(msg.sender);
        counter[_verifier] += 1;
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
        name = data[_user].name;
        located = data[_user].located;
        dob = data[_user].dob;
        status = data[_user].status;
        privData = data[_user].privData;
        shareKey = data[_user].shareKey;
    }

    /// @notice This function for user get public key of verifier
    /// @param _verifier is address of verifier
    /// @return Public key of verifier
    function getPubKey(address _verifier) public view returns(string memory) {
        return pubKeyVerifiers[_verifier];
    }

    /// @notice This function for verifier to verify an identity
    /// @param _user is address of user
    /// @param _status is status include `true` is verified and `false` is rejected
    function verify(address _user, bool _status) public onlyVerifier() {
        require(
            data[msg.sender].status == VerifyStatus.pending,
            "User that you verifiy must be have data"
        );

        require(
            checkVerifier2User(msg.sender, _user) == true,
            "User must be request you"
        );

        data[_user].status = _status ? VerifyStatus.verified : VerifyStatus.rejected;
        counter[msg.sender] -= 1;
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
        return data[_user].status;
    }

    /// @notice This function for owner to add a verifier
    /// @param _verifier is address of verifier
    /// @param _pubKey is public key of verifier
    function addVerifier(address _verifier, string memory _pubKey) public onlyOwner() {
        require(
            isVerifier[_verifier] == false,
            "This address have already added"
        );
        isVerifier[_verifier] = true;
        verifiers.push(_verifier);
        pubKeyVerifiers[_verifier] = _pubKey;
    }

    /// @notice Get list verifier can verify a new identity
    /// @return array of verifier's addresses
    function getVerifierAvailable() public view returns (address[] memory) {
        address[] memory result;
        for (uint i = 0; i < verifiers.length; i++) {
            if (counter[verifiers[i]] <= 10) {
                result[result.length] = verifiers[i];
            }
        }
        return result;
    }

    /// @notice Get list all verifiers
    /// @return array of verifier's addresses
    function getAllVerifiers() public view returns (address[] memory) {
        return verifiers;
    }

    /// @notice Check identity of an address is verified
    /// @param _user is address of user
    /// @return `true` if identity of address is verified
    function isVerified(address _user) public view returns(bool) {
        return data[_user].status == VerifyStatus.verified;
    }

    /// @notice Get list user that requested
    /// @return List of users
    function getUsers() public onlyVerifier() view returns(address[] memory) {
        return verifier2users[msg.sender];
    }

}