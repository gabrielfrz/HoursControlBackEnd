import {
  registerUser,
  loginUser,
  getAllUsersWithPoints,
  updateUserData,
  deleteUserById
} from "../services/user.service.js";

// Registrar novo usuário
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

// Listar todos os usuários (somente ADM)
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

// Atualizar dados do usuário (nome, email, senha, contrato)
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res
        .status(403)
        .json({ message: "Acesso negado: apenas ADM pode editar" });
    }

    const { id } = req.params;
    const { name, email, password, contractHours } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (password) fieldsToUpdate.password = password;
    if (contractHours) fieldsToUpdate.contractHours = contractHours;

    console.log("Atualizando com:", fieldsToUpdate); 

    const updatedUser = await updateUserData(id, fieldsToUpdate);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const rawId = req.params.id;
    const userId = Number(rawId);

    console.log("Tentando deletar ID:", rawId, "Convertido:", userId);
    console.log("Usuário autenticado:", req.user);

    if (!req.user || req.user.role !== "adm") {
      return res.status(403).json({ message: "Apenas ADM pode excluir usuários" });
    }

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID inválido para exclusão" });
    }

    const result = await deleteUserById(userId);

    if (!result) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ message: `Usuário ${result.name} excluído com sucesso` });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return res.status(400).json({ message: error.message || "Erro inesperado" });
  }
};

