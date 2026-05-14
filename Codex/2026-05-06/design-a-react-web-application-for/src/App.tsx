import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/Common/AppShell';
import { loadUsageCsv } from './services/csvLoader';
import { getFilterOptions } from './services/dataProcessor';
import DashboardPage from './pages/DashboardPage';
import usageCsvUrl from './assets/data/MyReport_UsageData_2026-05-12.csv?url';

const routes = {
  '/dashboard': DashboardPage
};

function getRoute() {
  return routes[window.location.pathname] ? window.location.pathname : '/dashboard';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    loadUsageCsv(usageCsvUrl)
      .then((data) => {
        if (!active) return;
        setRows(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load usage data.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!routes[window.location.pathname]) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const navigate = (nextRoute) => {
    if (nextRoute === route) return;
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
  };

  const Page = routes[route] || DashboardPage;
  const filterOptions = useMemo(() => getFilterOptions(rows), [rows]);

  return (
    <AppShell route={route} onNavigate={navigate} status={status}>
      {status === 'error' ? (
        <section className="error-panel">
          <p className="eyebrow">Data source unavailable</p>
          <h1>CSV data could not be loaded</h1>
          <p>{error}</p>
        </section>
      ) : (
        <Page rows={rows} filterOptions={filterOptions} loading={status === 'loading'} />
      )}
    </AppShell>
  );
}
