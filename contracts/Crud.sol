// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Crud {
    struct Record {
        uint id;
        string title;
        string description;
    }

    mapping(uint => Record) public records;
    uint public nextId;

    function createRecord(string memory title, string memory description) public {
        records[nextId] = Record(nextId, title, description);
        nextId++;
    }

    function readRecord(uint id) public view returns (uint, string memory, string memory) {
        Record storage record = records[id];
        return (record.id, record.title, record.description);
    }

    function updateRecord(uint id, string memory title, string memory description) public {
        records[id] = Record(id, title, description);
    }

    function deleteRecord(uint id) public {
        delete records[id];
    }
}
