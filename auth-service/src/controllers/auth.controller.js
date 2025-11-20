const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      // 👇 MODIFIÉ : Récupération du rôle depuis le body (optionnel)
      const { email, username, password, role } = req.body;
      
      if (!email || !username || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Format d\'email invalide' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      // 👇 MODIFIÉ : Passage du rôle au service (ou undefined si non fourni)
      const user = await authService.register(email, username, password, role);
      res.status(201).json({ message: 'Utilisateur créé avec succès', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }
      const result = await authService.login(email, password);
      res.json({ message: 'Connexion réussie', token: result.token, user: result.user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const user = await authService.getMe(req.user.userId);
      res.json({ user });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await authService.getAllUsers();
      res.json({ count: users.length, users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: 'Le rôle est requis' });
      const user = await authService.updateUserRole(id, role);
      res.json({ message: 'Rôle mis à jour avec succès', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReputation(req, res) {
    try {
      const { id } = req.params;
      const { reputationChange } = req.body;
      if (reputationChange === undefined) {
        return res.status(400).json({ error: 'Le changement de réputation est requis' });
      }
      const user = await authService.updateReputation(id, reputationChange);
      res.json({ message: 'Réputation mise à jour avec succès', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();