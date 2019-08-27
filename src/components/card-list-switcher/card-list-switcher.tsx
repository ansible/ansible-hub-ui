import * as React from 'react';
import './switcher.scss';

import { ListIcon, ThLargeIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
    params: {
        view_type?: string;
    };
    updateParams: (params) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export class CardListSwitcher extends React.Component<IProps> {
    static defaultProps = {
        size: 'sm',
    };

    render() {
        let disp = this.props.params.view_type;
        const { updateParams, params, size, className } = this.props;

        if (!disp) {
            disp = 'card';
        }

        const iconClasses = 'icon clickable ';

        return (
            <div className={className}>
                <ThLargeIcon
                    size={size}
                    className={
                        iconClasses + (disp === 'card' ? 'selected' : '')
                    }
                    onClick={() =>
                        updateParams(
                            ParamHelper.setParam(params, 'view_type', 'card'),
                        )
                    }
                />
                <ListIcon
                    size={size}
                    className={
                        iconClasses + (disp === 'list' ? 'selected' : '')
                    }
                    onClick={() =>
                        updateParams(
                            ParamHelper.setParam(params, 'view_type', 'list'),
                        )
                    }
                />
            </div>
        );
    }
}
