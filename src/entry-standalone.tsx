import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React from 'react';
import * as ReactDOM from 'react-dom';
import { Trans, useTranslation, withTranslation } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'src/components';
import { Constants } from 'src/constants';
import 'src/l10n';
import App from './loaders/standalone/loader';

// Entrypoint for compiling the app to run in standalone mode
if (!window.location.pathname.includes(UI_BASE_PATH)) {
  // react-router v6 won't redirect to base path by default
  window.history.pushState(null, null, UI_BASE_PATH);
}

function HelloWorld() {
  const { t } = useTranslation();

  function defineTranslation(msg) {
    return msg;
  }

  const name = 'Ansible';
  const componentName = 'Trans';
  const randomText = 'asdasdsdadasdassad';

  const comp = "<a href='#'></a>";
  let result = t('Hello', { name: comp });

  const define = defineTranslation('defined translation, but not translated');
  let something = 'something on my mind';

  let r = t('new string with', { something: something });
  let r2 = t('new string with {something}', { something: something });

  return (
    <div>
      <div>
        {t('3: new string with {something}', { something: something })}
        {t('2: new string with {{something}}', { something: something })}
      </div>
      <div>{t('new string with {{something}}', { something: something })}</div>
      <div>{t('new string test')}</div>
      <Trans i18nKey='transTest4'>
        <div>Here is some component: {{ comp }}</div>
      </Trans>
      <div>{t('Test')}</div>
      <div>{t('Hello', { name: 'Ansible' })}</div>
      <h1>
        {t(
          'This.This is the hello world application: Test for simple translation.',
        )}
      </h1>
      <div>
        Non existing key - should be blank or left alone:{' '}
        {t(
          'non existing key - have to show this text untranslated' + randomText,
        )}
      </div>
      <Trans i18nKey='transTest2'>
        <div>{{ comp }}</div>
      </Trans>
      <Trans i18nKey='transTest'>
        Hello <strong>{{ name }}</strong>: this is {{ componentName }} test.{' '}
        <a href='/'>Empty link</a>
      </Trans>
      <Trans i18nKey='transTest3'>
        <b>Note:</b> Something {{ something }}
      </Trans>

      <div>This should show empty string after={t('empty translation')}</div>
      <div>
        Orders:
        {t('order', { count: 1, ordinal: true })},
        {t('order', { count: 52, ordinal: true })},
        {t('order', { count: 33, ordinal: true })},
        {t('order', { count: 34, ordinal: true })},
      </div>
      <div>
        The system contains {t('role', { count: 1, ordinal: true })}. The system
        contains {t('role', { count: 12, ordinal: true })}. The system contains{' '}
        {t('role', { count: 0, ordinal: true })}.
      </div>
      <div>Constants test: {Constants.STATIC_TRANSLATION_TEST}</div>
    </div>
  );
}

// this base suffix is only needed here, in real scenerio, we will use something like this in component file:
// export default withTranslation()(HelloWorldBase);

class ClassHelloWorldBase extends React.Component {
  render() {
    const name = 'Ansible';
    const componentName = 'Trans';
    const t = this.props['t'];

    return (
      <div>
        ClassHelloWorld component
        -------------------------------------------------------------------------------------------------------
        <h1>
          {t(
            'This.This is the hello world application: Test for simple translation.',
          )}
        </h1>
        <div>
          Non existing key - should be blank or left alone:{' '}
          {t('non existing key - have to show this text untranslated')}
        </div>
        <Trans i18nKey='transTest'>
          Hello <strong>{{ name }}</strong>: this is {{ componentName }} test.{' '}
          <a href='/'>Empty link</a>
        </Trans>
        <div>This should show empty string after={t('empty translation')}</div>
        <div>{t('Escaped code example.')}</div>
        <div>
          Orders:
          {t('order', { count: 1, ordinal: true })},
          {t('order', { count: 52, ordinal: true })},
          {t('order', { count: 33, ordinal: true })},
          {t('order', { count: 34, ordinal: true })},
        </div>
        <div>
          The system contains {t('role', { count: 1, ordinal: true })}. The
          system contains {t('role', { count: 12, ordinal: true })}. The system
          contains {t('role', { count: 0, ordinal: true })}.
        </div>
        <div>Constants test: {Constants.STATIC_TRANSLATION_TEST}</div>
      </div>
    );
  }
}

const ClassHelloWorld = withTranslation()(ClassHelloWorldBase);

ReactDOM.render(
  <React.StrictMode>
    <Router basename={UI_BASE_PATH}>
      <I18nextProvider>
        <I18nProvider i18n={i18n}>
          <HelloWorld />
          <ClassHelloWorld />
          <App />
        </I18nProvider>
      </I18nextProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);
