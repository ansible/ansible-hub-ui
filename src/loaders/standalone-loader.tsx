// import PropTypes from 'prop-types';
import * as React from 'react';
import './app.scss';
import { withRouter, Link } from 'react-router-dom';

import '@patternfly/patternfly/patternfly.scss';
import {
    Page,
    PageHeader,
    PageSidebar,
    Nav,
    NavList,
    NavItem,
    PageSection,
} from '@patternfly/react-core';

import { Routes } from '../Routes';
import RageTater from '../../static/images/awx-spud.gif';
import { Paths } from '../paths';

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
                    <React.Fragment>
                        <img
                            style={{ height: '50px' }}
                            src={RageTater}
                            alt='AWX Spud'
                        />
                        Automation Hub
                    </React.Fragment>
                }
                toolbar='Toolbar'
                avatar=' | Avatar'
                showNavToggle
            />
        );
        const Sidebar = (
            <PageSidebar
                theme='dark'
                nav={
                    <Nav theme='dark'>
                        <NavList>
                            <NavItem>
                                <Link to={Paths.search}>Collections</Link>
                            </NavItem>
                            <NavItem>
                                <Link to={Paths.partners}>Namespaces</Link>
                            </NavItem>
                            <NavItem>
                                <Link to={Paths.myNamespaces}>
                                    My Namespaces
                                </Link>
                            </NavItem>
                        </NavList>
                    </Nav>
                }
            />
        );

        return (
            <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
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
