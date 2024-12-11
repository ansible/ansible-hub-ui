import { t } from '@lingui/core/macro';
import { Form, FormGroup, TextArea } from '@patternfly/react-core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FormFieldHelper } from 'src/components';
import './markdown-editor.scss';

interface IProps {
  editing: boolean;
  helperText: string;
  placeholder: string;
  text: string;
  updateText: (value) => void;
}

export const MarkdownEditor = ({
  editing,
  helperText,
  placeholder,
  text,
  updateText,
}: IProps) => (
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
        <div
          className={editing ? 'pf-v5-c-content preview' : 'pf-v5-c-content'}
        >
          <ReactMarkdown>{text || placeholder}</ReactMarkdown>
        </div>
      </div>
    </div>
  </Form>
);
