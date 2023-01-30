import { t } from '@lingui/macro';
import { downloadString } from 'src/utilities';
import { Action } from './action';

export const ansibleRemoteDownloadRequirementsAction = Action({
  title: t`Download requirements YAML`,
  onClick: ({ requirements_file }) =>
    downloadString(requirements_file, 'requirements.yml'),
  visible: ({ requirements_file }) => !!requirements_file,
});
