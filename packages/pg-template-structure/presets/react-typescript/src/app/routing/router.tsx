import { RoutePath } from 'client/shared';
import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import type { ExtendedRouteObject } from './types';

export const routes: ExtendedRouteObject[] = [
  {
    Component: lazy(() => import('client/pages/Main')),
    path: RoutePath.BASE,
    permissions: [],
  },
];

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {routes.map(({ path, Component }) => (
        <Route
          element={(
            Component && <Component />
          )}
          key={path}
          path={path}
        />
      ))}
    </>,
  ),
);
