import { render, screen, act, waitFor } from '@testing-library/react';
import TestGraphql from 'pages/test-graphql';

describe('TestGraphql', () => {
  it('renders a button', async () => {
    const renderResult = render(<TestGraphql pageProps={{}} />);

    const heading = screen.getByRole('button', { name: /try fetch/i });

    expect(heading).toBeInTheDocument();

    await waitFor(renderResult.unmount);
  });

  it('renders page unchanged', async () => {
    const renderResult = render(<TestGraphql pageProps={{}} />);
    expect(renderResult.container).toMatchSnapshot();

    await waitFor(renderResult.unmount);
  });
});
