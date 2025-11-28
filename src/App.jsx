import React from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

export default function App() {
  return (
    <Layout currentPageName="Home">
      <Home />
    </Layout>
  );
}
