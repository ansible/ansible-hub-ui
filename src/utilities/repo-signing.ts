import { SignContainersAPI } from 'src/api';

import { waitForTaskUrl } from 'src/utilities';

import { t, Trans } from '@lingui/macro';

export class RepoSigningUtils {
  public static getIdFromPulpHref(pulp_href: string): string {
    const strings = pulp_href.split('/');
    let pulp_id = '';

    if (strings.length >= 1) {
      pulp_id = strings[strings.length - 1];

      if (strings.length >= 2 && strings[strings.length - 1] == '') {
        pulp_id = strings[strings.length - 2];
      }
    }

    return pulp_id;
  }

  public static sign(item, signServicePath, addAlert, reload) {
    debugger;
    SignContainersAPI.sign(item.pulp.repository.pulp_id, signServicePath)
      .then((result) => {
        debugger;
        addAlert({
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for container "${item.name} v${item.pulp.repository.version}".`,
        });
        return waitForTaskUrl(result.data.task).then(() => {
          if (reload) reload();
        });
      })
      .catch((ex) => {
        debugger;
        addAlert({
          variant: 'danger',
          title: t`API Error: ${ex}`,
          description: t`Failed to sign the container version.`,
        });
      });
  }
}
