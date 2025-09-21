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
    <section>
      <h2>SC08:2025 - Integer Overflow and Underflow</h2>
      <p>This page demonstrates an integer overflow and underflow vulnerability. An overflow occurs when an arithmetic operation results in a value that is larger than what can be stored in the variable type. An underflow occurs when the result is smaller than the minimum value.</p>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
        {/* Vulnerable Contract Demo */}
        <div style={{ border: '1px solid red', padding: '1rem', width: '45%' }}>
          <h3 style={{ color: 'red' }}>🔴 Vulnerable Contract</h3>
          <p>This contract uses Solidity version 0.4.17, which does not have built-in overflow/underflow protection.</p>
          <p><strong>Current Balance:</strong> {vulnerableBalance}</p>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: '100px' }} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleIncrementVulnerable}>Increment</button>
            <button onClick={handleDecrementVulnerable} style={{ marginLeft: '1rem' }}>Decrement</button>
          </div>
          {isPendingVulnerable && <div>Waiting for transaction...</div>}
          {isConfirmingVulnerable && <div>Confirming transaction...</div>}
          {isConfirmedVulnerable && <div>Transaction confirmed.</div>}
          {isErrorVulnerable && <div style={{ color: 'red' }}>Error: {errorVulnerable?.shortMessage || errorVulnerable?.message}</div>}
        </div>

        {/* Fixed Contract Demo */}
        <div style={{ border: '1px solid green', padding: '1rem', width: '45%' }}>
          <h3 style={{ color: 'green' }}>🟢 Fixed Contract</h3>
          <p>This contract uses Solidity 0.8+, which has built-in protection against overflow and underflow. It also includes a `require` statement for the decrement function.</p>
          <p><strong>Current Balance:</strong> {fixedBalance}</p>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: '100px' }} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleIncrementFixed}>Increment</button>
            <button onClick={handleDecrementFixed} style={{ marginLeft: '1rem' }}>Decrement</button>
          </div>
          {isPendingFixed && <div>Waiting for transaction...</div>}
          {isConfirmingFixed && <div>Confirming transaction...</div>}
          {isConfirmedFixed && <div>Transaction confirmed.</div>}
          {isErrorFixed && <div style={{ color: 'red' }}>Error: {errorFixed?.shortMessage || errorFixed?.message}</div>}
        </div>
      </div>
    </section>
  );
}
