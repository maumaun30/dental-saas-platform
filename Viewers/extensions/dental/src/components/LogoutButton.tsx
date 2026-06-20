import React from 'react';
import { tokenStore } from '../dentalApi';

export function LogoutButton() {
  const onLogout = () => {
    tokenStore.clear();
    window.location.reload();
  };

  return (
    <button className="dental-chip" onClick={onLogout} title="Sign out">
      ⎋ Logout
    </button>
  );
}

export default LogoutButton;
