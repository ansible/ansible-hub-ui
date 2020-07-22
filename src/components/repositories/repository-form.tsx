import * as React from 'react';

import {
  Form,
  FormGroup,
  Radio,
  TextArea,
  TextInput,
} from '@patternfly/react-core';

export class Repository {
  name: string;
  url: string;
  token: string;
  ssoUrl: string;
  yaml: string;
  sync: boolean;
}

interface IProps {
  repositoryId: string;
  updateRepository: (repository) => void;
  updateType: (type) => void;
  repository: Repository;
}

interface IState {
  repositoryType: string;
}

export class RepositoryForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    // TODO get data or set default
    if (this.props.repositoryId === 'new') {
      this.state = {
        repositoryType: 'typeCertified',
      };
    } else {
      console.log('TODO get REPO data');
    }
  }

  render() {
    const adding = this.props.repositoryId === 'new';
    const repository = this.props.repository;
    return (
      <Form>
        <div className='card-row'>
          <div className='fields'>
            {this.renderRepoType(adding)}
            <FormGroup fieldId={'name'} label={'Name'} isRequired>
              <TextInput
                isRequired
                id='name'
                type='text'
                value={repository.name}
                onChange={(value, event) => this.updateRepository(value, event)}
              />
            </FormGroup>
            <FormGroup fieldId={'url'} label={'URL'} isRequired>
              <TextInput
                isRequired
                id='url'
                type='text'
                value={repository.url}
                onChange={(value, event) => this.updateRepository(value, event)}
              />
            </FormGroup>
            <FormGroup fieldId={'token'} label={'Token'} isRequired>
              <TextArea
                isRequired
                id='token'
                type='text'
                value={repository.token}
                onChange={(value, event) => this.updateRepository(value, event)}
              />
            </FormGroup>
            {this.renderSso()}
            {this.renderYaml()}
          </div>
        </div>
      </Form>
    );
  }

  private updateRepository(value, event) {
    const update = { ...this.props.repository };
    update[event.target.id] = value;
    this.props.updateRepository(update);
  }

  private changeType(type) {
    this.setState({ repositoryType: type });
    this.props.updateRepository(type);
  }

  private renderRepoType(adding: boolean) {
    if (!adding) {
      return;
    }
    //TODO make it change
    const certified = this.state.repositoryType === 'typeCertified';
    return (
      <FormGroup fieldId={'repoType'} isRequired={true}>
        <Radio
          id={'typeCertified'}
          name={'repoTypeRadio'}
          label={'RH Certified'}
          onClick={() => this.changeType('typeCertified')}
          checked={certified}
        />
        <Radio
          id={'typeCommunity'}
          name={'repoTypeRadio'}
          label={'Community'}
          onClick={() => this.changeType('typeCommunity')}
          checked={!certified}
        />
      </FormGroup>
    );
  }

  private renderSso() {
    if (this.state.repositoryType === 'typeCertified') {
      return (
        <FormGroup fieldId={'ssoUrl'} label={'SSO URL'} isRequired>
          <TextInput
            isRequired
            id='ssoUrl'
            type='text'
            value={this.props.repository.ssoUrl}
            onChange={(value, event) => this.updateRepository(value, event)}
          />
        </FormGroup>
      );
    }
  }

  private renderYaml() {
    if (this.state.repositoryType === 'typeCommunity') {
      return (
        <FormGroup fieldId={'yaml'} label={'YAML requirements'} isRequired>
          <TextArea
            isRequired
            id='yaml'
            type='text'
            value={this.props.repository.yaml}
            onChange={(value, event) => this.updateRepository(value, event)}
          />
        </FormGroup>
      );
    }
  }
}
