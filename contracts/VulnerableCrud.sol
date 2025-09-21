// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract VulnerableCrud {
    mapping(address => uint256) public userReputation;

    // VULNERABILITY: Lack of Input Validation
    // This function allows any caller to set an arbitrary reputation for any user address.
    // It doesn't validate that the caller (msg.sender) is authorized to perform this action,
    // nor does it check if the user address is valid (e.g., not address(0)).
    function setReputation(address user, uint256 reputation) public {
        userReputation[user] = reputation;
    }
}
