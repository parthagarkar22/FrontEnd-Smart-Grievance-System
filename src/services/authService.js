import API from "./api";

export const loginUser = async (data) => {
  const response = await API.post("token/", data);

  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);

  return response.data;
};

export const registerUser = async (data) => {
  return API.post("accounts/register/", data);
};

export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
