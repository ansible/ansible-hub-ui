// import PropTypes from 'prop-types';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Routes } from '../Routes';
import '@patternfly/patternfly/patternfly.scss';
import './app.scss';
import {
    Page,
    PageHeader,
    PageSidebar,
    PageSection,
    PageSectionVariants,
} from '@patternfly/react-core';
import RageTater from '../../static/images/awx-spud.gif';

interface IProps {
    history: any;
}

class App extends React.Component<IProps> {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: true,
        };
    }

    componentDidMount() {}

    render() {
        const Header = (
            <PageHeader
                logo={
                    <img
                        style={{ height: '50px' }}
                        src={RageTater}
                        alt='AWX Spud'
                    />
                }
                toolbar='Toolbar'
                avatar=' | Avatar'
                showNavToggle
                isNavOpen={true}
                onNavToggle={() => null}
            />
        );
        const Sidebar = (
            <PageSidebar nav='Navigation' isNavOpen={true} theme='dark' />
        );

        return (
            <Page header={Header} sidebar={Sidebar}>
                <Routes childProps={this.props} />
            </Page>
        );
    }
}

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(App);
