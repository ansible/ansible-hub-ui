import * as React from 'react';

import { Tab, Tabs as PFTabs } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
    tabs: string[];
    params: { tab?: string };
    updateParams: (params) => void;
}

export class Tabs extends React.Component<IProps> {
    render() {
        const { tabs, params, updateParams } = this.props;
        return (
            <PFTabs
                activeKey={this.getActiveTab()}
                onSelect={(_, key) =>
                    updateParams(
                        ParamHelper.setParam(
                            params,
                            'tab',
                            tabs[key].toLowerCase(),
                        ),
                    )
                }
            >
                {tabs.map((tab, i) => (
                    <Tab key={i} eventKey={i} title={tab} />
                ))}
            </PFTabs>
        );
    }

    private getActiveTab() {
        const { params, tabs } = this.props;
        if (params.tab) {
            const i = tabs.findIndex(
                x => x.toLowerCase() === params.tab.toLowerCase(),
            );

            // If tab is not found, default to the first tab.
            if (i === -1) {
                return 0;
            } else {
                return i;
            }
        } else {
            return 0;
        }
    }
}
