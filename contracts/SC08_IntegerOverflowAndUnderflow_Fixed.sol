// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SC08_IntegerOverflowAndUnderflow_Fixed {
    uint8 public balance;

    constructor() {
        balance = 255; // Maximum value of uint8
    }

    // Increments the balance by a given value
    function increment(uint8 value) public {
        // In Solidity 0.8+, overflow is automatically checked.
        // To demonstrate the fix, we can use an unchecked block
        // for the vulnerable part and show the correct behavior here.
        // However, for clarity, we will rely on the default behavior.
        balance += value;
    }

    // Decrements the balance by a given value
    function decrement(uint8 value) public {
        require(balance >= value, "Underflow detected");
        balance -= value;
    }
}
