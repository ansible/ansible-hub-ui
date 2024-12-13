import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  DropdownItem,
  DropdownSeparator,
} from '@patternfly/react-core/deprecated';
import { StatefulDropdown } from 'src/components';
import { availableLanguages, language, languageNames } from 'src/l10n';

export function LanguageSwitcher(_props) {
  const currentLanguage = languageNames[language] || language;

  return (
    <StatefulDropdown
      ariaLabel={t`Select language`}
      data-cy='language-dropdown'
      defaultText={currentLanguage}
      toggleType='icon'
      items={[
        <DropdownItem isDisabled key='current'>
          {window.localStorage.override_l10n ? (
            <Trans>{currentLanguage} (current)</Trans>
          ) : (
            <Trans>{currentLanguage} (browser default)</Trans>
          )}
        </DropdownItem>,
        <DropdownSeparator key='separator1' />,
        ...availableLanguages.map((lang) => (
          <DropdownItem
            key={lang}
            href={`?lang=${lang}`}
            isDisabled={lang === language}
          >
            {languageNames[lang] || lang}
          </DropdownItem>
        )),
        <DropdownSeparator key='separator2' />,
        <DropdownItem
          key='current'
          href='?lang='
          isDisabled={!window.localStorage.override_l10n}
        >
          <Trans>Reset to browser defaults</Trans>
        </DropdownItem>,
      ]}
    />
  );
}
