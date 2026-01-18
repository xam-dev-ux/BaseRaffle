import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateRaffle } from './pages/CreateRaffle';
import { RafflePage } from './pages/RafflePage';
import { History } from './pages/History';

function App() {
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
