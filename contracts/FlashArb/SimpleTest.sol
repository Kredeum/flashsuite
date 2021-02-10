// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;


// We import this library to be able to use console.log
import "hardhat/console.sol";


contract SimpleTest {

   string public myString = "Hello World";
   uint public counter = 0;


   function getString() public view returns (string memory) {
     console.log(block.number);
     return myString;
   }

   function increment() public returns (uint) {
     counter++;
     console.log(msg.sender.balance);
     return counter;
   }

}