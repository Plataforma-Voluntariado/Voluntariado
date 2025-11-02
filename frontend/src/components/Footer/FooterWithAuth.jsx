import React from "react";
import { useAuth } from "../../context/AuthContext";
import Footer from "./Footer";

function FooterWithAuth() {
  const { user } = useAuth();
  
  return <Footer showUserLinks={!!user} />;
}

export default FooterWithAuth;