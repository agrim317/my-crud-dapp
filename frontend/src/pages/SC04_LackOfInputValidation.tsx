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
    <section>
      <h2>SC04:2025 - Lack of Input Validation</h2>
      <p>Input validation ensures that a smart contract processes only valid and expected data. When contracts fail to validate incoming inputs, they inadvertently expose themselves to security risks such as logic manipulation, unauthorized access, and unexpected behavior.</p>

      {/* Vulnerable Contract Demo */}
      <div style={{ border: '1px solid red', padding: '1rem', marginTop: '1rem' }}>
        <h3 style={{ color: 'red' }}>🔴 Vulnerable Contract Demo</h3>
        <p>This contract allows anyone to set arbitrary balances for any user without validation. You can set the balance for any address, including your own or another user's, even if you are not the contract owner.</p>
        <div>
          <h4>Set Balance (Insecure)</h4>
          <input type="text" placeholder="Target User Address" value={vulnerableTargetUser} onChange={(e) => setVulnerableTargetUser(e.target.value)} style={{ width: '300px' }}/>
          <input type="number" placeholder="Balance" value={vulnerableBalance} onChange={(e) => setVulnerableBalance(e.target.value)} />
          <button onClick={handleVulnerableSetBalance}>Set Balance</button>
          {isPendingVulnerable && <div>Waiting for transaction...</div>}
          {isConfirmingVulnerable && <div>Confirming transaction...</div>}
          {isConfirmedVulnerable && <div>Transaction confirmed.</div>}
          {isErrorVulnerable && <div style={{ color: 'red' }}>Error: {errorVulnerable?.shortMessage || errorVulnerable?.message}</div>}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <h4>Check Balance</h4>
          <input type="text" placeholder="User Address to Check" value={vulnerableCheckUser} onChange={(e) => setVulnerableCheckUser(e.target.value)} style={{ width: '300px' }} />
          <button onClick={handleVulnerableCheckBalance}>Check Balance</button>
          {vulnerableCheckedBalance !== null && <div><strong>Balance:</strong> {vulnerableCheckedBalance}</div>}
        </div>
      </div>

      {/* Fixed Contract Demo */}
      <div style={{ border: '1px solid green', padding: '1rem', marginTop: '2rem' }}>
        <h3 style={{ color: 'green' }}>🟢 Fixed Contract Demo</h3>
        <p>This contract includes input validation and an `onlyOwner` modifier to restrict who can set balances. Only the contract owner can call `setBalance`, and it validates that the target address is not the zero address.</p>
        <div>
          <h4>Set Balance (Secure)</h4>
          <input type="text" placeholder="Target User Address" value={fixedTargetUser} onChange={(e) => setFixedTargetUser(e.target.value)} style={{ width: '300px' }}/>
          <input type="number" placeholder="Balance" value={fixedBalance} onChange={(e) => setFixedBalance(e.target.value)} />
          <button onClick={handleFixedSetBalance}>Set Balance</button>
          {isPendingFixed && <div>Waiting for transaction...</div>}
          {isConfirmingFixed && <div>Confirming transaction...</div>}
          {isConfirmedFixed && <div>Transaction confirmed.</div>}
          {isErrorFixed && <div style={{ color: 'red' }}>Error: {errorFixed?.shortMessage || errorFixed?.message}</div>}
          {isErrorFixed && console.log("Fixed Contract Error:", errorFixed)}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <h4>Check Balance</h4>
          <input type="text" placeholder="User Address to Check" value={fixedCheckUser} onChange={(e) => setFixedCheckUser(e.target.value)} style={{ width: '300px' }} />
          <button onClick={handleFixedCheckBalance}>Check Balance</button>
          {fixedCheckedBalance !== null && <div><strong>Balance:</strong> {fixedCheckedBalance}</div>}
        </div>
      </div>
    </section>
  );
}
