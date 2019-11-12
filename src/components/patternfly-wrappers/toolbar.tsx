import * as React from 'react';

import {
    Toolbar as ToolbarPF,
    ToolbarGroup,
    ToolbarItem,
    TextInput,
    InputGroup,
    Button,
    ButtonVariant,
} from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';
import { Sort } from '../../components';

interface IProps {
    params: {
        sort?: string;
        keywords?: string;
    };

    sortOptions?: {
        id: string;
        title: string;
    }[];

    updateParams: (params) => void;
    searchPlaceholder: string;
    extraInputs?: React.ReactNode[];
}

interface IState {
    kwField: string;
}

export class Toolbar extends React.Component<IProps, IState> {
    static defaultProps = {
        extraInputs: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            kwField: props.params.keywords || '',
        };
    }

    render() {
        const {
            params,
            sortOptions,
            updateParams,
            searchPlaceholder,
            extraInputs,
        } = this.props;
        const { kwField } = this.state;
        return (
            <ToolbarPF>
                <ToolbarGroup>
                    <ToolbarItem>
                        <InputGroup>
                            <TextInput
                                value={kwField}
                                onChange={k => this.setState({ kwField: k })}
                                onKeyPress={e => this.handleEnter(e)}
                                type='search'
                                aria-label='search text input'
                                placeholder={searchPlaceholder}
                            />
                            <Button
                                variant={ButtonVariant.control}
                                aria-label='search button'
                                onClick={() => this.submitKeywords()}
                            >
                                <SearchIcon />
                            </Button>
                        </InputGroup>
                    </ToolbarItem>
                </ToolbarGroup>
                {sortOptions && (
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Sort
                                options={sortOptions}
                                params={params}
                                updateParams={updateParams}
                            />
                        </ToolbarItem>
                    </ToolbarGroup>
                )}
                {extraInputs.map((v, i) => (
                    <ToolbarGroup key={i}>
                        <ToolbarItem>{v}</ToolbarItem>
                    </ToolbarGroup>
                ))}
            </ToolbarPF>
        );
    }

    private handleEnter(e) {
        if (e.key === 'Enter') {
            this.submitKeywords();
        }
    }

    private submitKeywords() {
        this.props.updateParams(
            ParamHelper.setParam(
                this.props.params,
                'keywords',
                this.state.kwField,
            ),
        );
    }
}
