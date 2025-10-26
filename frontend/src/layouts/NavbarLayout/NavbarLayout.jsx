import { Outlet } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import ScrollDownButton from "../../components/ScrollDownButton/ScrollDownButton";
import "../../components/NavigationBar/NavigationBar.css"; 

const NavbarLayout = () => {
  return (
    <>
      <NavigationBar /> 
      <div className="content-wrapper">
        <Outlet />
      </div>
      <ScrollDownButton />
    </>
  );
};

export default NavbarLayout;
