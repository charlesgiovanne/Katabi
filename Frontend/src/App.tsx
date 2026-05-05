import { AppProvider, useApp } from './context/AppContext';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import ChatRoom from './pages/ChatRoom';

function Router() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'landing': return <Landing />;
    case 'lobby':   return <Lobby />;
    case 'chat':    return <ChatRoom />;
    default:        return <Landing />;
  }
}

export default function App() {
  
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
