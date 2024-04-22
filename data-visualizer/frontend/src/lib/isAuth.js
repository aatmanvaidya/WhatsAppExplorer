const isAuth = () => {
  return localStorage.getItem("token");
};

export const userType = () => {
  return localStorage.getItem("type");
};

export const userSection = () => {
  return localStorage.getItem("section");
};

export const userPlatform = () => {
  return localStorage.getItem("platform");
};

export const userRestricted = () => {
  return localStorage.getItem("restricted") == "true";
};

export default isAuth;
