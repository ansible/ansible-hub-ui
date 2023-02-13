import { t } from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';

export function I18nextTest() {
  const simple = 'simple';
  const evil = 'Note: Foo bar baz.!?@#$%^&*()_+-=/\\"\'`';
  const html = '<b>Foo</b>&quot;';
  const translated = t('Params');
  const A = () => <>A</>;
  const B = () => <>B</>;

  return (
    <table className='pf-c-table'>
      <tr>
        <th colSpan={2}>t</th>
      </tr>
      <tr>
        <th>Hello World</th>
        <td>{t('Hello World')}</td>
      </tr>
      <tr>
        <th>{'Note: Foo bar baz.!?@#$%^&*()_+-=/\\"\'`'}</th>
        <td>{t('Note: Foo bar baz.!?@#$%^&*()_+-=/\\"\'`')}</td>
        <th>ERROR(pseudo,fr)</th>
      </tr>
      <tr>
        <th>{'<b>Foo</b>&quot;'}</th>
        <td>{t('<b>Foo</b>&quot;')}</td>
      </tr>
      <tr>
        <th>t("foo" + "bar") (missing)</th>
        <td>{t('foo' + 'bar')}</td>
      </tr>

      <tr>
        <th colSpan={2}>t + params</th>
      </tr>
      <tr>
        <th>Hello {simple}</th>
        <td>{t('Hello {{simple}}', { simple })}</td>
      </tr>
      <tr>
        <th>Hello {evil}</th>
        <td>{t('Hello {{evil}}', { evil })}</td>
      </tr>
      <tr>
        <th>Hello {html}</th>
        <td>{t('Hello {{html}}', { html })}</td>
      </tr>
      <tr>
        {/* not expected to work w/ plain t */}
        <th>Hello {<b>Foo</b>} (react)</th>
        <td>{t('Hello {{react}}', { react: <b>Foo</b> })}</td>
      </tr>
      <tr>
        <th>Hello {5 + 4} (expr)</th>
        <td>{t('Hello {{expr}}', { expr: 5 + 4 })}</td>
      </tr>
      <tr>
        <th>Hello {translated} (translated)</th>
        <td>{t('Hello {{translated}}', { translated })}</td>
      </tr>

      <tr>
        <th colSpan={2}>Trans</th>
      </tr>
      <tr>
        <th>Hello World</th>
        <td>
          <Trans>Hello World</Trans>
        </td>
      </tr>
      <tr>
        <th>Note: Foo bar baz.!?@#$%^&*()_+-=/\"'`</th>
        <td>
          <Trans>Note: Foo bar baz.!?@#$%^&*()_+-=/\"'`</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        {/* good diff from t */}
        <th>
          <b>Foo</b>&quot;
        </th>
        <td>
          <Trans>
            <b>Foo</b>&quot;
          </Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>

      <tr>
        <th colSpan={2}>Trans + params</th>
      </tr>
      <tr>
        <th>Hello {simple}</th>
        <td>
          <Trans>Hello {simple}</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        <th>Hello {evil}</th>
        <td>
          <Trans>Hello {evil}</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        <th>Hello {html}</th>
        <td>
          <Trans>Hello {html}</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        <th>Hello {<b>Foo</b>} (react)</th>
        <td>
          <Trans>Hello {<b>Foo</b>}</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        <th>Hello {5 + 4} (expr)</th>
        <td>
          <Trans>Hello {5 + 4}</Trans>
        </td>
        <th>ERROR</th>
      </tr>
      <tr>
        <th>Hello {translated} (translated)</th>
        <td>
          <Trans>Hello {translated}</Trans>
        </td>
        <th>ERROR(fr)</th>
      </tr>
      <tr>
        <th>en:'aAbBc', fr:'cBdAa' (ordering)</th>
        <td>
          <Trans>
            a<A />b<B />c
          </Trans>
        </td>
      </tr>
    </table>
  );
}
