export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-4xl font-extrabold text-blue-400 mb-4">
        Welcome to the dApp Vulnerability Demonstrator
      </h2>
      <p className="text-lg text-gray-300 mb-2">
        This application provides interactive examples of common smart contract vulnerabilities.
      </p>
      <p className="text-lg text-gray-400">
        Use the navigation bar above to select a vulnerability to explore.
      </p>
    </div>
  );
}