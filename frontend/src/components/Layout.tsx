import { Link, Outlet } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function ConnectButton() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    return (
      <div>
        <span>Connected as {address.slice(0, 6)}...{address.slice(-4)}</span>
        <button onClick={() => disconnect()} style={{ marginLeft: '1rem' }}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })} type="button">
          {connector.name}
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>CRUD dApp</h1>
        <ConnectButton />
      </header>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/secure-crud" style={{ marginRight: '1rem' }}>Secure CRUD</Link>
        <Link to="/sc04-lack-of-input-validation" style={{ marginRight: '1rem' }}>Lack of Input Validation</Link>
        <Link to="/sc08-integer-overflow-and-underflow">Integer Overflow and Underflow</Link>
      </nav>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
