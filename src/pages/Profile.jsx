import { useEffect, useState } from "react";
import EditarPerfilModal from "../components/dashboard/Profile/EditarPerfilModal";
import { obtenerPerfil } from "../api/perfil/obtenerPerfil";
import { editarPerfil } from "../api/perfil/editarPerfil";
import { obtenerComentarioUsuario } from "../api/publicaciones/obtenerComentariosUsuario";
import Tabs from "../components/dashboard/Tabs/Tabs";
import ModalAvatar from "../components/dashboard/Profile/ModalAvatar";
import { getAvatarUrl } from "../utils/getAvatarUrl";
import "../../src/css/Tabs.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("hilos");
  const [error, setError] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [respuestasUsuario, setRespuestasUsuario] = useState([]);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setError("No se encontró el ID del usuario. Iniciá sesión nuevamente.");
          return;
        }

        const perfil = await obtenerPerfil(userId);
        setUser(perfil);

        console.log("Datos del perfil del usuario logueado:", perfil);
        const comentariosData = await obtenerComentarioUsuario(userId);
        const comentarios = comentariosData.data || [];

        console.log("Comentarios:", comentarios);

        const publicacionesUsuario = comentarios.filter(
          (comentario) =>
            comentario.usuario &&
            comentario.usuario.id === parseInt(userId) &&
            !comentario.comentario_padre
        );

        console.log("Respuestas Usuario:", publicacionesUsuario);

        const respuestasUsuario = comentarios.filter(
          (comentario) =>
            comentario.usuario &&
            comentario.usuario.id === parseInt(userId) &&
            comentario.comentario_padre
        );

        console.log("Respuestas Usuario:", respuestasUsuario);

        setPublicaciones(publicacionesUsuario);
        setRespuestasUsuario(respuestasUsuario);

        // console.log("Hilos del usuario:", publicacionesUsuario);
        // console.log("Respuestas del usuario:", respuestasUsuario);
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        setError("Hubo un problema al cargar tu perfil.");
      }
    };

    cargarPerfil();
  }, []);

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  const guardarCambios = async (datosActualizados) => {
    try {
      await editarPerfil(datosActualizados);
      const userId = localStorage.getItem("userId");
      const perfilActualizado = await obtenerPerfil(userId);
      setUser(perfilActualizado);
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
    }
  };

  if (error) return <p className="error-text">{error}</p>;
  if (!user) return <p>Cargando perfil...</p>;

  const { name, username, total_seguidores, description, avatar } = user;

  const avatarUrl = getAvatarUrl(avatar);

  return (
    <div className="profile-container-wrapper">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <div className="div">
              <h2 className="name">{name}</h2>
              <p className="username">{username}</p>
            </div>
            <div className="avatar-image">
              <img
                src={avatarUrl}
                alt="avatar"
                className="avatar"
                onClick={() => setShowModal(true)}
              />

              {showModal && <ModalAvatar imageUrl={avatar} onClose={() => setShowModal(false)} />}
            </div>
          </div>

          <div className="profile-details">
            <div className="bio">{description || "Aún sin biografía"}</div>
            <p className="followers">👥 {total_seguidores} seguidores</p>
            <button className="edit-btn" onClick={abrirModal}>
              Editar perfil
            </button>
          </div>
        </div>

        <EditarPerfilModal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          user={user}
          onSave={guardarCambios}
        />

        <div className="profile-tabs">
          <Tabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            publicaciones={publicaciones}
            respuestas={respuestasUsuario}
            avatar={avatar}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
