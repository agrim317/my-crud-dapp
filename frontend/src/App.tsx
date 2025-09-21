import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { SecureCrudPage } from './pages/SecureCrud';
import { SC04_LackOfInputValidationPage } from './pages/SC04_LackOfInputValidation';
import { SC08_IntegerOverflowAndUnderflowPage } from './pages/SC08_IntegerOverflowAndUnderflow';
import { SC01_ImproperAccessControlPage } from './pages/SC01_ImproperAccessControl';
import { useAccount } from 'wagmi';

function App() {
  const { isConnected } = useAccount();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        {isConnected && (
          <>
            <Route path="secure-crud" element={<SecureCrudPage />} />
            <Route path="sc04-lack-of-input-validation" element={<SC04_LackOfInputValidationPage />} />
            <Route path="sc08-integer-overflow-and-underflow" element={<SC08_IntegerOverflowAndUnderflowPage />} />
            <Route path="sc01-improper-access-control" element={<SC01_ImproperAccessControlPage />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default App;