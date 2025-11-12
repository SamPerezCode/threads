import { API_BASE_URL, USE_MOCK_API } from "../config/apiConfig";

const ABSOLUTE_AVATAR_REGEX = /^(https?:\/\/|data:)/i;

export function getAvatarUrl(avatar) {
  if (!avatar) {
    return "/default-avatar.png";
  }

  if (ABSOLUTE_AVATAR_REGEX.test(avatar)) {
    return avatar;
  }

  if (avatar.startsWith("/")) {
    if (USE_MOCK_API) {
      return avatar;
    }
    if (avatar === "/default-avatar.png") {
      return avatar;
    }
    return `${API_BASE_URL}${avatar}`;
  }

  return avatar;
}
