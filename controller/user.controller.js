import { registerUser, loginUser, getAllUsersWithPoints } from '../services/user.service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUser(name, email, password, role || 'estagiario');
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Verificar se usuário é adm
    if (req.user.role !== 'adm') {
      return res.status(403).json({ message: 'Acesso negado: apenas ADM pode acessar' });
    }
    const users = await getAllUsersWithPoints();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
