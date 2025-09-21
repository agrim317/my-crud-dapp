import { useAccount, useConnect, useDisconnect } from 'wagmi';

function ConnectButton() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    return (
      <div className="flex items-center space-x-4 text-gray-400">
        <span className="text-sm">
          Connected as {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}

export default ConnectButton;