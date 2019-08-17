pragma solidity ^0.5;

contract Identity {
    enum VerifyStatus {pending, requested, responsed, verified, reject}

    struct PersonalData {
        string name;
        string located;
        string privData;
        uint dob;
        VerifyStatus status;
    }

    struct IdentityRequest {
        address verifier;
        string data;
    }
    
    mapping (address => PersonalData) data;
    mapping (address => IdentityRequest) requests; // user => request
    mapping (address => mapping (address => string)) responses; // verifier => user => encrypted_data
    address[] users;
    mapping (address => bool) verifiers;
    address owner;

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
            verifiers[msg.sender] == true,
            "Only verifier");
        _;
    }

    /// @notice This function for user can register a identity
    /// @param _name is full name of user
    /// @param _located is located address of user
    /// @param _dob is date of birth of user
    /// @param _data is private data as form of JSON string
    function registerIdentity(
        string memory _name,
        string memory _located,
        uint _dob,
        string memory _data)
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

        PersonalData memory temp;
        temp.name = _name;
        temp.located = _located;
        temp.dob = _dob;
        temp.privData = _data;
        temp.status = VerifyStatus.pending;
        data[msg.sender] = temp;
        users.push(msg.sender);
    }

    /// @notice Get information of an user
    /// @param _user is address of user
    /// @return Name, Located Address, Date of birth and verify status
    function getIdentity(address _user) public view
    returns (
        string memory name,
        string memory located,
        uint dob,
        VerifyStatus status
    ) {
        name = data[_user].name;
        located = data[_user].located;
        dob = data[_user].dob;
        status = data[_user].status;
    }

    /// @notice This function for verifier can list unverify identity to verify
    /// @dev After get user list, you have to filter for your purpose
    /// @return list of address of user
    function getUserList() public onlyVerifier() view returns(address[] memory) {
        return users;
    }

    /// @notice This function for verifier to request access to private data of an user
    /// @param _user is address of user
    /// @param _data is public key of verifier
    function requestIdentity(address _user, string memory _data)
    public onlyVerifier() {
        require(
            data[_user].dob != 0,
            "User that you request don't have data"
        );
        require(
            data[_user].status < VerifyStatus.requested,
            "User that you request is invalid"
        );
        require(
            bytes(_data).length > 0,
            "_data should not empty"
        );

        requests[_user] = IdentityRequest(
            msg.sender,
            _data
        );
        data[_user].status = VerifyStatus.requested;

    }

    /// @notice This function for user to get pending request from verifier to access data
    /// @param _user is address of user
    /// @return address and public key of verifier
    function getRequest(address _user) public view
     returns (address verifier, string memory pubk) {
        require(
            data[_user].status == VerifyStatus.requested,
            "Your identity NOT be request"
        );
        verifier = requests[_user].verifier;
        pubk = requests[_user].data;
    }

    /// @notice User will reponse to verifier with encrypted data
    /// @param _data is encrypted data
    function reponseIdentity(string memory _data) public {
        require(
            data[msg.sender].status == VerifyStatus.requested,
            "Your identity NOT be request"
        );
        require(
            bytes(_data).length > 0,
            "_data should not empty"
        );
        address ownerRequest = requests[msg.sender].verifier;
        responses[ownerRequest][msg.sender] = _data;
        data[msg.sender].status = VerifyStatus.responsed;
    }

    /// @notice This function for verifier to get response from user to access data
    /// @param _user is address of user
    /// @return encrypted data
    function getResponse(address _user) public view
     returns (string memory) {
        require(
            data[_user].status == VerifyStatus.responsed,
            "Your identity NOT have response data"
        );
        return responses[msg.sender][_user];
    }

    /// @notice This function for verifier to verify an identity
    /// @param _user is address of user
    function verify(address _user) public onlyVerifier() {
        require(
            data[msg.sender].status == VerifyStatus.responsed,
            "User that you verifiy must be have response data"
        );
        data[_user].status = VerifyStatus.verified;
    }

    /// @notice Get status of identity
    /// @return Status (0 => pending, 1=> requested, 2 => responsed, 3 => verified, 4 => reject)
    function getStatus(address _user) public view returns(VerifyStatus) {
        return data[_user].status;
    }

    /// @notice This function for owner to add a verifier
    /// @param _verifier is address of verifier
    function addVerifier(address _verifier) public onlyOwner() {
        require(
            verifiers[_verifier] == false,
            "This address have already added"
        );
        verifiers[_verifier] = true;
    }

    /// @notice Check an address is verifier yet
    /// @param _verifier is address of verifier
    /// @return `true` if address is verifier
    function isVerifier(address _verifier) public view returns(bool) {
        return verifiers[_verifier];
    }

    /// @notice Check identity of an address is verified
    /// @param _user is address of user
    /// @return `true` if identity of address is verified
    function isVerified(address _user) public view returns(bool) {
        return data[_user].status == VerifyStatus.verified;
    }

}