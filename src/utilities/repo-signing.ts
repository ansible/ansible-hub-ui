import { SignContainersAPI } from 'src/api';

import { waitForTaskUrl } from 'src/utilities';

import { t } from '@lingui/macro';

export class RepoSigningUtils {
  public static getContainerPulpType(item) {
    const pulp_types = item.pulp.repository.pulp_type.split('.');
    if (pulp_types.length > 1) {
      return pulp_types[1];
    } else {
      return '';
    }
  }

  public static sign(item, context, addAlert, reload) {
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

    const service = context.settings.GALAXY_CONTAINER_SIGNING_SERVICE;
    SignContainersAPI.getSigningService(service)
      .then((result) => {
        const pulp_href = result.data.results[0]['pulp_href'];
        return SignContainersAPI.sign(
          item.pulp.repository.id,
          RepoSigningUtils.getContainerPulpType(item),
          pulp_href,
          item.pulp.distribution.base_path,
        ).then((result) => {
          addAlert({
            variant: 'success',
            title: t`Signing started for container "${item.name}".`,
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
