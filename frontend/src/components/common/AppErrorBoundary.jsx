import { Component } from 'react';
import styles from './AppErrorBoundary.module.css';

/**
 * Keeps an unexpected page-level rendering failure from turning into a blank
 * screen. The boundary automatically retries when the visitor changes route.
 */
export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep diagnostic detail in the browser console without exposing it to a
    // visitor or accidentally displaying provider responses in the UI.
    console.error('Unhandled application error:', error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.container} role="alert">
          <section className={styles.card}>
            <h1>Something went wrong</h1>
            <p>Nutrica could not load this page. Your saved data has not been changed.</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => this.setState({ hasError: false })}>
                Try again
              </button>
              <a href="/">Return home</a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
