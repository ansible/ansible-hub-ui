import React from 'react';
import PropTypes from 'prop-types';
import {
    PageHeader,
    PageHeaderTitle,
    Main,
} from '@redhat-cloud-services/frontend-components';

const ViewRule = props => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title="Rules Page" />
                <p> {props.match.params.id} </p>
            </PageHeader>
            <Main>
                <p> content </p>
            </Main>
        </React.Fragment>
    );
};

ViewRule.displayName = 'view-rule';

ViewRule.propTypes = {
    match: PropTypes.object,
};

export default ViewRule;
