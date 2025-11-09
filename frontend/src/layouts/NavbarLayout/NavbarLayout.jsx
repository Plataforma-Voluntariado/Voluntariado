import { Outlet } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import "../../components/NavigationBar/NavigationBar.css"; 

const NavbarLayout = () => {
  return (
    <>
      <NavigationBar /> 
      <div className="content-wrapper">
        <Outlet />
      </div>
    </>
  );
};

export default NavbarLayout;
