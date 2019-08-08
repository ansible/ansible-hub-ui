import * as React from 'react';

import {
    Toolbar as ToolbarPF,
    ToolbarGroup,
    ToolbarItem,
    TextInput,
} from '@patternfly/react-core';

import { ParamHelper } from '../../utilities/param-helper';
import { Sort } from '../../components';

interface IProps {
    params: object;

    sortOptions: {
        id: string;
        title: string;
    }[];

    updateParams: (params) => void;
    searchPlaceholder: string;
}

interface IState {
    kwField: string;
}

export class Toolbar extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            kwField: '',
        };
    }

    render() {
        const {
            params,
            sortOptions,
            updateParams,
            searchPlaceholder,
        } = this.props;
        const { kwField } = this.state;
        return (
            <ToolbarPF>
                <ToolbarGroup>
                    <ToolbarItem>
                        <TextInput
                            value={kwField}
                            onChange={k => this.setState({ kwField: k })}
                            onKeyPress={e => this.handleEnter(e)}
                            type='search'
                            aria-label='search text input'
                            placeholder={searchPlaceholder}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem>
                        <Sort
                            options={sortOptions}
                            params={params}
                            updateParams={updateParams}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
            </ToolbarPF>
        );
    }

    private handleEnter(e) {
        if (e.key === 'Enter') {
            this.props.updateParams(
                ParamHelper.setParam(
                    this.props.params,
                    'keywords',
                    this.state.kwField,
                ),
            );
        }
    }
}
