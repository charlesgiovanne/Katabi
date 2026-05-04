import './index.css';
import { useAppStore } from './store/UseAppStore';
import { LoginPage } from './pages/LoginPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  const screen = useAppStore(s => s.screen);

  return (
    <>
      {screen === 'login' && <LoginPage />}
      {screen === 'channels' && <ChannelsPage />}
      {screen === 'chat' && <ChatPage />}
    </>
  );
}
