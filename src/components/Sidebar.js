import React from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

import { BsArrowLeftShort, BsArrowRightShort } from "react-icons/bs";
import {
  IoBusinessOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";

const Sidebar = ({ open, setOpen }) => {
  const session = JSON.parse(sessionStorage.getItem("session"));
  const handlerSidebar = () => {
    setOpen(!open);
  };
  const menu = [
    // { title: "Dashboard", url: "/dashboard", icon: <IoSpeedometerOutline /> },
    { title: "Propiedades", url: "/propiedades", icon: <IoBusinessOutline /> },
    { title: "Clientes", url: "/clientes", icon: <IoPeopleOutline /> },
    { title: "Configuracion", url: "/perfil", icon: <IoSettingsOutline /> },
  ];
  return (
    <div className="">
      <div
        className={` z-20 h-screen bg-white shadow-lg text-light-font p-5 pt-8 ${
          open
            ? "translate-x-0 md:translate-x-0 w-72 md:w-72"
            : "-translate-x-20 w-20 md:translate-x-0 md:block md:w-20"
        } duration-300 fixed md:relative block`}
      >
        {open ? (
          <BsArrowLeftShort
            onClick={handlerSidebar}
            className="hidden md:block bg-white text-dark-purple rounded-full absolute -right-3 top-9 text-3xl border border-dark-purple cursor-pointer"
          />
        ) : (
          <BsArrowRightShort
            onClick={handlerSidebar}
            className="hidden md:block bg-white text-dark-purple rounded-full absolute -right-3 top-9 text-3xl border border-dark-purple cursor-pointer"
          />
        )}

        <div className="overflow-hidden px-2">
          {open ? (
            <img
              className="h-[50px] mx-auto object-contain block"
              src="./logoapp.png"
              alt=""
            />
          ) : (
            <img
              className="h-[50px] object-contain block"
              src="./iconapp.png"
              alt=""
            />
            // <img className="w-[80px]" src="./iconapp.png" alt="" />
          )}
        </div>
        <div className="w-full py-[20px] inline-flex items-center gap-2 px-2">
          <img
            src="https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1718841600&semt=ais_user"
            className="w-6 h-6 rounded-full block cursor-pointer float-left mr-2 "
            alt=""
          />
          <div className={`${!open && "scale-0"}`}>
            <h1 className="text-sm text-start">{session.nombres}</h1>
            <h1 className="text-sm text-start">{session.email}</h1>
          </div>
        </div>
        <nav className="pt-2 flex flex-col gap-2">
          {menu.map((item, index) => (
            <NavLink
              key={index}
              to={item.url}
              className={({ isActive }) =>
                isActive
                  ? "bg-light-purple text-dark-purple  text-sm p-2 flex gap-3 items-center rounded duration-300 transition-all"
                  : "p-2 text-sm hover:bg-light-purple hover:text-dark-purple  transition-all rounded duration-300 flex gap-3 items-center"
              }
            >
              <span className="block float-left text-xl">{item.icon}</span>
              <span
                className={`text-sm font-medium flex-1 ${!open && "hidden"}`}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
          <LogoutButton open={open} />
        </nav>
      </div>
      <div
        onClick={() => setOpen(false)}
        className={`${
          open ? "" : "hidden"
        } block md:hidden w-full bg-gray-900 opacity-50 absolute top-0 h-full bottom-0 left-0 right-0 z-10`}
      ></div>
    </div>
  );
};

export default Sidebar;
