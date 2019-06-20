import React from 'react';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';

const ListRules = () => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title='Rules Page'/>
                <p> The is the route to the rules page </p>
            </PageHeader>
            <Main>
                <p> Content </p>
            </Main>
        </React.Fragment>
    );
};

ListRules.displayName = 'list-rules';

export default ListRules;
