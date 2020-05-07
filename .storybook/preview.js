import { addDecorator, addParameters } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

// This ensures that the patternfly CSS is correctly loaded on all the stories
import '@patternfly/patternfly/patternfly.css';

addDecorator(withInfo);
addParameters({ info: { inline: true } });
