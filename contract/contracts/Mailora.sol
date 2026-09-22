// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Mailora
 * @dev Decentralized, End-to-End Encrypted Web3 Mailbox on BOT Chain (Mainnet)
 */
contract Mailora {
    address public owner;
    address public relayer;

    // Mapping from alias (string) to address
    mapping(string => address) public aliasToAddress;
    // Mapping from address to alias
    mapping(address => string) public addressToAlias;

    event AliasRegistered(address indexed user, string aliasName);
    event MessageSent(address indexed from, address indexed to, string contentCID, uint256 timestamp);

    modifier onlyAuthorized(address _targetUser) {
        require(msg.sender == _targetUser || msg.sender == relayer || msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        relayer = msg.sender;
    }

    function setRelayer(address _relayer) external {
        require(msg.sender == owner, "Only owner can set relayer");
        relayer = _relayer;
    }

    // Direct registration by user
    function registerAlias(string memory _alias) public {
        registerAliasFor(msg.sender, _alias);
    }

    // Sponsored or direct registration for a specific user
    function registerAliasFor(address _user, string memory _alias) public onlyAuthorized(_user) {
        require(_user != address(0), "Invalid user address");
        require(bytes(_alias).length > 0, "Alias cannot be empty");
        require(aliasToAddress[_alias] == address(0), "Alias already taken");
        require(bytes(addressToAlias[_user]).length == 0, "Address already has an alias");

        aliasToAddress[_alias] = _user;
        addressToAlias[_user] = _alias;

        emit AliasRegistered(_user, _alias);
    }

    // Direct message dispatch
    function sendMessage(string memory _toAlias, string memory _contentCID) public payable {
        sendMessageFor(msg.sender, _toAlias, _contentCID);
    }

    // Sponsored or direct message dispatch for a sender
    function sendMessageFor(address _from, string memory _toAlias, string memory _contentCID) public payable onlyAuthorized(_from) {
        address recipient = aliasToAddress[_toAlias];
        require(recipient != address(0), "Recipient alias does not exist");
        require(bytes(_contentCID).length > 0, "Message CID cannot be empty");

        // If native BOT was sent with the message, forward it directly to recipient
        if (msg.value > 0) {
            (bool success, ) = payable(recipient).call{value: msg.value}("");
            require(success, "BOT token transfer failed");
        }

        emit MessageSent(_from, recipient, _contentCID, block.timestamp);
    }

    // Get the alias of the caller
    function getMyAlias() public view returns (string memory) {
        return addressToAlias[msg.sender];
    }
}
