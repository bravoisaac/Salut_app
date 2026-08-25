import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiPage, ChatMessage, ChatThread } from '../app.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<ApiPage<ChatThread>>(`${environment.apiBase}/chats`);
  }

  get(chatId: number) {
    return this.http.get<ChatThread>(`${environment.apiBase}/chats/${chatId}`);
  }

  create(participantIds: number[]) {
    return this.http.post<ChatThread>(`${environment.apiBase}/chats`, {
      participant_ids: participantIds,
    });
  }

  sendMessage(chatId: number, body: string) {
    return this.http.post<ChatMessage>(`${environment.apiBase}/chats/${chatId}/messages`, {
      body,
    });
  }
}
