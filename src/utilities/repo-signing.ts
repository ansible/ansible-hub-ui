import { SignContainersAPI } from 'src/api';

import { waitForTaskUrl } from 'src/utilities';

import { t } from '@lingui/macro';

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

  public static getContainerPulpType(item) {
    const pulp_types = item.pulp.repository.pulp_type.split('.');
    if (pulp_types.length > 1) {
      return pulp_types[1];
    } else {
      return '';
    }
  }

  public static getSignature(item, addAlert) {
    return SignContainersAPI.getSignature(
      item.pulp.repository.pulp_id,
      item.pulp.repository.version,
      RepoSigningUtils.getContainerPulpType(item),
    ).catch((ex) => {
      addAlert({
        variant: 'danger',
        title: t`API Error: ${ex}`,
        description: t`Failed to load signature of ${item.name} v ${item.pulp.repository.version}.`,
      });
    });
  }

  public static sign(item, addAlert, reload) {
    if (
      item.pulp.repository.remote &&
      Object.keys(item.pulp.repository.remote.last_sync_task || {}).length == 0
    ) {
      addAlert({
        variant: 'danger',
        description: t`Container must be synchronized with remote repository first.`,
        title: t`Failed to sign the container version.`,
      });
      return;
    }

    RepoSigningUtils.getSignature(item, addAlert)
      .then((result) => {
        return SignContainersAPI.sign(
          item.pulp.repository.pulp_id,
          RepoSigningUtils.getContainerPulpType(item),
          result.data.signServicePath,
        ).then((result) => {
          addAlert({
            id: 'loading-signing',
            variant: 'success',
            title: t`Signing started for container "${item.name} v${item.pulp.repository.version}".`,
          });
          return waitForTaskUrl(result.data.task).then(() => {
            if (reload) {
              reload();
            }
          });
        });
      })
      .catch((ex) => {
        addAlert({
          variant: 'danger',
          description: t`API Error: ${ex}`,
          title: t`Failed to sign the container version.`,
        });
      });
  }
}
