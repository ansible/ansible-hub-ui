import * as React from 'react';
import './my-imports.scss';

import { Tooltip } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { Spinner } from '@redhat-cloud-services/frontend-components';

import { formatPath, Paths } from '../../paths';
import { ImportListType, ImportDetailType, PulpStatus } from '../../api';

interface IProps {
    task: ImportDetailType;
    followMessages: boolean;
    selectedImport: ImportListType;
    apiError?: string;

    setFollowMessages: (follow: boolean) => void;
}

export class ImportConsole extends React.Component<IProps, {}> {
    lastImport: any;
    isLoading = false;

    constructor(props) {
        super(props);

        this.lastImport = React.createRef();
    }

    componentDidUpdate() {
        this.followLogs();
    }

    componentDidMount() {
        this.followLogs();
    }

    render() {
        const { selectedImport, task, apiError } = this.props;

        if (!task || !selectedImport) {
            return (
                <div className='import-console'>
                    {selectedImport ? this.renderTitle(selectedImport) : null}
                    <div className='loading message-list'>
                        {apiError ? (
                            <div className='message'>{apiError}</div>
                        ) : (
                            <Spinner centered={false} />
                        )}
                    </div>
                </div>
            );
        }

        this.isLoading =
            selectedImport.state === PulpStatus.running ||
            selectedImport.state === PulpStatus.waiting;

        return (
            <div className='import-console pf-c-content'>
                {this.renderTitle(selectedImport)}
                <div className='message-list'>
                    <div
                        className={
                            this.props.followMessages
                                ? 'log-follow-button follow-active'
                                : 'log-follow-button'
                        }
                    >
                        <Tooltip
                            position='left'
                            content={
                                this.isLoading ? 'Follow Logs' : 'Scroll to End'
                            }
                        >
                            <span
                                onClick={() => this.handleScrollClick()}
                                className='fa fa-arrow-circle-down clickable'
                            />
                        </Tooltip>
                    </div>

                    {task.messages.map((x, i) => {
                        return this.renderMessage(x, i);
                    })}

                    {task.messages.length === 0 ? (
                        <div className='message'>
                            <span className='error'>
                                No task messages available
                            </span>
                        </div>
                    ) : null}
                </div>
                <div
                    className='last-message'
                    key={'last'}
                    ref={this.lastImport}
                />
            </div>
        );
    }

    renderMessage(item, i) {
        return (
            <div className='message' key={i}>
                <span className={item.level.toLowerCase()}>
                    {item.message}&nbsp;
                </span>
            </div>
        );
    }

    renderTitle(selectedImport) {
        const { task } = this.props;
        return (
            <div>
                <div className='title-container'>
                    <Link
                        className='title'
                        to={formatPath(Paths.collection, {
                            namespace: selectedImport.namespace.name,
                            collection: selectedImport.name,
                        })}
                    >
                        {selectedImport.namespace.name}.{selectedImport.name}
                    </Link>
                </div>

                <div className='title-bar'>
                    <div>
                        <span className='data-title'>Status: </span>
                        {selectedImport.state}
                    </div>
                    <div>
                        <span className='data-title'>Version: </span>
                        {selectedImport.version}
                    </div>

                    {task && task.error ? (
                        <div>
                            <span className='data-title'>Error Message: </span>
                            {task.error.code}
                            <div>{task.error.description}</div>
                            <div>{task.error.traceback}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    private handleScrollClick() {
        if (this.isLoading) {
            this.props.setFollowMessages(!this.props.followMessages);
        } else {
            this.lastImport.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private followLogs() {
        if (this.props.followMessages && this.lastImport.current) {
            window.requestAnimationFrame(() => {
                this.lastImport.current.scrollIntoView({ behavior: 'smooth' });

                if (!this.isLoading) {
                    this.props.setFollowMessages(false);
                }
            });
        }
    }
}
