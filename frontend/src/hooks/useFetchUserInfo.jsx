import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/auth/authSlice";

export function useFetchUserInfo() {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if( !user ) {
            dispatch(fetchUser());
        }
    }, [dispatch, user]);

    return { user, loading, error};
}