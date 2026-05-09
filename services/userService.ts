import API from "./api";

export const getUsers = async () => {
  const response = await API.get("/users");

  return response.data;
};

export const createUser = async (payload: any) => {
  const response = await API.post("/users/register", payload);

  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await API.delete(`/users/${id}`);

  return response.data;
};

export const changePassword = async (id: string, password: string) => {
  const response = await API.patch(`/users/change-password/${id}`, {
    password,
  });

  return response.data;
};

export const updateUser = async (id: string, payload: any) => {
  const response = await API.put(`/users/${id}`, payload);

  return response.data;
};
