# Script de création automatique - auth-service
Write-Host "🚀 Création des fichiers auth-service..." -ForegroundColor Cyan

# 1. Middleware auth.middleware.js
Write-Host "📝 Création du middleware..." -ForegroundColor Yellow
@"
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

const requireExpert = (req, res, next) => {
  if (req.user.role !== 'EXPERT' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux experts' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireExpert
};
"@ | Out-File -FilePath "src\middlewares\auth.middleware.js" -Encoding utf8

# 2. Service auth.service.js
Write-Host "📝 Création du service..." -ForegroundColor Yellow
@"
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');

class AuthService {
  async register(email, username, password) {
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      throw new Error('Cet email est déjà utilisé');
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      throw new Error('Ce nom d utilisateur est déjà pris');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER',
        reputation: 0
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword
    };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputation: true,
        createdAt: true
      }
    });

    return users;
  }

  async updateUserRole(userId, newRole) {
    const validRoles = ['USER', 'EXPERT', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Rôle invalide');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputation: true,
        createdAt: true
      }
    });

    return user;
  }

  async updateReputation(userId, reputationChange) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const newReputation = user.reputation + reputationChange;

    let newRole = user.role;
    if (newReputation >= 10 && user.role === 'USER') {
      newRole = 'EXPERT';
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        reputation: newReputation,
        role: newRole
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputation: true,
        createdAt: true
      }
    });

    return updatedUser;
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputation: true,
        createdAt: true
      }
    });

    return user;
  }
}

module.exports = new AuthService();
"@ | Out-File -FilePath "src\services\auth.service.js" -Encoding utf8

# 3. Controller
Write-Host "📝 Création du contrôleur..." -ForegroundColor Yellow
@"
const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ 
          error: 'Tous les champs sont requis (email, username, password)' 
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+`$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Format d email invalide' });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Le mot de passe doit contenir au moins 6 caractères' 
        });
      }

      const user = await authService.register(email, username, password);

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email et mot de passe requis' 
        });
      }

      const result = await authService.login(email, password);

      res.json({
        message: 'Connexion réussie',
        token: result.token,
        user: result.user
      });
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
      res.json({ 
        count: users.length,
        users 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: 'Le rôle est requis' });
      }

      const user = await authService.updateUserRole(id, role);

      res.json({
        message: 'Rôle mis à jour avec succès',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReputation(req, res) {
    try {
      const { id } = req.params;
      const { reputationChange } = req.body;

      if (reputationChange === undefined) {
        return res.status(400).json({ 
          error: 'Le changement de réputation est requis' 
        });
      }

      const user = await authService.updateReputation(id, reputationChange);

      res.json({
        message: 'Réputation mise à jour avec succès',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
"@ | Out-File -FilePath "src\controllers\auth.controller.js" -Encoding utf8

# 4. Routes
Write-Host "📝 Création des routes..." -ForegroundColor Yellow
@"
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.get('/admin/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, authController.updateUserRole);
router.patch('/users/:id/reputation', authController.updateReputation);
router.get('/users/:id', authController.getUserById);

module.exports = router;
"@ | Out-File -FilePath "src\routes\auth.routes.js" -Encoding utf8

# 5. Server
Write-Host "📝 Création du serveur..." -ForegroundColor Yellow
@"
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'auth-service',
    timestamp: new Date().toISOString() 
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log('🚀 Auth Service démarré sur le port ' + PORT);
  console.log('📍 Health check: http://localhost:' + PORT + '/health');
});

module.exports = app;
"@ | Out-File -FilePath "src\server.js" -Encoding utf8

Write-Host "✅ Tous les fichiers ont été créés avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. npx prisma generate" -ForegroundColor White
Write-Host "2. npx prisma migrate dev --name init" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White