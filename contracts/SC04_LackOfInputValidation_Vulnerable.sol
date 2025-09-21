// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SC04_LackOfInputValidation_Vulnerable {
    mapping(address => uint256) public balances;

    function setBalance(address user, uint256 amount) public {
        // The function allows anyone to set arbitrary balances for any user without validation.
        balances[user] = amount;
    }
}
