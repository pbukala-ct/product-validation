import { lazy } from 'react';

const Product = lazy(() =>
  import('./product' /* webpackChunkName: "channels" */)
);

export default Product;
