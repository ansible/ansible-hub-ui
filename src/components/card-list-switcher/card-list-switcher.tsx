import * as React from 'react';
import './switcher.scss';

import { ListIcon, ThLargeIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
    params: {
        view_type?: string;
    };
    updateParams: (params) => void;
}

export class CardListSwitcher extends React.Component<IProps> {
    render() {
        let disp = this.props.params.view_type;
        const { updateParams, params } = this.props;

        if (!disp) {
            disp = 'card';
        }

        return (
            <div>
                <ThLargeIcon
                    className={
                        'icon clickable ' + (disp === 'card' ? 'selected' : '')
                    }
                    onClick={() =>
                        updateParams(
                            ParamHelper.setParam(params, 'view_type', 'card'),
                        )
                    }
                />
                <ListIcon
                    className={
                        'icon clickable ' + (disp === 'list' ? 'selected' : '')
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
