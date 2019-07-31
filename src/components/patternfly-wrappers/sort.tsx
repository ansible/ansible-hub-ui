import * as React from 'react';
import './sort.scss';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { SortAmountDownIcon, SortAmountUpIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';

export class SortFieldOption {
    id: string;
    title: string;
}

interface IProps {
    options: SortFieldOption[];
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
        const desc = this.getIsDescending(this.props.params) ? '-' : '';
        const option = this.props.options.find(i => i.title === name);

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
        return (
            <div className='sort-wrapper'>
                <Select
                    variant={SelectVariant.single}
                    aria-label='Select Input'
                    onToggle={e => this.onToggle(e)}
                    onSelect={(_, name) => this.onSelect(name)}
                    selections={this.getSelected(params).title}
                    isExpanded={isExpanded}
                    ariaLabelledBy='Sort results'
                >
                    {options.map(option => (
                        <SelectOption key={option.id} value={option.title} />
                    ))}
                </Select>
                {this.getIsDescending(params) ? (
                    <SortAmountDownIcon
                        className='clickable asc-button'
                        size='md'
                        onClick={() => this.setDescending()}
                    />
                ) : (
                    <SortAmountUpIcon
                        className='clickable asc-button'
                        size='md'
                        onClick={() => this.setDescending()}
                    />
                )}
            </div>
        );
    }
}
