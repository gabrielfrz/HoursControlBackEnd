import {
  registerUser,
  loginUser,
  getAllUsersWithPoints,
  updateUserData
} from "../services/user.service.js";

// Registrar
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUser(
      name,
      email,
      password,
      role || "estagiario"
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Listar todos os usuários (admin)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res
        .status(403)
        .json({ message: "Acesso negado: apenas ADM pode acessar" });
    }
    const users = await getAllUsersWithPoints();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar nome ou foto (admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res
        .status(403)
        .json({ message: "Acesso negado: apenas ADM pode editar" });
    }

    const { id } = req.params;
    const { name, photoUrl } = req.body;

    const updatedUser = await updateUserData(id, { name, photoUrl });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
