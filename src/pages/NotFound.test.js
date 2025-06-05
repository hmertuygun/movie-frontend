import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

test('renders NotFound text', () => {
  render(<NotFound />);
  const element = screen.getByText(/NotFound/i);
  expect(element).toBeInTheDocument();
});
