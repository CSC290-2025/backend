import { Hono } from 'hono';
import { UserController } from '@/controllers';

const userRoutes = new Hono();

userRoutes.get('/:id', UserController.getUser);
userRoutes.get('/', UserController.getUsers);
userRoutes.post('/', UserController.createUser);
userRoutes.put('/:id', UserController.updateUser);
userRoutes.delete('/:id', UserController.deleteUser);

userRoutes.get('/search', UserController.searchUsers);
userRoutes.get('/email/:email', UserController.getUserByEmail);

export { userRoutes };
