import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../main';

const vulnerableSC08ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "value",
        "type": "uint8"
      }
    ],
    "name": "decrement",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "value",
        "type": "uint8"
      }
    ],
    "name": "increment",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

const fixedSC08ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "value",
        "type": "uint8"
      }
    ],
    "name": "decrement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "value",
        "type": "uint8"
      }
    ],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const vulnerableContractAddress = import.meta.env.VITE_SC08_VULNERABLE_ADDRESS as `0x${string}`;
const fixedContractAddress = import.meta.env.VITE_SC08_FIXED_ADDRESS as `0x${string}`;

export function SC08_IntegerOverflowAndUnderflowPage() {
  const [vulnerableBalance, setVulnerableBalance] = useState<string | null>(null);
  const [fixedBalance, setFixedBalance] = useState<string | null>(null);
  const [value, setValue] = useState('1');

  const { writeContract: writeVulnerable, data: hashVulnerable, isPending: isPendingVulnerable, isError: isErrorVulnerable, error: errorVulnerable } = useWriteContract();
  const { isLoading: isConfirmingVulnerable, isSuccess: isConfirmedVulnerable } = useWaitForTransactionReceipt({ hash: hashVulnerable });

  const { writeContract: writeFixed, data: hashFixed, isPending: isPendingFixed, isError: isErrorFixed, error: errorFixed } = useWriteContract();
  const { isLoading: isConfirmingFixed, isSuccess: isConfirmedFixed } = useWaitForTransactionReceipt({ hash: hashFixed });

  const fetchBalances = async () => {
    try {
      const vulnerableBal = await readContract(config, {
        address: vulnerableContractAddress,
        abi: vulnerableSC08ABI,
        functionName: 'balance',
      });
      setVulnerableBalance(vulnerableBal.toString());

      const fixedBal = await readContract(config, {
        address: fixedContractAddress,
        abi: fixedSC08ABI,
        functionName: 'balance',
      });
      setFixedBalance(fixedBal.toString());
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  useEffect(() => {
    if (isConfirmedVulnerable || isConfirmedFixed) {
      fetchBalances();
    }
  }, [isConfirmedVulnerable, isConfirmedFixed]);

  const handleIncrementVulnerable = () => {
    writeVulnerable({
      address: vulnerableContractAddress,
      abi: vulnerableSC08ABI,
      functionName: 'increment',
      args: [Number(value)],
    });
  };

  const handleDecrementVulnerable = () => {
    writeVulnerable({
      address: vulnerableContractAddress,
      abi: vulnerableSC08ABI,
      functionName: 'decrement',
      args: [Number(value)],
    });
  };

  const handleIncrementFixed = () => {
    writeFixed({
      address: fixedContractAddress,
      abi: fixedSC08ABI,
      functionName: 'increment',
      args: [Number(value)],
    });
  };

  const handleDecrementFixed = () => {
    writeFixed({
      address: fixedContractAddress,
      abi: fixedSC08ABI,
      functionName: 'decrement',
      args: [Number(value)],
    });
  };

  return (
    <section className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-100">SC08:2025 - Integer Overflow and Underflow</h2>
      <p className="text-lg text-gray-400">
        This page demonstrates an integer overflow and underflow vulnerability. An overflow occurs when an arithmetic operation results in a value that is larger than what can be stored in the variable type. An underflow occurs when the result is smaller than the minimum value.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vulnerable Contract Demo */}
        <div className="flex-1 border-2 border-red-500 rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-red-400">🔴 Vulnerable Contract</h3>
          <p className="text-gray-300">
            This contract uses Solidity version 0.4.17, which does not have built-in overflow/underflow protection.
          </p>
          <div className="flex items-center gap-2">
            <strong className="text-xl">Current Balance:</strong>
            <span className="text-xl font-semibold text-red-200">{vulnerableBalance}</span>
          </div>
          <div className="flex flex-col gap-4 items-start pt-4">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-24"
            />
            <div className="flex gap-2">
              <button
                onClick={handleIncrementVulnerable}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Increment
              </button>
              <button
                onClick={handleDecrementVulnerable}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Decrement
              </button>
            </div>
          </div>
          {(isPendingVulnerable || isConfirmingVulnerable) && <div className="text-red-300">Waiting for transaction...</div>}
          {isConfirmedVulnerable && <div className="text-green-400">Transaction confirmed.</div>}
          {isErrorVulnerable && <div className="text-red-400">Error: {errorVulnerable?.shortMessage || errorVulnerable?.message}</div>}
        </div>

        {/* Fixed Contract Demo */}
        <div className="flex-1 border-2 border-green-500 rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-green-400">🟢 Fixed Contract</h3>
          <p className="text-gray-300">
            This contract uses Solidity 0.8+, which has built-in protection against overflow and underflow. It also includes a `require` statement for the decrement function.
          </p>
          <div className="flex items-center gap-2">
            <strong className="text-xl">Current Balance:</strong>
            <span className="text-xl font-semibold text-green-200">{fixedBalance}</span>
          </div>
          <div className="flex flex-col gap-4 items-start pt-4">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 w-24"
            />
            <div className="flex gap-2">
              <button
                onClick={handleIncrementFixed}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Increment
              </button>
              <button
                onClick={handleDecrementFixed}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Decrement
              </button>
            </div>
          </div>
          {(isPendingFixed || isConfirmingFixed) && <div className="text-green-300">Waiting for transaction...</div>}
          {isConfirmedFixed && <div className="text-green-400">Transaction confirmed.</div>}
          {isErrorFixed && <div className="text-red-400">Error: {errorFixed?.shortMessage || errorFixed?.message}</div>}
        </div>
      </div>
    </section>
  );
}