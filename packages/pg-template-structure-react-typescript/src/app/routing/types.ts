import type { IndexRouteObject, NonIndexRouteObject } from 'react-router';

export type RouteObject = Omit<IndexRouteObject, 'children'> | Omit<NonIndexRouteObject, 'children'>;

export type RouteMetaParams = {
  [key: string]: string | undefined;
};

export type RouteMeta = {
  title?: (params: RouteMetaParams) => string;
};

export type RouteHandle = {
  meta?: RouteMeta;
};

export type ExtendedRouteObject = RouteObject & {
  meta?: RouteMeta;
  children?: ExtendedRouteObject[];
  permissions: string[];
};
