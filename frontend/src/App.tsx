import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { sdk } from '@farcaster/miniapp-sdk';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateRaffle } from './pages/CreateRaffle';
import { RafflePage } from './pages/RafflePage';
import { History } from './pages/History';

function App() {
  useEffect(() => {
    // Signal to Mini App host that the app is ready
    try {
      sdk.actions.ready();
    } catch (error) {
      // Silently fail if not in Mini App context
      console.log('Mini App SDK not available:', error);
    }
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateRaffle />} />
        <Route path="/raffle/:id" element={<RafflePage />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Layout>
  );
}

export default App;
