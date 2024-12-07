import { RouterProvider } from 'react-router';
import withProviders from './providers';

import './styles/global.scss';

export function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default withProviders(App);
