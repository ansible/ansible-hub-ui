import React, { useEffect, useState } from 'react';
import { LoadingPageSpinner } from 'src/components';
import { i18nextPromise } from 'src/l10n';

export const HubI18nextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    i18nextPromise.then(
      () => setReady(true),
      () => setReady(true),
    );
  }, []);

  return ready ? <>{children}</> : <LoadingPageSpinner />;
};
