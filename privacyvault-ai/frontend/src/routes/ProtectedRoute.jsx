import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchCurrentUser, refreshSession } from '../slices/authSlice';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const token = localStorage.getItem('pvai_access_token');

  useEffect(() => {
    if (token && !user && status === 'idle') {
      dispatch(fetchCurrentUser()).unwrap().catch(() => dispatch(refreshSession()));
    }
  }, [dispatch, token, user, status]);

  if (!token) return <Navigate to="/login" replace />;
  if (!user && (status === 'loading' || status === 'idle')) return <Loader label="Restoring secure session..." />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
