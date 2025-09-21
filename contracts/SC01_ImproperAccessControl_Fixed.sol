// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SC01_ImproperAccessControl_Fixed is Ownable {

    constructor() payable Ownable(msg.sender) {}

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Function to receive Ether
    receive() external payable {}
}
