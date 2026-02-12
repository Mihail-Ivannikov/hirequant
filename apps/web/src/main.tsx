import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider, AppState } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

// Create a wrapper to handle Auth0's redirect callback
const Auth0ProviderWithRedirectCallback = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    // If we passed a returnTo URL before logging in, go there. Otherwise, default to current path.
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email offline_access" 
      }}
      cacheLocation="memory" 
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback} // <-- THIS FIXES THE REDIRECT PROBLEM
    >
      {children}
    </Auth0Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter moved to the very top to allow routing inside Auth0Provider */}
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback>
        <App />
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  </React.StrictMode>,
);