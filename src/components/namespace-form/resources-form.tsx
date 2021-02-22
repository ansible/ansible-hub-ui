import * as React from 'react';
import './namespace-form.scss';

import { NamespaceType } from '../../api';
import { MarkdownEditor } from '..';

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

export class ResourcesForm extends React.Component<IProps, {}> {
  render() {
    const { namespace } = this.props;

    return (
      <MarkdownEditor
        text={namespace.resources}
        placeholder={placeholder}
        helperText={
          'You can can customize the Resources tab on your profile by entering custom markdown here.'
        }
        updateText={value => this.updateResources(value)}
        editing={true}
      />
    );
  }

  private updateResources(data) {
    console.log('Data: ' + data);
    const update = { ...this.props.namespace };
    update.resources = data;
    this.props.updateNamespace(update);
  }
}
