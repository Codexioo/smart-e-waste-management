export const formatImageUrl = (url?: string): string => {
  if (!url) return "";
  return url.replace("localhost:9091", "192.168.1.2:3001");
};
