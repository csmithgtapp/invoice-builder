import { render, screen } from '@testing-library/react';
import App from './App';

test('renders invoice builder component', () => {
  render(<App />);
  const invoiceElement = screen.getByText(/Invoice Builder/i);
  expect(invoiceElement).toBeInTheDocument();
});