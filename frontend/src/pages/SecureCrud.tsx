import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../main';

// --- TYPE DEFINITIONS ---
type Record = readonly [bigint, string, string];

// --- ABI ---
const secureCrudABI = [{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"createRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"deleteRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nextId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"readRecord","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"records","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"updateRecord","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// Deployed contract address
const secureContractAddress = import.meta.env.VITE_SECURE_CRUD_ADDRESS as `0x${string}`;


export function SecureCrudPage() {
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordId, setRecordId] = useState('');
  const [readResult, setReadResult] = useState<Record | null>(null);

  const { data: nextId, refetch: refetchNextId } = useReadContract({
    address: secureContractAddress,
    abi: secureCrudABI,
    functionName: 'nextId',
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchNextId();
    }
  }, [isConfirmed, refetchNextId]);

  const handleCreate = () => writeContract({ address: secureContractAddress, abi: secureCrudABI, functionName: 'createRecord', args: [title, description] });
  const handleUpdate = () => { if(recordId) writeContract({ address: secureContractAddress, abi: secureCrudABI, functionName: 'updateRecord', args: [BigInt(recordId), title, description] }); };
  const handleDelete = () => { if(recordId) writeContract({ address: secureContractAddress, abi: secureCrudABI, functionName: 'deleteRecord', args: [BigInt(recordId)] }); };
  const handleRead = async () => {
    try {
      if (!recordId) return;
      const result = await readContract(config, { address: secureContractAddress, abi: secureCrudABI, functionName: 'readRecord', args: [BigInt(recordId)] });
      setReadResult(result as Record);
    } catch (error) {
      console.error("Error reading record:", error);
      setReadResult(null);
    }
  };

  return (
    <section>
      <h2>✅ Secure CRUD Example</h2>
      <p>This is a secure example of a CRUD (Create, Read, Update, Delete) contract.</p>
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
