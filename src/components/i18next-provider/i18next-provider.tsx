import React, { useEffect, useState } from 'react';
import { loadTranslations } from 'src/l10n';
import { LoadingPageSpinner } from '..';

export const I18nextProvider = (props) => {
  const [translations, setTranslations] = useState(false);

  useEffect(() => {
    loadTranslations().then(() => {
      setTranslations(true);
    });
  }, []);

  if (translations) {
    return <div>{props.children}</div>;
  } else {
    return <LoadingPageSpinner />;
  }
};
