import * as React from 'react';
import { Checkbox } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
  tags: string[];
  params: {
    tags?: string | string[];
  };
  updateParams: (params) => void;
}

export class TagFilter extends React.Component<IProps> {
  tagParam = 'tags';

  render() {
    const { tags, params } = this.props;
    return (
      <div>
        <div className='pf-c-content'>
          <h4>Tags</h4>
        </div>
        {tags.map(t => (
          <div
            key={t}
            style={{
              marginLeft: '10px',
              marginTop: '5px',
            }}
          >
            <Checkbox
              label={
                <span
                  style={{
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </span>
              }
              id={t}
              isChecked={ParamHelper.paramExists(params, this.tagParam, t)}
              onChange={checked => this.updateTags(t, checked)}
            />
          </div>
        ))}
      </div>
    );
  }

  private updateTags(tag, checked) {
    const { params } = this.props;

    let newParams;

    if (checked) {
      newParams = ParamHelper.appendParam(params, this.tagParam, tag);
    } else {
      newParams = ParamHelper.deleteParam(params, this.tagParam, tag);
    }

    this.props.updateParams(newParams);
  }
}
