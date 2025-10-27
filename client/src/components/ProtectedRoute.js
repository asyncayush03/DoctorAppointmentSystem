import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // ✅ Fetch user info from backend using JWT token
  const getUser = async () => {
    try {
      dispatch(showLoading());
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/user/getUserData",
        {}, // ✅ no body needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(hideLoading());

      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        localStorage.clear();
        window.location.href = "/login"; // ✅ redirects correctly
      }
    } catch (error) {
      dispatch(hideLoading());
      localStorage.clear();
      console.error("Error fetching user:", error);
      window.location.href = "/login"; // ✅ safe fallback redirect
    }
  };

  // ✅ Run only once if user not in Redux
  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      getUser();
    }
  }, [user]);

  // ✅ Conditional rendering
  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
