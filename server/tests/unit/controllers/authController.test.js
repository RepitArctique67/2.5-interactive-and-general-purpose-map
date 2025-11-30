const authController = require('../../../src/controllers/authController');
const { User } = require('../../../src/models');
const jwt = require('jsonwebtoken');

// Mock User model and jwt
jest.mock('../../../src/models', () => ({
    User: {
        findOne: jest.fn(),
        createUser: jest.fn(),
        scope: jest.fn().mockReturnThis(),
        findByPk: jest.fn()
    }
}));
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            user: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                toSafeJSON: jest.fn().mockReturnValue({ id: 1, username: 'testuser' })
            };
            User.findOne.mockResolvedValue(null); // No existing user
            User.createUser.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mock_token');

            req.body = { username: 'testuser', email: 'test@example.com', password: 'password' };

            await authController.register(req, res, next);

            expect(User.createUser).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                token: 'mock_token',
                user: { id: 1, username: 'testuser' }
            });
        });

        it('should fail if email already exists', async () => {
            User.findOne.mockResolvedValue({ id: 1 }); // Existing user
            req.body = { email: 'existing@example.com' };

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Email already registered',
                statusCode: 400
            }));
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            const mockUser = {
                id: 1,
                validatePassword: jest.fn().mockResolvedValue(true),
                updateLastLogin: jest.fn(),
                toSafeJSON: jest.fn().mockReturnValue({ id: 1 })
            };
            User.scope.mockReturnValue(User); // Mock scope chain
            User.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mock_token');

            req.body = { email: 'test@example.com', password: 'password' };

            await authController.login(req, res, next);

            expect(mockUser.validatePassword).toHaveBeenCalledWith('password');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                token: 'mock_token',
                user: { id: 1 }
            });
        });

        it('should fail with invalid credentials', async () => {
            User.scope.mockReturnValue(User);
            User.findOne.mockResolvedValue(null); // User not found

            req.body = { email: 'wrong@example.com', password: 'password' };

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid credentials',
                statusCode: 401
            }));
        });
    });

    describe('getMe', () => {
        it('should return current user', async () => {
            const mockUser = {
                id: 1,
                toSafeJSON: jest.fn().mockReturnValue({ id: 1 })
            };
            User.findByPk.mockResolvedValue(mockUser);
            req.user = { id: 1 };

            await authController.getMe(req, res, next);

            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 1 }
            });
        });
    });
});
