import { RouterProvider } from 'react-router';
import { router } from './routing';

import './styles/global.scss';

export function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
