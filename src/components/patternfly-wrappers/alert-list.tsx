import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertProps,
} from '@patternfly/react-core';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  /** List of alerts to display */
  alerts: AlertType[];

  /** Callback to close the alert at the given index */
  closeAlert?: (alertIndex) => void;
}

export class AlertType {
  variant: AlertProps['variant'];
  title: string | JSX.Element;
  description?: string | JSX.Element;
}

const closeAlertContext = (alertIndex: number, context) => {
  const newList = [...context.alerts];
  newList.splice(alertIndex, 1);
  context.setAlerts(newList);
};

export class AlertList extends React.Component<IProps> {
  static contextType = AppContext;

  render() {
    const { alerts, closeAlert = closeAlertContext } = this.props;
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
              <AlertActionCloseButton
                onClose={() => closeAlert(i, this.context)}
              />
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
