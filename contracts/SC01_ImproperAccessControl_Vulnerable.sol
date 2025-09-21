// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SC01_ImproperAccessControl_Vulnerable {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Function to receive Ether
    receive() external payable {}
}
