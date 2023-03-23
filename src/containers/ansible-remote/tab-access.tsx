import React from 'react';
import { AnsibleRemoteType } from 'src/api';
import { Details } from 'src/components';

interface TabProps {
  item: AnsibleRemoteType;
  actionContext: object;
}

export const AccessTab = ({ item }: TabProps) => <Details item={item} />;
