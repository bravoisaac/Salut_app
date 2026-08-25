import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AppUser, ChatMessage, ChatThread } from '../../app.models';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, EmptyStateComponent, LoadingStateComponent],
})
export class ChatsPage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly route = inject(ActivatedRoute);
  loading = false;
  openingChat = false;
  sending = false;
  errorMsg = '';
  currentUser: AppUser | null = null;
  chats: ChatThread[] = [];
  selectedChat: ChatThread | null = null;
  messageBody = '';
  private pendingChatId: number | null = null;
  private routeSubscription?: Subscription;

  async ngOnInit() {
    this.currentUser = await this.resolveCurrentUser();
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const chatId = Number(params.get('chat'));
      this.pendingChatId = Number.isFinite(chatId) && chatId > 0 ? chatId : null;
    });
    this.loadChats();
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }

  private async resolveCurrentUser(): Promise<AppUser | null> {
    const storedUser = await this.authService.getUser();
    if (storedUser?.id) return storedUser as AppUser;
    return new Promise(resolve => {
      this.authService.me().subscribe({
        next: async (res) => {
          const user = res as AppUser;
          if (user.id) await this.authService.setUser(user);
          resolve(user);
        },
        error: () => resolve(null),
      });
    });
  }

  loadChats(background = false) {
    if (!background) this.loading = true;
    this.errorMsg = '';
    this.chatService.list().subscribe({
      next: (res) => {
        this.chats = Array.isArray(res?.data) ? res.data : [];
        const targetId = this.pendingChatId || this.selectedChat?.id;
        if (targetId) {
          const target = this.chats.find(chat => chat.id === targetId) || { id: targetId };
          this.pendingChatId = null;
          this.openChat(target);
        }
      },
      error: (err) => this.errorMsg = err?.error?.message || 'No se pudieron cargar las conversaciones.',
    }).add(() => this.loading = false);
  }

  openChat(chat: ChatThread) {
    if (!chat.id || this.openingChat) return;
    this.openingChat = true;
    this.errorMsg = '';
    this.chatService.get(chat.id).subscribe({
      next: (res) => this.selectedChat = res,
      error: (err) => this.errorMsg = err?.error?.message || 'No se pudo abrir la conversación.',
    }).add(() => this.openingChat = false);
  }

  closeChat() {
    this.selectedChat = null;
    this.messageBody = '';
  }

  sendMessage() {
    const body = this.messageBody.trim();
    if (!this.selectedChat?.id || !body || this.sending) return;
    this.sending = true;
    this.errorMsg = '';
    this.chatService.sendMessage(this.selectedChat.id, body).subscribe({
      next: (message) => {
        const current = this.selectedChat as ChatThread;
        this.selectedChat = { ...current, messages: [...(current.messages || []), message], updated_at: message.created_at };
        const updatedSummary = { ...current, messages: [message], updated_at: message.created_at };
        this.chats = [updatedSummary, ...this.chats.filter(chat => chat.id !== current.id)];
        this.messageBody = '';
      },
      error: (err) => this.errorMsg = err?.error?.message || 'No se pudo enviar el mensaje.',
    }).add(() => this.sending = false);
  }

  chatTitle(chat: ChatThread) {
    const users = this.otherParticipants(chat);
    return users.length ? users.map(user => user.name || user.email || `Usuario #${user.id}`).join(', ') : 'Conversación';
  }

  lastMessage(chat: ChatThread) {
    return chat.messages?.[0]?.body?.trim() || 'Aún no hay mensajes';
  }

  messageSender(message: ChatMessage) {
    return Number(message.sender_id) === Number(this.currentUser?.id) ? 'Tú' : message.sender?.name || message.sender?.email || 'Usuario';
  }

  isOwnMessage(message: ChatMessage) {
    return Number(message.sender_id) === Number(this.currentUser?.id);
  }

  initials(value: string) {
    return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CH';
  }

  conversationTime(chat: ChatThread) {
    const value = chat.messages?.[0]?.created_at || chat.updated_at;
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const today = new Date();
    return date.toDateString() === today.toDateString()
      ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(date)
      : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(date);
  }

  messageTime(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }

  private otherParticipants(chat: ChatThread): AppUser[] {
    return (chat.participants || []).map(participant => participant.user).filter((user): user is AppUser => !!user && Number(user.id) !== Number(this.currentUser?.id));
  }
}
