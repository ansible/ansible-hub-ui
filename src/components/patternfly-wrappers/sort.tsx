import * as React from 'react';
import './sort.scss';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import {
    SortAmountDownIcon,
    SortAmountUpIcon,
    SortAlphaDownIcon,
    SortAlphaUpIcon,
} from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';

export class SortFieldType {
    id: string;
    title: string;
    type: 'numeric' | 'alpha';
}

interface IProps {
    options: SortFieldType[];
    params: object;
    updateParams: (params) => void;
    sortParamName?: string;
}

interface IState {
    isExpanded: boolean;
}

export class Sort extends React.Component<IProps, IState> {
    options: any;
    static defaultProps = {
        sortParamName: 'sort',
    };

    constructor(props) {
        super(props);

        this.state = {
            isExpanded: false,
        };
    }

    private onToggle(isExpanded) {
        this.setState({
            isExpanded,
        });
    }

    private onSelect(name) {
        let isDescending = this.getIsDescending(this.props.params);

        const option = this.props.options.find(i => i.title === name);

        // Alphabetical sorting is inverted in Django, so flip it here to make
        // things match up with the UI.
        if (option.type === 'alpha') {
            isDescending = !isDescending;
        }
        const desc = isDescending ? '-' : '';

        this.setState({ isExpanded: false }, () =>
            this.props.updateParams(
                ParamHelper.setParam(
                    this.props.params,
                    this.props.sortParamName,
                    desc + option.id,
                ),
            ),
        );
    }

    private setDescending() {
        let field = this.getSelected(this.props.params);
        const descending = !this.getIsDescending(this.props.params);

        this.props.updateParams(
            ParamHelper.setParam(
                this.props.params,
                this.props.sortParamName,
                (descending ? '-' : '') + field.id,
            ),
        );
    }

    private getIsDescending(params) {
        const sort = params[this.props.sortParamName];

        // The ?sort= url param is not always guaranteed to be set. If it's
        // not set, return the default
        if (!sort) {
            return true;
        }
        return sort.startsWith('-');
    }

    private getSelected(params) {
        let sort = params[this.props.sortParamName];
        const def = this.props.options[0];

        if (!sort) {
            return def;
        }

        if (sort.startsWith('-')) {
            sort = sort.substring(1, sort.length);
        }

        const option = this.props.options.find(x => x.id === sort);

        return option ? option : def;
    }

    render() {
        const { options, params } = this.props;
        const { isExpanded } = this.state;

        const selectedOption = this.getSelected(params);

        let IconDesc;
        let IconAsc;

        if (selectedOption.type === 'alpha') {
            IconAsc = SortAlphaDownIcon;
            IconDesc = SortAlphaUpIcon;
        } else {
            IconDesc = SortAmountDownIcon;
            IconAsc = SortAmountUpIcon;
        }

        return (
            <div className='sort-wrapper'>
                {options.length > 1 ? (
                    <Select
                        variant={SelectVariant.single}
                        aria-label='Select input'
                        onToggle={e => this.onToggle(e)}
                        onSelect={(_, name) => this.onSelect(name)}
                        selections={selectedOption.title}
                        isExpanded={isExpanded}
                        ariaLabelledBy='Sort results'
                    >
                        {options.map(option => (
                            <SelectOption
                                key={option.id}
                                value={option.title}
                            />
                        ))}
                    </Select>
                ) : null}

                {this.getIsDescending(params) ? (
                    <IconDesc
                        className='clickable asc-button'
                        size='md'
                        onClick={() => this.setDescending()}
                    />
                ) : (
                    <IconAsc
                        className='clickable asc-button'
                        size='md'
                        onClick={() => this.setDescending()}
                    />
                )}
            </div>
        );
    }
}
