import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice";

export function useFetchUserInfo() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!user && !hasInitialFetch && !loading && storedUser) {
      setHasInitialFetch(true);
      dispatch(fetchUser());
    }
  }, [dispatch, user, loading, hasInitialFetch]);
  const refetchUser = () => {
    dispatch(fetchUser());
  };

  return { user, loading, error, refetchUser };
}
