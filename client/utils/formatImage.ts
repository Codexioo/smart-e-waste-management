import axios from "../api/axiosInstance";

export const formatImageUrl = (url?: string): string => {
  if (!url) return "";
  try {
    const base = new URL(axios.defaults.baseURL || "http://localhost:3001");
    const host = base.port ? `${base.hostname}:${base.port}` : base.hostname;
    return url.replace(/localhost:\d+/, host);
  } catch {
    return url;
  }
};
