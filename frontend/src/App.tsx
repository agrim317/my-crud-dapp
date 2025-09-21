import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { SecureCrudPage } from './pages/SecureCrud';
import { LackOfInputValidationPage } from './pages/LackOfInputValidation';
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
            <Route path="lack-of-input-validation" element={<LackOfInputValidationPage />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default App;