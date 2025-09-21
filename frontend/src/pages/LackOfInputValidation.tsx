import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../main';

// ABI for the vulnerable contract
const vulnerableCrudABI = [{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"reputation","type":"uint256"}],"name":"setReputation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userReputation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

// Deployed contract address
const vulnerableContractAddress = import.meta.env.VITE_VULNERABLE_CRUD_ADDRESS as `0x${string}`;


export function LackOfInputValidationPage() {
  const { writeContract } = useWriteContract();
  const [targetUser, setTargetUser] = useState('');
  const [reputation, setReputation] = useState('0');
  const [checkUser, setCheckUser] = useState('');
  const [checkedReputation, setCheckedReputation] = useState<string | null>(null);

  const handleSetReputation = () => {
    if (!targetUser) return;
    writeContract({
      address: vulnerableContractAddress,
      abi: vulnerableCrudABI,
      functionName: 'setReputation',
      args: [targetUser as `0x${string}`, BigInt(reputation)],
    });
  };

  const handleCheckReputation = async () => {
    try {
      if (!checkUser) return;
      const result = await readContract(config, {
        address: vulnerableContractAddress,
        abi: vulnerableCrudABI,
        functionName: 'userReputation',
        args: [checkUser as `0x${string}`],
      });
      setCheckedReputation(result.toString());
    } catch (error) {
      console.error("Error reading reputation:", error);
      setCheckedReputation("Error or user not found");
    }
  };

  return (
    <div style={{ border: '1px solid red', padding: '1rem', marginTop: '1rem' }}>
      <h3>SC04:2025 - Lack of Input Validation</h3>
      <p>This contract allows any user to set the reputation for any other user, without validating that the caller is authorized. You can set the reputation for any address, including your own or another user's.</p>
      <div>
        <h4>Set Reputation (Insecure)</h4>
        <input type="text" placeholder="Target User Address" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} style={{ width: '300px' }}/>
        <input type="number" placeholder="Reputation" value={reputation} onChange={(e) => setReputation(e.target.value)} />
        <button onClick={handleSetReputation}>Set Reputation</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h4>Check Reputation</h4>
        <input type="text" placeholder="User Address to Check" value={checkUser} onChange={(e) => setCheckUser(e.target.value)} style={{ width: '300px' }} />
        <button onClick={handleCheckReputation}>Check Reputation</button>
        {checkedReputation !== null && <div><strong>Reputation:</strong> {checkedReputation}</div>}
      </div>
    </div>
  );
}
