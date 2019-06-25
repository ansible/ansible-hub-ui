import React, { Component } from 'react';

/**
 * Webpack allows loading components asynchronously by using import().
 *
 *      Ex) const Component = asyncComponent(() => import('component');
 *
 *          class aClass extends React.Component {
 *              render() {
 *                  return (<Component prop1="prop1" prop2="prop2" ... />);
 *              }
 *          }
 *
 *  https://reactjs.org/docs/higher-order-components.html
 *
 * @param importComponent a function that contains and async import statement
 *      Ex) () => import('react-component')
 *
 * @returns {AsyncComponent} The imported component or can return a loading
 */
export default function asyncComponent(importComponent) {
    class AsyncComponent extends Component {
        constructor(props) {
            super(props);

            this.state = {
                component: null,
            };
        }

        async componentDidMount() {
            const { default: component } = await importComponent();

            this.setState({
                component,
            });
        }

        render() {
            const C = this.state.component;

            return C ? <C {...this.props} /> : <div>Loading...</div>;
        }
    }

    return AsyncComponent;
}
