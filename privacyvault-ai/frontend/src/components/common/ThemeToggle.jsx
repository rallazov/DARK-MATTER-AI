import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../slices/settingsSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);

  return (
    <button
      type="button"
      className="btn-secondary text-sm"
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
