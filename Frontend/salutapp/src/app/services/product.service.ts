import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  // GET /api/products
  list() {
    return this.http.get(`${environment.apiBase}/products`);
  }

  // POST /api/products
  create(body: any) {
    return this.http.post(`${environment.apiBase}/products`, body);
  }

  // PUT /api/products/:id
  update(id: number, body: any) {
    return this.http.put(`${environment.apiBase}/products/${id}`, body);
  }

  // DELETE /api/products/:id
  remove(id: number) {
    return this.http.delete(`${environment.apiBase}/products/${id}`);
  }

  // GET /api/products/:id
  getOne(id: number) {
    return this.http.get(`${environment.apiBase}/products/${id}`);
  }
}
