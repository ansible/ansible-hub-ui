import { i18n } from '@lingui/core';
import { Constants } from 'src/constants';

// Locked roles description can't be translated on the API
// To solve this problem, description for the locked roles
// must be hardcoded into the UI
export const translateLockedRolesDescription = (name, desc) =>
  Constants.LOCKED_ROLES_WITH_DESCRIPTION[name]
    ? i18n._(Constants.LOCKED_ROLES_WITH_DESCRIPTION[name])
    : desc;
