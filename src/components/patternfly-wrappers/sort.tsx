import * as React from 'react';
import './sort.scss';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { SortAmountDownIcon, SortAmountUpIcon } from '@patternfly/react-icons';

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
        const params = { ...this.props.params };
        const desc = this.getIsDescending(params) ? '-' : '';
        const option = this.props.options.find(i => i.title === name);

        params[this.props.sortParamName] = desc + option.id;

        console.log(params);
        this.setState({ isExpanded: false }, () =>
            this.props.updateParams(params),
        );
    }

    private setDescending() {
        const params = { ...this.props.params };
        let field = this.getSelected(params);
        const descending = !this.getIsDescending(params);

        params[this.props.sortParamName] = descending ? '-' : '' + field;

        this.props.updateParams(params);
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
        const def = this.props.options[0].title;

        if (!sort) {
            return def;
        }

        if (sort.startsWith('-')) {
            sort = sort.substring(1, sort.length);
        }

        const option = this.props.options.find(x => x.id === sort);

        return option ? option.title : def;
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
                    selections={this.getSelected(params)}
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
