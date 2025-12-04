import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.storage.create();
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${environment.apiBase}/register`, {
      name,
      email,
      password,
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${environment.apiBase}/login`, {
      email,
      password,
    });
  }

  me() {
    return this.http.get(`${environment.apiBase}/me`);
  }

  logout() {
    return this.http.post(`${environment.apiBase}/logout`, {});
  }

  async setToken(token: string) {
    await this.storage.set(this.tokenKey, token);
  }

  async getToken() {
    return this.storage.get(this.tokenKey);
  }

  async clearToken() {
    await this.storage.remove(this.tokenKey);
  }
}
