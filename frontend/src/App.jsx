import { AuthProvider } from './context/AuthContext';

// TODO: React Router setup, routes per page module

function App() {
  return (
    <AuthProvider>
      <div>TransitOps</div>
    </AuthProvider>
  );
}

export default App;
