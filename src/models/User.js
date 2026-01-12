class User {
    constructor(id, username, password, role = 'user', createdAt = new Date()) {
        this.id = id;
        this.username = username;
        this.password = password; // In production, this should be hashed
        this.role = role; // 'admin', 'user'
        this.createdAt = createdAt;
        this.isActive = true;
        this.lastLogin = new Date(); // Add loginTime
    }

    // Static methods for data management
    static getAllUsers() {
        // Mock database - in production, this would be a real database
        return [
            new User(1, 'admin', 'admin123', 'admin', new Date('2024-01-01')),
            new User(2, 'user1', 'password1', 'user', new Date('2024-01-02')),
            new User(3, 'user2', 'password2', 'user', new Date('2024-01-03')),
        ];
    }

    static findByUsername(username) {
        const users = this.getAllUsers();
        return users.find(user => user.username === username);
    }

    static validateCredentials(username, password) {
        const user = this.findByUsername(username);
        return user && user.password === password && user.isActive;
    }

    static updateLastLogin(userId) {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.lastLogin = new Date();
        }
        return user;
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            role: this.role,
            createdAt: this.createdAt,
            isActive: this.isActive,
            lastLogin: this.lastLogin
        };
    }
}

export default User;
