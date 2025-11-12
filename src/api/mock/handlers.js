import {
  generateId,
  getDatabase,
  saveDatabase,
  findUserByToken,
  findUserById,
  toPublicUser,
  ensureToken,
} from "./database";

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const unauthorizedResponse = () => jsonResponse({ error: "No autorizado" }, 401);

export const handleLogin = ({ body }) => {
  if (!body) {
    return jsonResponse({ error: "Credenciales inválidas" }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return jsonResponse({ error: "Usuario y contraseña son obligatorios." }, 400);
  }

  const db = getDatabase();
  const user = db.users.find(
    (item) =>
      item.username.toLowerCase() === username.toLowerCase() ||
      item.email.toLowerCase() === username.toLowerCase()
  );

  if (!user || user.password !== password) {
    return jsonResponse({ error: "Credenciales incorrectas" }, 401);
  }

  const token = ensureToken(user);
  saveDatabase(db);

  return jsonResponse({
    code: 200,
    message: "Inicio de sesión simulado exitoso.",
    user: {
      ...toPublicUser(user),
      token,
    },
  });
};

export const handleRegister = ({ body }) => {
  if (!body) {
    return jsonResponse({ error: "Datos incompletos" }, 400);
  }

  const { name, email, password } = body;
  if (!name || !email || !password) {
    return jsonResponse({ error: "Todos los campos son obligatorios." }, 400);
  }

  const db = getDatabase();
  const existing = db.users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() ||
      user.username.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    return jsonResponse({ error: "Ya existe un usuario con esos datos." }, 409);
  }

  const nuevoUsuario = {
    id: generateId(db, "usuario"),
    name,
    username:
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 12) || `usuario${Date.now()}`,
    email,
    password,
    description: "Nuevo usuario en Threads demo.",
    avatar: "/default-avatar.png",
    followers: [],
    following: [],
  };

  ensureToken(nuevoUsuario);
  db.users.push(nuevoUsuario);
  saveDatabase(db);

  return jsonResponse(
    {
      code: 201,
      message: "Registro simulado exitoso.",
      user: {
        ...toPublicUser(nuevoUsuario),
        token: nuevoUsuario.token,
      },
    },
    201
  );
};

const resolveUserFromToken = (token) => {
  const db = getDatabase();
  const user = findUserByToken(db, token);
  return { db, user };
};

export const handleGetUser = ({ params }) => {
  const { db } = getFreshDatabase();
  const user = findUserById(db, params.id);
  if (!user) {
    return jsonResponse({ error: "Usuario no encontrado" }, 404);
  }

  const followers = user.followers?.length ?? 0;
  return jsonResponse({
    data: {
      ...toPublicUser(user),
      total_seguidores: followers,
    },
  });
};

const getFreshDatabase = () => {
  const db = getDatabase();
  return { db };
};

export const handleUpdateProfile = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { description, avatar, name } = body || {};
  if (typeof description === "string") {
    user.description = description;
  }
  if (avatar) {
    user.avatar = avatar;
  }
  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  saveDatabase(db);

  return jsonResponse({
    message: "Perfil actualizado correctamente.",
    data: toPublicUser(user),
  });
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const handleUploadAvatar = async ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const file = body?.fields?.avatar;
  if (typeof File !== "undefined" && file instanceof File) {
    try {
      user.avatar = await readFileAsDataUrl(file);
    } catch (error) {
      console.error("[MockAPI] Error leyendo archivo:", error);
      return jsonResponse({ error: "No se pudo procesar la imagen" }, 400);
    }
  } else if (typeof file === "string") {
    user.avatar = file;
  }

  saveDatabase(db);

  return jsonResponse({
    message: "Avatar actualizado.",
    path: user.avatar,
  });
};

export const handleGetComments = ({ token }) => {
  const { db } = getFreshDatabase();
  const response = db.comentarios
    .filter((comentario) => comentario.comentario_padre_id === null)
    .map((comentario) => ({ comentario: buildComment(comentario, db, token) }));

  return jsonResponse({ data: response });
};

const buildComment = (comentario, db, token) => {
  const user = findUserById(db, comentario.usuario_id);
  const replies = db.comentarios
    .filter((item) => item.comentario_padre_id === comentario.id)
    .map((child) => ({ comentario: buildComment(child, db, token) }));

  const currentUser = token ? findUserByToken(db, token) : null;
  const liked = currentUser ? comentario.likes.includes(currentUser.id) : false;

  return {
    id: comentario.id,
    contenido: comentario.contenido,
    fecha_creacion: comentario.fecha_creacion,
    usuario: toPublicUser(user),
    me_gusta_total: comentario.likes.length,
    me_gusta_usuario: liked,
    comentarios: replies,
  };
};

export const handleCreateComment = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { usuario_id, contenido, comentario_padre_id = null } = body || {};
  if (!contenido || !usuario_id) {
    return jsonResponse({ error: "Datos insuficientes" }, 400);
  }

  if (Number(usuario_id) !== user.id) {
    return jsonResponse({ error: "No autorizado" }, 403);
  }

  const nuevoComentario = {
    id: generateId(db, "comentario"),
    usuario_id: Number(usuario_id),
    contenido,
    fecha_creacion: new Date().toISOString(),
    comentario_padre_id: comentario_padre_id !== null ? Number(comentario_padre_id) : null,
    likes: [],
  };

  db.comentarios.push(nuevoComentario);
  saveDatabase(db);

  return jsonResponse(
    {
      code: 201,
      data: buildComment(nuevoComentario, db, token),
    },
    201
  );
};

export const handleDeleteComment = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { comentario_id, usuario_id } = body || {};
  if (!comentario_id || Number(usuario_id) !== user.id) {
    return jsonResponse({ error: "No puedes eliminar este comentario" }, 403);
  }

  const comentarioIdNumber = Number(comentario_id);
  const idsAEliminar = new Set([comentarioIdNumber]);
  db.comentarios.forEach((comentario) => {
    if (comentario.comentario_padre_id === comentarioIdNumber) {
      idsAEliminar.add(comentario.id);
    }
  });

  db.comentarios = db.comentarios.filter((comentario) => !idsAEliminar.has(comentario.id));
  saveDatabase(db);

  return jsonResponse({ code: 200, message: "Comentario eliminado" });
};

export const handleToggleLike = ({ token, params, method }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const comentarioId = Number(params.id);
  const comentario = db.comentarios.find((item) => item.id === comentarioId);
  if (!comentario) {
    return jsonResponse({ error: "Comentario no encontrado" }, 404);
  }

  if (method === "POST") {
    if (!comentario.likes.includes(user.id)) {
      comentario.likes.push(user.id);
    }
  } else {
    comentario.likes = comentario.likes.filter((id) => id !== user.id);
  }

  saveDatabase(db);

  return jsonResponse({ code: 200, data: { me_gusta_total: comentario.likes.length } });
};

export const handleGetCommentLikes = ({ params }) => {
  const { db } = getFreshDatabase();
  const comentarioId = Number(params.id);
  const comentario = db.comentarios.find((item) => item.id === comentarioId);
  if (!comentario) {
    return jsonResponse({ data: [] });
  }

  const usuarios = comentario.likes
    .map((userId) => toPublicUser(findUserById(db, userId)))
    .filter(Boolean);
  return jsonResponse({ data: usuarios });
};

export const handleGetUserComments = ({ params }) => {
  const { db } = getFreshDatabase();
  const userId = Number(params.id);

  const comentarios = db.comentarios
    .filter((comentario) => comentario.usuario_id === userId)
    .map((comentario) => ({
      id: comentario.id,
      contenido: comentario.contenido,
      fecha_creacion: comentario.fecha_creacion,
      usuario: toPublicUser(findUserById(db, comentario.usuario_id)),
      comentario_padre: comentario.comentario_padre_id
        ? { id: comentario.comentario_padre_id }
        : null,
      me_gusta_total: comentario.likes.length,
    }));

  return jsonResponse({ data: comentarios });
};

export const handleReplyComment = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { usuario_id, comentario_padre_id, contenido } = body || {};
  if (!usuario_id || !comentario_padre_id || !contenido) {
    return jsonResponse({ error: "Datos incompletos" }, 400);
  }

  if (Number(usuario_id) !== user.id) {
    return jsonResponse({ error: "No autorizado" }, 403);
  }

  const parent = db.comentarios.find((comentario) => comentario.id === Number(comentario_padre_id));
  if (!parent) {
    return jsonResponse({ error: "Comentario padre no encontrado" }, 404);
  }

  const respuesta = {
    id: generateId(db, "comentario"),
    usuario_id: Number(usuario_id),
    contenido,
    fecha_creacion: new Date().toISOString(),
    comentario_padre_id: Number(comentario_padre_id),
    likes: [],
  };

  db.comentarios.push(respuesta);
  saveDatabase(db);

  return jsonResponse({ code: 201, data: buildComment(respuesta, db, token) }, 201);
};

export const handleGetConversation = ({ params }) => {
  const { db } = getFreshDatabase();
  const comentarioId = Number(params.id);

  const respuestas = db.comentarios
    .filter((comentario) => comentario.comentario_padre_id === comentarioId)
    .map((comentario) => buildComment(comentario, db));

  return jsonResponse({ data: respuestas });
};

export const handleGetFollowers = ({ params }) => {
  const { db } = getFreshDatabase();
  const usuario = findUserById(db, params.id);
  if (!usuario) {
    return jsonResponse({ data: [] });
  }

  const followers = usuario.followers
    .map((id) => toPublicUser(findUserById(db, id)))
    .filter(Boolean);
  return jsonResponse({ data: followers });
};

export const handleFollowUser = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { seguidor_id, seguido_id } = body || {};
  if (!seguidor_id || !seguido_id || seguidor_id === seguido_id) {
    return jsonResponse({ error: "Datos inválidos" }, 400);
  }

  const seguido = findUserById(db, seguido_id);
  if (!seguido) {
    return jsonResponse({ error: "Usuario a seguir no existe" }, 404);
  }

  if (!seguido.followers.includes(seguidor_id)) {
    seguido.followers.push(seguidor_id);
  }
  if (!user.following.includes(seguido_id)) {
    user.following.push(seguido_id);
  }

  saveDatabase(db);

  return jsonResponse({ message: "Ahora sigues a este usuario." });
};

export const handleUnfollowUser = ({ token, body }) => {
  const { db, user } = resolveUserFromToken(token);
  if (!user) {
    return unauthorizedResponse();
  }

  const { seguidor_id, seguido_id } = body || {};
  if (!seguidor_id || !seguido_id) {
    return jsonResponse({ error: "Datos inválidos" }, 400);
  }

  const seguido = findUserById(db, seguido_id);
  if (!seguido) {
    return jsonResponse({ error: "Usuario no encontrado" }, 404);
  }

  seguido.followers = seguido.followers.filter((id) => id !== seguidor_id);
  user.following = user.following.filter((id) => id !== seguido_id);
  saveDatabase(db);

  return jsonResponse({ message: "Has dejado de seguir a este usuario." });
};
