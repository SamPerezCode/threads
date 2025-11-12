import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth/logout";
import { obtenerPerfil } from "../api/perfil/obtenerPerfil";
import "../css/styles_dashboard.css";
// import ThreadsLogo from "../components/dashboard/ThreadsLogo";
import MenuIcon from "../components/icons/MenuIcon";
import ThreadsLogo from "../components/dashboard/ThreadsLogo";
import Sidebar from "../components/dashboard/Sidebar";
import LogoSplash from "../components/dashboard/LogoSplash";
import DropdownMenu from "../components/dashboard/DropdownMenu";
import MainContainer from "../components/dashboard/MainConatiner";
import AddIcon from "../components/icons/AddIcon";
import ModalHilo from "../components/dashboard/Tabs/TabHilos/ModalHilo";
import "../components/dashboard/Tabs/TabHilos/ModalHilo.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("home");
  const [showLogo, setShowLogo] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [showDropdownDesktop, setShowDropdownDesktop] = useState(false);
  const [showDropdownMobile, setShowDropdownMobile] = useState(false);

  const dropdownDesktopRef = useRef(null);
  const toggleDesktopRef = useRef(null);

  const dropdownMobileRef = useRef(null);
  const toggleMobileRef = useRef(null);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logoutUser();
    navigate("/login");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const perfil = await obtenerPerfil(userId);
        setUser(perfil);
      } catch (error) {
        console.error("Error cargando el usuario:", error);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cierre menú escritorio
      if (
        dropdownDesktopRef.current &&
        !dropdownDesktopRef.current.contains(event.target) &&
        toggleDesktopRef.current &&
        !toggleDesktopRef.current.contains(event.target)
      ) {
        setShowDropdownDesktop(false);
      }

      // Cierre menú móvil
      if (
        dropdownMobileRef.current &&
        !dropdownMobileRef.current.contains(event.target) &&
        toggleMobileRef.current &&
        !toggleMobileRef.current.contains(event.target)
      ) {
        setShowDropdownMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="dashboard-container">
        {/* Logo Threads del inicio  */}
        {showLogo && <LogoSplash onClick={() => setShowLogo(false)} />}

        <div className="logoAndMenu">
          <div
            className="menu-responsive"
            ref={toggleMobileRef}
            onClick={() => setShowDropdownMobile((prev) => !prev)}
          >
            <MenuIcon active={showDropdownMobile} />
            <ThreadsLogo className="logo-responsive" />
          </div>

          {showDropdownMobile && (
            <DropdownMenu dropdownRef={dropdownMobileRef} onLogout={cerrarSesion} />
          )}
        </div>

        {/* Containers barra de contenido, main y btn-add */}
        <Sidebar
          active={active}
          setActive={setActive}
          showDropdown={showDropdownDesktop}
          toggleDropdown={() => setShowDropdownDesktop((prev) => !prev)}
          dropdownRef={dropdownDesktopRef}
          toggleRef={toggleDesktopRef}
          onAddClick={abrirModal}
        />

        <MainContainer user={user} active={active} />

        <div className="container-btnFloating">
          <button className="btn-floating" onClick={abrirModal}>
            <AddIcon />
          </button>
        </div>
      </div>
      {mostrarModal && <ModalHilo avatar={user?.avatar} onClose={cerrarModal} />}
    </>
  );
};

export default Dashboard;
