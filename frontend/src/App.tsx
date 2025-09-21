import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from './main';

// --- TYPE DEFINITIONS ---
type Record = readonly [bigint, string, string];

interface CrudInterfaceProps {
  secureContractAddress: `0x${string}`;
  vulnerableContractAddress: `0x${string}`;
  address: `0x${string}`;
  disconnect: () => void;
}

// --- ABIs ---
const secureCrudABI = [{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"createRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"deleteRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nextId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"readRecord","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"records","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"updateRecord","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const vulnerableCrudABI = [{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"reputation","type":"uint256"}],"name":"setReputation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userReputation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

// --- MAIN APP COMPONENT (Connection Logic) ---
function App() {
  // IMPORTANT: Replace with your deployed contract addresses
  const secureContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default for Hardhat node
  const vulnerableContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Default for Hardhat node

  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    return <CrudInterface secureContractAddress={secureContractAddress} vulnerableContractAddress={vulnerableContractAddress} address={address} disconnect={disconnect} />;
  }

  return (
    <div>
      <h1>Connect to the dApp</h1>
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })} type="button">
          {connector.name}
        </button>
      ))}
    </div>
  );
}

// --- MAIN UI COMPONENT ---
function CrudInterface({ secureContractAddress, vulnerableContractAddress, address, disconnect }: CrudInterfaceProps) {
  return (
    <div>
      <h1>CRUD dApp</h1>
      <p>Your Account: {address}</p>
      <button onClick={disconnect}>Disconnect</button>
      <hr style={{ margin: '2rem 0' }} />

      <SecureCrudDemo contractAddress={secureContractAddress} />

      <hr style={{ margin: '2rem 0' }} />

      <VulnerabilityDemos vulnerableContractAddress={vulnerableContractAddress} />
    </div>
  );
}

// --- SECURE CRUD DEMO ---
function SecureCrudDemo({ contractAddress }: { contractAddress: `0x${string}` }) {
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordId, setRecordId] = useState('');
  const [readResult, setReadResult] = useState<Record | null>(null);

  const { data: nextId, refetch: refetchNextId } = useReadContract({
    address: contractAddress,
    abi: secureCrudABI,
    functionName: 'nextId',
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchNextId();
    }
  }, [isConfirmed, refetchNextId]);

  const handleCreate = () => writeContract({ address: contractAddress, abi: secureCrudABI, functionName: 'createRecord', args: [title, description] });
  const handleUpdate = () => { if(recordId) writeContract({ address: contractAddress, abi: secureCrudABI, functionName: 'updateRecord', args: [BigInt(recordId), title, description] }); };
  const handleDelete = () => { if(recordId) writeContract({ address: contractAddress, abi: secureCrudABI, functionName: 'deleteRecord', args: [BigInt(recordId)] }); };
  const handleRead = async () => {
    try {
      if (!recordId) return;
      const result = await readContract(config, { address: contractAddress, abi: secureCrudABI, functionName: 'readRecord', args: [BigInt(recordId)] });
      setReadResult(result as Record);
    } catch (error) {
      console.error("Error reading record:", error);
      setReadResult(null);
    }
  };

  return (
    <section>
      <h2>✅ Secure CRUD Example</h2>
      <p>Next Record ID: {nextId?.toString()}</p>
      <div>
        <h3>Create/Update Record</h3>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleCreate}>Create</button>
      </div>
      <div>
        <h3>Read/Update/Delete Record</h3>
        <input type="text" placeholder="Record ID" value={recordId} onChange={(e) => setRecordId(e.target.value)} />
        <button onClick={handleRead}>Read</button>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
        {readResult && <div><strong>Read Result:</strong> ID: {readResult[0]?.toString()}, Title: {readResult[1]}, Desc: {readResult[2]}</div>}
      </div>
      {hash && <div>Tx Hash: {hash}</div>}
      {isConfirming && <div>Confirming transaction...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
    </section>
  );
}

// --- VULNERABILITY DEMOS ---
function VulnerabilityDemos({ vulnerableContractAddress }: { vulnerableContractAddress: `0x${string}` }) {
  return (
    <section>
      <h2 style={{ color: 'red' }}>🔴 Vulnerability Demonstrations</h2>
      <LackOfInputValidationDemo contractAddress={vulnerableContractAddress} />
      {/* Other vulnerability demos will go here */}
    </section>
  );
}

function LackOfInputValidationDemo({ contractAddress }: { contractAddress: `0x${string}` }) {
  const { writeContract } = useWriteContract();
  const [targetUser, setTargetUser] = useState('');
  const [reputation, setReputation] = useState('0');
  const [checkUser, setCheckUser] = useState('');
  const [checkedReputation, setCheckedReputation] = useState<string | null>(null);

  const handleSetReputation = () => {
    if (!targetUser) return;
    writeContract({
      address: contractAddress,
      abi: vulnerableCrudABI,
      functionName: 'setReputation',
      args: [targetUser, BigInt(reputation)],
    });
  };

  const handleCheckReputation = async () => {
    try {
      if (!checkUser) return;
      const result = await readContract(config, {
        address: contractAddress,
        abi: vulnerableCrudABI,
        functionName: 'userReputation',
        args: [checkUser],
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

export default App;
