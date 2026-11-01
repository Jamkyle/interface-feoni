import React from "react";

const Header = ({ tabs, tab, onTab, user, isAdmin, onLogin, onLogout }) => {
  const role = isAdmin ? "Admin" : "Lecture seule";

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__brand">
          Feoni <span>· gestion</span>
        </div>
        <div className="header__user">
          {user && <span className="header__email">{user.email}</span>}
          <span className={`badge ${isAdmin ? "badge--admin" : ""}`}>{role}</span>
          {user ? (
            <button className="btn btn--small" onClick={onLogout}>
              Se déconnecter
            </button>
          ) : (
            <button className="btn btn--small btn--primary" onClick={onLogin}>
              Se connecter
            </button>
          )}
        </div>
      </div>
      <nav className="tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`tabs__item ${tab === id ? "tabs__item--active" : ""}`}
            onClick={() => onTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
