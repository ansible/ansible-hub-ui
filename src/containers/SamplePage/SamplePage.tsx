import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './sample-page.scss';

import {
    Section,
    Main,
    PageHeader,
    PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';

import { Button } from '@patternfly/react-core';

import { SampleComponent } from '../../components/SampleComponent/sample-component';

/**
 * A smart component that handles all the api calls and data needed by the dumb components.
 * Smart components are usually classes.
 *
 * https://reactjs.org/docs/components-and-props.html
 * https://medium.com/@thejasonfile/dumb-components-and-smart-components-e7b33a698d43
 */

interface IProps extends RouteComponentProps {}

class SamplePage extends React.Component<IProps, {}> {
    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title="Sample Insights App" />
                    <p> This is page header text </p>
                </PageHeader>
                <Main>
                    <h1> Sample Component </h1>
                    <SampleComponent> Sample Component </SampleComponent>
                    <h1> Cards </h1>
                    <h1> Buttons </h1>
                    <Section type="button-group">
                        <Button variant="primary">
                            {' '}
                            PF-Next Primary Button{' '}
                        </Button>
                        <Button variant="secondary">
                            {' '}
                            PF-Next Secondary Button{' '}
                        </Button>
                        <Button variant="tertiary">
                            {' '}
                            PF-Next Tertiary Button{' '}
                        </Button>
                        <Button variant="danger">
                            {' '}
                            PF-Next Danger Button{' '}
                        </Button>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(SamplePage);
