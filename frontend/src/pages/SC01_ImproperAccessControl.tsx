import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { readContract, getBalance } from 'wagmi/actions';
import { config } from '../main';
import { formatEther } from 'viem';

const vulnerableSC01ABI = [
    {
      "inputs": [],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
];

const fixedSC01ABI = [
    {
      "inputs": [],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
];

const vulnerableContractAddress = import.meta.env.VITE_SC01_VULNERABLE_ADDRESS as `0x${string}`;
const fixedContractAddress = import.meta.env.VITE_SC01_FIXED_ADDRESS as `0x${string}`;

export function SC01_ImproperAccessControlPage() {
  const { address: connectedAddress } = useAccount();

  const [vulnerableInfo, setVulnerableInfo] = useState({ owner: '', balance: '0' });
  const [fixedInfo, setFixedInfo] = useState({ owner: '', balance: '0' });

  const { writeContract: writeVulnerable, data: hashVulnerable, isPending: isPendingVulnerable, isError: isErrorVulnerable, error: errorVulnerable } = useWriteContract();
  const { isLoading: isConfirmingVulnerable, isSuccess: isConfirmedVulnerable } = useWaitForTransactionReceipt({ hash: hashVulnerable });

  const { writeContract: writeFixed, data: hashFixed, isPending: isPendingFixed, isError: isErrorFixed, error: errorFixed } = useWriteContract();
  const { isLoading: isConfirmingFixed, isSuccess: isConfirmedFixed } = useWaitForTransactionReceipt({ hash: hashFixed });

  const fetchContractInfo = async () => {
    try {
      const vulnerableOwner = await readContract(config, { address: vulnerableContractAddress, abi: vulnerableSC01ABI, functionName: 'owner' });
      const vulnerableBalance = await getBalance(config, { address: vulnerableContractAddress });
      setVulnerableInfo({ owner: vulnerableOwner as string, balance: formatEther(vulnerableBalance.value) });

      const fixedOwner = await readContract(config, { address: fixedContractAddress, abi: fixedSC01ABI, functionName: 'owner' });
      const fixedBalance = await getBalance(config, { address: fixedContractAddress });
      setFixedInfo({ owner: fixedOwner as string, balance: formatEther(fixedBalance.value) });
    } catch (error) {
      console.error("Error fetching contract info:", error);
    }
  };

  useEffect(() => {
    fetchContractInfo();
  }, []);

  useEffect(() => {
    if (isConfirmedVulnerable || isConfirmedFixed) {
      fetchContractInfo();
    }
  }, [isConfirmedVulnerable, isConfirmedFixed]);

  const handleVulnerableWithdraw = () => {
    writeVulnerable({ address: vulnerableContractAddress, abi: vulnerableSC01ABI, functionName: 'withdraw' });
  };

  const handleFixedWithdraw = () => {
    writeFixed({ address: fixedContractAddress, abi: fixedSC01ABI, functionName: 'withdraw' });
  };

  return (
    <section>
      <h2>SC01:2025 - Improper Access Control</h2>
      <p>This page demonstrates an improper access control vulnerability, where a critical function lacks proper authorization checks.</p>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
        {/* Vulnerable Contract Demo */}
        <div style={{ border: '1px solid red', padding: '1rem', width: '45%' }}>
          <h3 style={{ color: 'red' }}>🔴 Vulnerable Contract</h3>
          <p>The `withdraw` function in this contract is public and can be called by anyone, allowing them to drain the contract's funds.</p>
          <p><strong>Owner:</strong> {vulnerableInfo.owner}</p>
          <p><strong>Contract Balance:</strong> {vulnerableInfo.balance} ETH</p>
          <button onClick={handleVulnerableWithdraw}>Withdraw Funds</button>
          {isPendingVulnerable && <div>Waiting for transaction...</div>}
          {isConfirmingVulnerable && <div>Confirming transaction...</div>}
          {isConfirmedVulnerable && <div>Transaction confirmed.</div>}
          {isErrorVulnerable && <div style={{ color: 'red' }}>Error: {errorVulnerable?.shortMessage || errorVulnerable?.message}</div>}
        </div>

        {/* Fixed Contract Demo */}
        <div style={{ border: '1px solid green', padding: '1rem', width: '45%' }}>
          <h3 style={{ color: 'green' }}>🟢 Fixed Contract</h3>
          <p>This contract uses OpenZeppelin's `Ownable` to restrict the `withdraw` function to the owner.</p>
          <p><strong>Owner:</strong> {fixedInfo.owner}</p>
          <p><strong>Contract Balance:</strong> {fixedInfo.balance} ETH</p>
          <button onClick={handleFixedWithdraw} disabled={connectedAddress !== fixedInfo.owner}>Withdraw Funds (Owner Only)</button>
          {isPendingFixed && <div>Waiting for transaction...</div>}
          {isConfirmingFixed && <div>Confirming transaction...</div>}
          {isConfirmedFixed && <div>Transaction confirmed.</div>}
          {isErrorFixed && <div style={{ color: 'red' }}>Error: {errorFixed?.shortMessage || errorFixed?.message}</div>}
        </div>
      </div>
    </section>
  );
}
