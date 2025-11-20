const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');

class AuthService {
  async register(email, username, password) {
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) throw new Error('Cet email est déjà utilisé');

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) throw new Error('Ce nom d\'utilisateur est déjà pris');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, role: 'USER', reputation: 0 }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Email ou mot de passe incorrect');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Email ou mot de passe incorrect');

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true, reputation: true, createdAt: true }
    });
  }

  async updateUserRole(userId, newRole) {
    const validRoles = ['USER', 'EXPERT', 'ADMIN'];
    if (!validRoles.includes(newRole)) throw new Error('Rôle invalide');

    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, username: true, role: true, reputation: true, createdAt: true }
    });
  }

  async updateReputation(userId, reputationChange) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const newReputation = user.reputation + reputationChange;
    let newRole = user.role;
    if (newReputation >= 10 && user.role === 'USER') newRole = 'EXPERT';

    return await prisma.user.update({
      where: { id: userId },
      data: { reputation: newReputation, role: newRole },
      select: { id: true, email: true, username: true, role: true, reputation: true, createdAt: true }
    });
  }

  async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, reputation: true, createdAt: true }
    });
  }
}

module.exports = new AuthService();