import { NavLink } from 'react-router-dom';

const links = [
  { to: '/app', label: 'Home' },
  { to: '/vaults', label: 'Vaults' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/bots', label: 'Bots' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/settings', label: 'Settings' },
  { to: '/upgrade', label: 'Upgrade' }
];

export default function AppSidebar() {
  return (
    <aside className="card p-3">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block w-full rounded-lg px-3 py-2 text-left transition ${
                  isActive ? 'bg-teal-500/20 text-teal-200' : 'hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
