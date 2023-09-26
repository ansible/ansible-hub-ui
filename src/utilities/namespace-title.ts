import { Constants } from 'src/constants';

export function namespaceTitle({
  name,
  company,
}: {
  name: string;
  company?: string;
}): string {
  return DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
    ? company || name
    : name;
}
