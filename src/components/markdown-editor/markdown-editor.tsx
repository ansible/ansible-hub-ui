import { t } from '@lingui/macro';
import * as React from 'react';
import './markdown-editor.scss';

import { Form, FormGroup, TextArea } from '@patternfly/react-core';
import ReactMarkdown from 'react-markdown';

interface IProps {
  text: string;
  placeholder: string;
  helperText: string;
  updateText: (value) => void;
  editing: boolean;
}

export class MarkdownEditor extends React.Component<IProps, {}> {
  render() {
    const { text, placeholder, updateText, helperText, editing } = this.props;

    return (
      <Form>
        <div className='markdown-editor'>
          {editing && (
            <div className='column editor'>
              <FormGroup fieldId='resources' helperText={helperText}>
                <div id='markdown-title'>{t`Raw Markdown`}</div>
                <TextArea
                  aria-labelledby='markdown-title'
                  id='resources'
                  value={text}
                  onChange={(value) => updateText(value)}
                  placeholder={placeholder}
                />
              </FormGroup>
            </div>
          )}
          <div className='column preview-container'>
            {editing && t`Preview`}
            <div className={editing ? 'pf-c-content preview' : 'pf-c-content'}>
              <ReactMarkdown>{text || placeholder}</ReactMarkdown>
            </div>
          </div>
        </div>
      </Form>
    );
  }
}
