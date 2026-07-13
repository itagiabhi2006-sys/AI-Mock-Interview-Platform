import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../Api';
import { useAuth } from "../contexts/AuthContext";

function AuthSuccess() {
  const navigate = useNavigate();
   const { login } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    async function verifyToken() {
      if (!token) {
        navigate("/login");
       
        return;
      }

      try {
      
        const formData = new FormData();
        formData.append("token", token);

        const response = await api.post("/verify-temptoken", formData);
        
        if (response.data) {
          localStorage.setItem("loggedIn", "true");
          login(response.data)
          navigate("/");

        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    }

    verifyToken(); 
  }, [navigate]);

  return <p>Logging you in…</p>;
}

export default AuthSuccess;
