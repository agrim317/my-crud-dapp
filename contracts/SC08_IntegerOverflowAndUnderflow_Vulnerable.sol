// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

contract SC08_IntegerOverflowAndUnderflow_Vulnerable {
    uint8 public balance;

    function SC08_IntegerOverflowAndUnderflow_Vulnerable() public {
        balance = 255; // Maximum value of uint8
    }

    // Increments the balance by a given value
    function increment(uint8 value) public {
        balance += value; // Vulnerable to overflow
    }

    // Decrements the balance by a given value
    function decrement(uint8 value) public {
        balance -= value; // Vulnerable to underflow
    }
}
