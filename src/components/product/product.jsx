import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import Constraints from '@commercetools-uikit/constraints';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useProductsFetcher } from '../../hooks/use-products-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import Card from '@commercetools-uikit/card';
import { Tag } from '@commercetools-uikit/tag';
import Stamp from '@commercetools-uikit/stamp';

const getSeverityTone = (severity) => {
  switch (severity.toLowerCase()) {
    case 'error':
      return 'critical';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information';
    default:
      return 'primary';
  }
};


const columns = [
  { key: 'severity', label: 'Severity Level' },
  { key: 'field', label: 'Product Attribute' },
  { key: 'message', label: 'Validation Message' },
];

const Product = () => {

  let productId = undefined;
  const { hostUrl } = useCustomViewContext((context) => ({
    hostUrl: context.hostUrl,
  }));

  if (hostUrl) {
 
    const splittedUrl = hostUrl.split('/');
    const productsIndex = splittedUrl.indexOf('products');   
    if (productsIndex >= 0) {
      if (splittedUrl[productsIndex + 1]) {
        productId = splittedUrl[productsIndex + 1];
      }
  }
}



  const intl = useIntl();
  const user = useApplicationContext((context) => context.user);
  const dataLocale = useApplicationContext((context) => context.dataLocale);
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { productData,error,loading } =  useProductsFetcher(productId);








  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (loading) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  const attributes = productData.product.masterData.staged.masterVariant.attributesRaw;
  const validationAttribute = attributes.find(attr => attr.name === "validation");

  if (validationAttribute) {
      console.log("Validation attribute:", validationAttribute.value);
  } else {
      console.log("Validation attribute not found");
}

let isValid = true;
let validationErrors =[];
if (validationAttribute) {
  try {
    console.log("validationAttribute value " + validationAttribute.value);
       // Check if validationAttribute.value is already an object
       const validationData = typeof validationAttribute.value === 'string' 
       ? JSON.parse(validationAttribute.value) 
       : validationAttribute.value;
     
     isValid = validationData.isValid || false;
     validationErrors = validationData.errors || [];

  } catch (e) {
    console.error("Error parsing validation data:", e);
  }
}
// console.log("validationErrors " + JSON.stringify(validationErrors));


  return (
    <Spacings.Stack scale="xl">
<Card theme="light">
      <Spacings.Stack scale="m">
        <Text.Headline as="h2" intlMessage={messages.title} />
        <Constraints.Horizontal max={10}>
        <Card theme={isValid ? "positive" : "critical"}>
          <Spacings.Inline alignItems="center" justifyContent="space-between">
            <Text.Subheadline as="h4" tone="primary" truncate={true}>
              Product Status
            </Text.Subheadline>
            <Stamp
              tone={isValid ? "positive" : "critical"}
              label={isValid ? "VALID" : "INVALID"}
            />
          </Spacings.Inline>
        </Card>
        </Constraints.Horizontal>
        {!isValid && (
          <Text.Detail tone="critical">
            Please review and correct the product data.
          </Text.Detail>
        )}
      </Spacings.Stack>
    </Card>

      {loading && <LoadingSpinner />}

      {productData ? (
       <Spacings.Stack scale="xl">
     <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>
       
       {!isValid && validationErrors.length > 0 && (
         <Card>
           <Spacings.Stack scale="m">
             <Text.Subheadline as="h4">Validation Errors</Text.Subheadline>
             <DataTable
               isCondensed
               columns={columns}
               rows={validationErrors.map((error, index) => ({
                ...error,
                id: `error-${index}` // Add a unique id to each row
              }))}
               itemRenderer={(item, column) => {
                 switch (column.key) {
                  case 'severity':
                    return (
                      <Stamp
                        tone={getSeverityTone(item.severity)}
                        label={item.severity.toUpperCase()}
                      />
                    );
                   case 'field':
                     return item.field;
                   case 'message':
                     return item.message;
                   default:
                     return null;
                 }
               }}
             />
           </Spacings.Stack>
         </Card>
       )}
     </Spacings.Stack>
      ) : null}
    </Spacings.Stack>
  );
};
Product.displayName = 'Product Validation';

export default Product;
