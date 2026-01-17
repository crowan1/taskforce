// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


jest.mock('react-helmet-async', () => {
  const React = require('react');
  return {
    Helmet: ({ children }) => React.createElement(React.Fragment, null, children),
    HelmetProvider: ({ children }) => React.createElement(React.Fragment, null, children)
  };
});
