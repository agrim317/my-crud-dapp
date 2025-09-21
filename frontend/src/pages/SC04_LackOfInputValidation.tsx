import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../main';

// ABIs for the contracts
const vulnerableSC04ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "setBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "balances",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const fixedSC04ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "balances",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "setBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Deployed contract addresses
const vulnerableContractAddress = import.meta.env.VITE_SC04_VULNERABLE_ADDRESS as `0x${string}`;
const fixedContractAddress = import.meta.env.VITE_SC04_FIXED_ADDRESS as `0x${string}`;

export function SC04_LackOfInputValidationPage() {
  // Hooks for vulnerable contract interaction
  const { writeContract: writeVulnerable, data: hashVulnerable, isPending: isPendingVulnerable, isError: isErrorVulnerable, error: errorVulnerable } = useWriteContract();
  const { isLoading: isConfirmingVulnerable, isSuccess: isConfirmedVulnerable } = useWaitForTransactionReceipt({ hash: hashVulnerable });

  // Hooks for fixed contract interaction
  const { writeContract: writeFixed, data: hashFixed, isPending: isPendingFixed, isError: isErrorFixed, error: errorFixed } = useWriteContract();
  const { isLoading: isConfirmingFixed, isSuccess: isConfirmedFixed } = useWaitForTransactionReceipt({ hash: hashFixed });

  // State for vulnerable contract interaction
  const [vulnerableTargetUser, setVulnerableTargetUser] = useState('');
  const [vulnerableBalance, setVulnerableBalance] = useState('0');
  const [vulnerableCheckUser, setVulnerableCheckUser] = useState('');
  const [vulnerableCheckedBalance, setVulnerableCheckedBalance] = useState<string | null>(null);

  // State for fixed contract interaction
  const [fixedTargetUser, setFixedTargetUser] = useState('');
  const [fixedBalance, setFixedBalance] = useState('0');
  const [fixedCheckUser, setFixedCheckUser] = useState('');
  const [fixedCheckedBalance, setFixedCheckedBalance] = useState<string | null>(null);

  // --- Vulnerable Contract Handlers ---
  const handleVulnerableSetBalance = () => {
    if (!vulnerableTargetUser) return;
    writeVulnerable({
      address: vulnerableContractAddress,
      abi: vulnerableSC04ABI,
      functionName: 'setBalance',
      args: [vulnerableTargetUser as `0x${string}`, BigInt(vulnerableBalance)],
    });
  };

  const handleVulnerableCheckBalance = async () => {
    try {
      if (!vulnerableCheckUser) return;
      const result = await readContract(config, {
        address: vulnerableContractAddress,
        abi: vulnerableSC04ABI,
        functionName: 'balances',
        args: [vulnerableCheckUser as `0x${string}`],
      });
      setVulnerableCheckedBalance(result.toString());
    } catch (error) {
      console.error("Error reading balance from vulnerable contract:", error);
      setVulnerableCheckedBalance("Error or user not found");
    }
  };

  // --- Fixed Contract Handlers ---
  const handleFixedSetBalance = () => {
    if (!fixedTargetUser) return;
    writeFixed({
      address: fixedContractAddress,
      abi: fixedSC04ABI,
      functionName: 'setBalance',
      args: [fixedTargetUser as `0x${string}`, BigInt(fixedBalance)],
    });
  };

  const handleFixedCheckBalance = async () => {
    try {
      if (!fixedCheckUser) return;
      const result = await readContract(config, {
        address: fixedContractAddress,
        abi: fixedSC04ABI,
        functionName: 'balances',
        args: [fixedCheckUser as `0x${string}`],
      });
      setFixedCheckedBalance(result.toString());
    } catch (error) {
      console.error("Error reading balance from fixed contract:", error);
      setFixedCheckedBalance("Error or user not found");
    }
  };

  return (
    <section className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-100">SC04:2025 - Lack of Input Validation</h2>
      <p className="text-lg text-gray-400">
        Input validation ensures that a smart contract processes only valid and expected data. When contracts fail to validate incoming inputs, they inadvertently expose themselves to security risks such as logic manipulation, unauthorized access, and unexpected behavior.
      </p>

      {/* Vulnerable Contract Demo */}
      <div className="border-2 border-red-500 rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-bold text-red-400">🔴 Vulnerable Contract Demo</h3>
        <p className="text-gray-300">
          This contract allows anyone to set arbitrary balances for any user without validation. You can set the balance for any address, including your own or another user's, even if you are not the contract owner.
        </p>
        <div className="space-y-4">
          <h4 className="text-xl font-semibold">Set Balance (Insecure)</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Target User Address"
              value={vulnerableTargetUser}
              onChange={(e) => setVulnerableTargetUser(e.target.value)}
              className="flex-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              placeholder="Balance"
              value={vulnerableBalance}
              onChange={(e) => setVulnerableBalance(e.target.value)}
              className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleVulnerableSetBalance}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Set Balance
            </button>
          </div>
          {(isPendingVulnerable || isConfirmingVulnerable) && <div className="text-red-300">Waiting for transaction...</div>}
          {isConfirmedVulnerable && <div className="text-green-400">Transaction confirmed.</div>}
          {isErrorVulnerable && <div className="text-red-400">Error: {errorVulnerable?.shortMessage || errorVulnerable?.message}</div>}
        </div>
        <div className="space-y-4 pt-4 border-t border-gray-600">
          <h4 className="text-xl font-semibold">Check Balance</h4>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="User Address to Check"
              value={vulnerableCheckUser}
              onChange={(e) => setVulnerableCheckUser(e.target.value)}
              className="flex-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleVulnerableCheckBalance}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Check Balance
            </button>
          </div>
          {vulnerableCheckedBalance !== null && (
            <div className="p-4 bg-gray-700 rounded-md text-gray-200">
              <strong>Balance:</strong> {vulnerableCheckedBalance}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Contract Demo */}
      <div className="border-2 border-green-500 rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-bold text-green-400">🟢 Fixed Contract Demo</h3>
        <p className="text-gray-300">
          This contract includes input validation and an `onlyOwner` modifier to restrict who can set balances. Only the contract owner can call `setBalance`, and it validates that the target address is not the zero address.
        </p>
        <div className="space-y-4">
          <h4 className="text-xl font-semibold">Set Balance (Secure)</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Target User Address"
              value={fixedTargetUser}
              onChange={(e) => setFixedTargetUser(e.target.value)}
              className="flex-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Balance"
              value={fixedBalance}
              onChange={(e) => setFixedBalance(e.target.value)}
              className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleFixedSetBalance}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Set Balance
            </button>
          </div>
          {(isPendingFixed || isConfirmingFixed) && <div className="text-green-300">Waiting for transaction...</div>}
          {isConfirmedFixed && <div className="text-green-400">Transaction confirmed.</div>}
          {isErrorFixed && <div className="text-red-400">Error: {errorFixed?.shortMessage || errorFixed?.message}</div>}
        </div>
        <div className="space-y-4 pt-4 border-t border-gray-600">
          <h4 className="text-xl font-semibold">Check Balance</h4>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="User Address to Check"
              value={fixedCheckUser}
              onChange={(e) => setFixedCheckUser(e.target.value)}
              className="flex-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleFixedCheckBalance}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Check Balance
            </button>
          </div>
          {fixedCheckedBalance !== null && (
            <div className="p-4 bg-gray-700 rounded-md text-gray-200">
              <strong>Balance:</strong> {fixedCheckedBalance}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}