import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser, setAccessToken } from '../slices/authSlice';
import Loader from '../components/common/Loader';

export default function AuthCallbackPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      dispatch(setAccessToken(accessToken));
    }

    dispatch(fetchCurrentUser())
      .unwrap()
      .then((user) => {
        window.location.href = user.onboardingCompleted ? '/app' : '/onboarding';
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, [dispatch]);

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <Loader label="Finalizing secure login..." />
    </main>
  );
}
