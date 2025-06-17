import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice";

export function useFetchUserInfo() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!user && !hasAttempted && !loading && storedUser) {
      setHasAttempted(true);
      dispatch(fetchUser());
    }
  }, [dispatch, user, loading, hasAttempted]);

  return { user, loading, error };
}
