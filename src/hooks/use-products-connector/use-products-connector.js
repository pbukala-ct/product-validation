import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProduct from './fetch-product.ctp.graphql';

export const useProductsFetcher = (id) => {
  const { data, error, loading } = useMcQuery(FetchProduct, {
    variables: {
      id: id
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    productData: data,
    error,
    loading,
  };
};
