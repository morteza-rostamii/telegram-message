import { BACKEND_URL } from "#@/config/config.js";

function profileEditor({ profile }) {
  return {
    ...profile,
    avatar:
      profile?.avatar && profile?.avatar.startsWith("http")
        ? profile.avatar
        : BACKEND_URL + profile.avatar,
  };
}

export default profileEditor;
