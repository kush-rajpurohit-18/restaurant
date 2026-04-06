import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from '../store/data.store';

@Injectable()
export class UsersRepository {
  constructor(private readonly store: DataStore) {}

  findByEmail(email: string) {
    return Promise.resolve(this.store.users.find(u => u.email === email) ?? null);
  }

  findById(id: string) {
    const user = this.store.users.find(u => u.id === id);
    if (!user) return Promise.resolve(null);
    return Promise.resolve({ id: user.id, email: user.email, name: user.name, role: user.role });
  }

  create(data: { email: string; name: string; passwordHash: string; role: string }) {
    const user = { id: uuidv4(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.store.users.push(user);
    return Promise.resolve(user);
  }
}
