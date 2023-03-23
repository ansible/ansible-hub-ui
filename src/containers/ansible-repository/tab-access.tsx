import React from 'react';
import { AnsibleRepositoryType } from 'src/api';
import { Details } from 'src/components';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: { addAlert: (alert) => void; state: { params } };
}

export const AccessTab = ({ item }: TabProps) => <Details item={item} />;
