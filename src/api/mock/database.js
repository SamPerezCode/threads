const STORAGE_KEY = "threads_mock_database_v1";

const DEFAULT_DATA = () => ({
  users: [
    {
      id: 1,
      name: "Ana Demo",
      username: "anademo",
      email: "ana@example.com",
      password: "123456",
      description: "Explorando la versión demo de Threads.",
      avatar: "/default-avatar.png",
      followers: [2],
      following: [2],
      token: "mock-token-ana",
    },
    {
      id: 2,
      name: "Bruno Test",
      username: "brunotest",
      email: "bruno@example.com",
      password: "123456",
      description: "Coleccionista de ideas en Threads.",
      avatar: "/default-avatar.png",
      followers: [1, 3],
      following: [1],
      token: "mock-token-bruno",
    },
    {
      id: 3,
      name: "Carla Mock",
      username: "carlamock",
      email: "carla@example.com",
      password: "123456",
      description: "Diseñadora curiosa.",
      avatar: "/default-avatar.png",
      followers: [2],
      following: [1],
      token: "mock-token-carla",
    },
  ],
  comentarios: [
    {
      id: 1,
      usuario_id: 1,
      contenido: "¡Hola Threads! Esta es una publicación de prueba.",
      fecha_creacion: new Date().toISOString(),
      comentario_padre_id: null,
      likes: [2, 3],
    },
    {
      id: 2,
      usuario_id: 2,
      contenido: "Bienvenida Ana, ¡la versión demo está funcionando!",
      fecha_creacion: new Date().toISOString(),
      comentario_padre_id: 1,
      likes: [1],
    },
    {
      id: 3,
      usuario_id: 3,
      contenido: "Probando Threads sin backend real.",
      fecha_creacion: new Date().toISOString(),
      comentario_padre_id: null,
      likes: [1],
    },
  ],
  nextIds: {
    usuario: 4,
    comentario: 4,
  },
});

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getDatabase() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = DEFAULT_DATA();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return clone(initial);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.nextIds) {
      parsed.nextIds = {
        usuario: parsed.users.length + 1,
        comentario: parsed.comentarios.length + 1,
      };
    }
    return clone(parsed);
  } catch (error) {
    console.error("[MockDB] Error leyendo la base de datos, se reinicia:", error);
    const initial = DEFAULT_DATA();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return clone(initial);
  }
}

export function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function generateId(db, key) {
  if (!db.nextIds[key]) {
    db.nextIds[key] = 1;
  }
  const id = db.nextIds[key];
  db.nextIds[key] += 1;
  return id;
}

export function findUserByToken(db, token) {
  if (!token) return null;
  return db.users.find((user) => user.token === token);
}

export function findUserById(db, id) {
  return db.users.find((user) => user.id === Number(id));
}

export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    description: user.description,
    avatar: user.avatar,
  };
}

export function ensureToken(user) {
  if (!user.token) {
    user.token = `mock-token-${user.id}-${Date.now()}`;
  }
  return user.token;
}
