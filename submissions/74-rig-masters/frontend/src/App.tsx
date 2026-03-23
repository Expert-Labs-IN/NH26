import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Inbox } from './pages/Inbox';
import { DetailedEmail } from './pages/DetailedEmail';
import { Calendar } from './pages/Calendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Inbox />} />
          <Route path="email/:id" element={<DetailedEmail />} />
          <Route path="calendar" element={<Calendar />} />
          {/* Fallback routes to Inbox for the mock to feel complete */}
          <Route path="starred" element={<Inbox />} />
          <Route path="sent" element={<Inbox />} />
          <Route path="archive" element={<Inbox />} />
          <Route path="trash" element={<Inbox />} />
          
          {/* Priority routes */}
          <Route path="urgent" element={<Inbox />} />
          <Route path="neutral" element={<Inbox />} />
          <Route path="minimal" element={<Inbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
