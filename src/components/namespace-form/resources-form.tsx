import { t } from '@lingui/macro';
import React from 'react';
import { NamespaceType } from 'src/api';
import { MarkdownEditor } from '..';
import './namespace-form.scss';

const placeholder = `## Custom resources

You can use this page to add any resources which you think might help your \
users automate all the things.

Consider using it for:

- Links to blog posts
- Training resources
- Documentation
- Cat gifs? If that's your thing :)
`;

interface IProps {
  namespace: NamespaceType;

  updateNamespace: (data) => void;
}

export const ResourcesForm = ({ namespace, updateNamespace }: IProps) => (
  <MarkdownEditor
    text={namespace.resources}
    placeholder={placeholder}
    helperText={t`You can can customize the Resources tab on your profile by entering custom markdown here.`}
    updateText={(resources) => updateNamespace({ ...namespace, resources })}
    editing={true}
  />
);
