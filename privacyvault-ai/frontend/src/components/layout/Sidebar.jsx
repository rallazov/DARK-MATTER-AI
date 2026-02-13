export default function Sidebar({ active, setActive }) {
  const items = ['Home', 'Vaults', 'Tasks', 'Bots', 'Integrations', 'Settings', 'Upgrade'];

  return (
    <aside className="card p-3">
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <button
              className={`w-full rounded-lg px-3 py-2 text-left transition ${
                active === item ? 'bg-teal-500/20 text-teal-200' : 'hover:bg-slate-800'
              }`}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
