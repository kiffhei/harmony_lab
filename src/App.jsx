import React from 'react';
import { MusicProvider } from './context/MusicContext.jsx';
import DesktopLayout from './layouts/DesktopLayout.jsx';
import './styles/globals.css';

export default function App() {
  return (
    <MusicProvider>
      <DesktopLayout />
    </MusicProvider>
  );
}
