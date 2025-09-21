import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from './main';

// Define a type for the record returned by the smart contract
type Record = readonly [bigint, string, string];

// Define the types for the props of the CrudInterface component
interface CrudInterfaceProps {
  contractAddress: `0x${string}`;
  address: `0x${string}`;
  disconnect: () => void;
}

// IMPORTANT: Replace with your contract's ABI
const crudContractABI = [{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"createRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"deleteRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nextId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"readRecord","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"records","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"updateRecord","outputs":[],"stateMutability":"nonpayable","type":"function"}];

function App() {
  // IMPORTANT: Replace with your contract's deployed address
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default for Hardhat node

  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    return <CrudInterface contractAddress={contractAddress} address={address} disconnect={disconnect} />;
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

function CrudInterface({ contractAddress, address, disconnect }: CrudInterfaceProps) {
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordId, setRecordId] = useState('');
  const [readResult, setReadResult] = useState<Record | null>(null);

  const { data: nextId, refetch: refetchNextId } = useReadContract({
    address: contractAddress,
    abi: crudContractABI,
    functionName: 'nextId',
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchNextId();
    }
  }, [isConfirmed, refetchNextId]);

  const handleCreate = () => {
    writeContract({
      address: contractAddress,
      abi: crudContractABI,
      functionName: 'createRecord',
      args: [title, description],
    });
  };

  const handleRead = async () => {
    try {
      if (!recordId) return;
      const result = await readContract(config, {
        address: contractAddress,
        abi: crudContractABI,
        functionName: 'readRecord',
        args: [BigInt(recordId)],
      });
      setReadResult(result as Record);
    } catch (error) {
      console.error("Error reading record:", error);
      setReadResult(null);
    }
  };

  const handleUpdate = () => {
    if (!recordId) return;
    writeContract({
      address: contractAddress,
      abi: crudContractABI,
      functionName: 'updateRecord',
      args: [BigInt(recordId), title, description],
    });
  };

  const handleDelete = () => {
    if (!recordId) return;
    writeContract({
      address: contractAddress,
      abi: crudContractABI,
      functionName: 'deleteRecord',
      args: [BigInt(recordId)],
    });
  };

  return (
    <div>
      <h1>CRUD dApp</h1>
      <p>Your Account: {address}</p>
      <button onClick={disconnect}>Disconnect</button>
      <hr />
      <p>Next Record ID: {nextId?.toString()}</p>

      <div>
        <h2>Create/Update Record</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleCreate}>Create</button>
        <p>For Update/Delete, also enter ID below.</p>
      </div>

      <div>
        <h2>Read/Update/Delete Record</h2>
        <input type="text" placeholder="Record ID" value={recordId} onChange={(e) => setRecordId(e.target.value)} />
        <button onClick={handleRead}>Read</button>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
        {readResult && (
          <div>
            <h3>Read Result:</h3>
            <p>ID: {readResult[0]?.toString()}</p>
            <p>Title: {readResult[1]}</p>
            <p>Description: {readResult[2]}</p>
          </div>
        )}
      </div>

      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
    </div>
  );
}

export default App;