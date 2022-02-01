import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertProps,
} from '@patternfly/react-core';

interface IProps {
  /** List of alerts to display */
  alerts: AlertType[];

  /** Callback to close the alert at the given index */
  closeAlert: (alertIndex) => void;
}

export class AlertType {
  id?: string;
  variant: AlertProps['variant'];
  title: string;
  description?: string | JSX.Element;
}

export class AlertList extends React.Component<IProps> {
  render() {
    const { alerts, closeAlert } = this.props;
    return (
      <div
        style={{
          position: 'fixed',
          right: '5px',
          top: '80px',
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {alerts.map((alert, i) => (
          <Alert
            style={{ marginBottom: '16px' }}
            key={i}
            title={alert.title}
            variant={alert.variant}
            actionClose={
              <AlertActionCloseButton onClose={() => closeAlert(i)} />
            }
          >
            {alert.description}
          </Alert>
        ))}
      </div>
    );
  }
}

export function closeAlertMixin(alertStateVariable) {
  return function (alertIndex) {
    const newList = [...this.state['alerts']];
    newList.splice(alertIndex, 1);

    const newState = {};
    newState[alertStateVariable] = newList;

    this.setState(newState);
  };
}
