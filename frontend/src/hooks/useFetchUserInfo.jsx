import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice";

export function useFetchUserInfo() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Chỉ fetch user một lần khi:
    // 1. Chưa có user
    // 2. Chưa từng thử fetch
    // 3. Không đang loading
    // 4. Có token trong localStorage
    const storedUser = localStorage.getItem("user");

    if (!user && !hasAttempted && !loading && storedUser) {
      setHasAttempted(true);
      dispatch(fetchUser());
    }
  }, [dispatch, user, loading, hasAttempted]);

  return { user, loading, error };
}
