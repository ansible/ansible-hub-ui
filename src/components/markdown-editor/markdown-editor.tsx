import { t } from '@lingui/macro';
import { Form, FormGroup, TextArea } from '@patternfly/react-core';
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { FormFieldHelper } from 'src/components';
import './markdown-editor.scss';

interface IProps {
  text: string;
  placeholder: string;
  helperText: string;
  updateText: (value) => void;
  editing: boolean;
}

export class MarkdownEditor extends Component<IProps> {
  render() {
    const { text, placeholder, updateText, helperText, editing } = this.props;

    return (
      <Form>
        <div className='markdown-editor'>
          {editing && (
            <div className='column editor'>
              <FormGroup fieldId='resources'>
                <div id='markdown-title'>{t`Raw Markdown`}</div>
                <TextArea
                  aria-labelledby='markdown-title'
                  id='resources'
                  value={text}
                  onChange={(_event, value) => updateText(value)}
                  placeholder={placeholder}
                />
                <FormFieldHelper>{helperText}</FormFieldHelper>
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
