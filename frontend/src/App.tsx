import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { SecureCrudPage } from './pages/SecureCrud';
import { SC04_LackOfInputValidationPage } from './pages/SC04_LackOfInputValidation';
import { SC08_IntegerOverflowAndUnderflowPage } from './pages/SC08_IntegerOverflowAndUnderflow';
import { useAccount } from 'wagmi';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8">
      {/* This is the new container for the main content */}
      <div className="sticky top-20 w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-2xl">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            {isConnected && (
              <>
                <Route path="secure-crud" element={<SecureCrudPage />} />
                <Route path="sc04-lack-of-input-validation" element={<SC04_LackOfInputValidationPage />} />
                <Route path="sc08-integer-overflow-and-underflow" element={<SC08_IntegerOverflowAndUnderflowPage />} />
              </>
            )}
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;