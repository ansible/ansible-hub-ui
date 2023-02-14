import { t } from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';

export function I18nextTest() {
  const name = 'Foo';
  const number = 5;

  const truthy = true;
  const falsy = false;

  const Foobar = (p) => (
    <pre style={{ display: 'inline-block' }}>{JSON.stringify(p)}</pre>
  );

  const bad = '❌';
  const missing = 'missing';

  const rows = [
    <b>translated (current)</b>,
    t('Hello World!'),
    t('Hello {{name}}', { name }),
    t('Hello #{{number}}', { number }),
    t`Hello World?`,
    t('{{count}} bytes', { count: 1 }),
    <Trans>Rello0 world!</Trans>,
    <Trans>Rello1 {{ name }}</Trans>,
    <Trans>Rello2 {{ number }}</Trans>,
    <Trans>Rello3 {{ expr: 5 + 4 }}</Trans>,
    <Trans>Rello4 {{ expr: String(5 + 4) }}</Trans>,
    <Trans>Rello5 {String(5 + 4)}</Trans>,
    <Trans>Rello6 {5 + 4}</Trans>,
    <Trans>
      Rello7 {truthy && <Foobar true={truthy} />}
      {falsy && <Foobar false={falsy} />}
    </Trans>,
    <Trans>
      Rello8 <Foobar baz='quux' /> <Foobar n={1} />
    </Trans>,
    <Trans>Rello9 {{ expr: <Foobar /> }}</Trans>,
    t('definitely' + missing),
    t('\\"'),
    <Trans>\t</Trans>,
    <Trans>foo&quot;</Trans>,
  ];

  const labels = [
    <b>original</b>,
    'Hello World!',
    'Hello {{name}}',
    'Hello #{{number}}',
    'Hello World?',
    '{{count}} bytes',
    'Rello0 world!',
    'Rello1 {{ name }}',
    'Rello2 {{ number }}',
    'Rello3 {{ expr: 5 + 4 }}',
    'Rello4 {{ expr: String(5 + 4) }}',
    bad + 'Rello5 {String(5 + 4)}',
    bad + 'Rello6 {5 + 4}',
    bad +
      'Rello7 {truthy && <Foobar true={truthy} />}{falsy && <Foobar false={falsy} />}',
    "Rello8 <Foobar baz='quux' /> <Foobar n={1} />",
    bad + 'Rello9 {{expr: <Foobar />}}',
    bad + "'definitely' + missing",
    `t('\\\\"')`,
    `<Trans>\\t</Trans>`,
    'foo&quot;',
  ];

  const extractedKeys = [
    <b>extracted keys</b>,
    'Hello World!',
    'Hello {{name}}',
    'Hello #{{number}}',
    'Hello World?',
    <>
      {'{{count}} bytes_one'}
      <br />
      {'{{count}} bytes_other'}
    </>,
    'Rello0 world!',
    'Rello1 {{name}}',
    'Rello2 {{number}}',
    'Rello3 {{expr}}',
    'Rello4 {{expr}}',
    'Rello5 {String(5 + 4)}',
    'Rello6 {5 + 4}',
    'Rello7 {truthy && <Foobar true={truthy} />}{falsy && <Foobar false={falsy} />}',
    'Rello8 <1></1> <3></3>',
    'Rello9 {{expr}}',
    '',
    bad + '\\"',
    bad + '\\t',
    bad + 'foo&quot;',
  ];

  const extractedValues = [
    <b>extracted translations</b>,
    '',
    '',
    '',
    '',
    '',
    bad + 'Rello0 world!',
    bad + 'Rello1 {{name}}',
    bad + 'Rello2 {{number}}',
    bad + 'Rello3 {{expr}}',
    bad + 'Rello4 {{expr}}',
    bad + 'Rello5 {String(5 + 4)}',
    bad + 'Rello6 {5 + 4}',
    bad +
      'Rello7 {truthy && <Foobar true={truthy} />}{falsy && <Foobar false={falsy} />}',
    bad + 'Rello8 <1></1> <3></3>',
    bad + 'Rello9 {{expr}}',
    '',
    '',
    bad + '\\t',
    bad + 'foo&quot;',
  ];

  const translatedEn = [
    <b>translated.default</b>,
    'Hello World!',
    'Hello Foo',
    'Hello #5',
    'Hello World?',
    '1 bytes',
    'Rello0 world!',
    'Rello1 Foo',
    'Rello2 5',
    'Rello3 9',
    'Rello4 9',
    'Rello5 9',
    bad + 'Rello6 ',
    'Rello7 {"true":true}',
    'Rello8 {"baz":"quux"} {"n":1}',
    bad + 'Rello9 [object Object]',
    'definitelymissing',
    '\\"',
    '\\t',
    'foo"',
  ];

  const translatedPseudo = [
    <b>translated.pseudo</b>,
    '»Hello World!«',
    '»Hello Foo«',
    '»Hello #5«',
    '»Hello World?«',
    bad + '»1 bytes_one«',
    '»Rello0 world!«',
    '»Rello1 Foo«',
    '»Rello2 5«',
    '»Rello3 9«',
    '»Rello4 9«',
    bad + 'Rello5 9',
    bad + 'Rello6 ',
    bad + 'Rello7 {"true":true}',
    '»Rello8 {"baz":"quux"} {"n":1}«',
    bad + '»Rello9 [object Object]«",',
    bad + 'definitelymissing',
    bad + '\\"',
    bad + '\\t',
    bad + 'foo"',
  ];

  const translatedFr = [
    <b>translated.fr</b>,
    'Bonjour World!',
    'Bonjour Foo',
    'Bonjour #5',
    'Bonjour World?',
    '1 octobit',
    'Ronjour0 world!',
    'Ronjour1 Foo',
    'Ronjour2 5',
    'Ronjour3 9',
    'Ronjour4 9',
    bad + 'Rello5 9',
    bad + 'Rello6 ',
    bad + 'Rello7 {"true":true}',
    'Ronjour8 {"n":1} {"baz":"quux"}',
    bad + 'Ronjour9 [object Object]',
    bad + 'definitelymissing',
    bad + '\\"',
    bad + '\\t',
    bad + 'foo"',
  ];

  const translation = [
    <b>manual fr.json</b>,
    'Bonjour World!',
    'Bonjour {{name}}',
    'Bonjour #{{number}}',
    'Bonjour World?',
    <>
      {'{{count}} octobit'}
      <br />
      {'{{count}} octobites'}
    </>,
    'Ronjour0 world!',
    'Ronjour1 {{name}}',
    'Ronjour2 {{number}}',
    'Ronjour3 {{expr}}',
    'Ronjour4 {{expr}}',
    'Ronjour5 {String(5 + 4)}',
    'Ronjour6 {5 + 4}',
    'Ronjour7 {truthy && <Foobar true={truthy} modified />}{falsy && <Foobar false={falsy} />}',
    'Ronjour8 <3></3> <1></1>',
    'Ronjour9 {{expr}}',
    '',
    'x',
    'y',
    'bar&quot;',
  ];

  return (
    <table className='pf-c-table'>
      <tr>
        <td>{labels.length}</td>
        <td>{rows.length}</td>
        <td>{extractedKeys.length}</td>
        <td>{extractedValues.length}</td>
        <td>{translatedEn.length}</td>
        <td>{translatedPseudo.length}</td>
        <td>{translation.length}</td>
        <td>{translatedFr.length}</td>
      </tr>
      {rows.map((r, i) => (
        <tr key={i}>
          <th>{labels[i]}</th>
          <td>{r}</td>
          <td>{extractedKeys[i]}</td>
          <td>{extractedValues[i]}</td>
          <td>{translatedEn[i]}</td>
          <td>{translatedPseudo[i]}</td>
          <td>{translation[i]}</td>
          <td>{translatedFr[i]}</td>
        </tr>
      ))}
    </table>
  );
}
