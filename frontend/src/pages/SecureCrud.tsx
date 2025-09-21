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
    <section className="p-8 bg-gray-800 rounded-lg shadow-xl text-gray-200">
      <h2 className="text-3xl font-bold text-green-400 mb-2">✅ Secure CRUD Example</h2>
      <p className="text-lg mb-6 text-gray-400">
        This is a secure example of a CRUD (Create, Read, Update, Delete) contract.
      </p>
      <p className="mb-6 font-semibold text-xl">
        Next Record ID: <span className="text-green-300">{nextId?.toString()}</span>
      </p>

      {/* CREATE/UPDATE SECTION */}
      <div className="bg-gray-700 p-6 rounded-lg mb-6">
        <h3 className="text-2xl font-bold mb-4">Create/Update Record</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-3 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 p-3 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Create
          </button>
          <button
            onClick={handleUpdate}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Update
          </button>
        </div>
      </div>

      {/* READ/DELETE SECTION */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Read/Delete Record</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            className="flex-1 p-3 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleRead}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Read
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
        {readResult && (
          <div className="bg-gray-600 p-4 rounded-md mt-4">
            <strong className="text-gray-300">Read Result:</strong>
            <ul className="list-none p-0 mt-2">
              <li>ID: <span className="text-yellow-300">{readResult[0]?.toString()}</span></li>
              <li>Title: <span className="text-yellow-300">{readResult[1]}</span></li>
              <li>Description: <span className="text-yellow-300">{readResult[2]}</span></li>
            </ul>
          </div>
        )}
      </div>

      {/* TRANSACTION STATUS SECTION */}
      <div className="mt-6 text-center">
        {hash && <div className="text-sm text-gray-400 break-words mb-2">Tx Hash: <span className="text-yellow-400">{hash}</span></div>}
        {isConfirming && <div className="text-blue-400 animate-pulse">Confirming transaction...</div>}
        {isConfirmed && <div className="text-green-400">Transaction confirmed.</div>}
      </div>
    </section>
  );
}