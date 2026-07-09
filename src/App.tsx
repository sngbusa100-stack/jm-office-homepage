import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/AppRouter';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRouter />
    </BrowserRouter>
  );
}
