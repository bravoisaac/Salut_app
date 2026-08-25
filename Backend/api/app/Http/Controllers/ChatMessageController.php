<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatMessageController extends Controller
{
    public function store(Request $request, Chat $chat)
    {
        $user = $request->user();
        $isParticipant = ChatParticipant::query()
            ->where('chat_id', $chat->id)
            ->where('user_id', $user->id)
            ->exists();

        if (! $isParticipant && ! $user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'body' => 'nullable|string|max:4000',
            'attachment_url' => 'nullable|string|max:255',
            'attachment_type' => 'nullable|required_with:attachment_url|string|max:50',
        ]);

        $body = trim((string) ($data['body'] ?? ''));
        $attachmentUrl = trim((string) ($data['attachment_url'] ?? ''));

        if ($body === '' && $attachmentUrl === '') {
            return response()->json(['message' => 'El mensaje no puede estar vacío'], 422);
        }

        $message = DB::transaction(function () use ($chat, $user, $data, $body, $attachmentUrl) {
            $message = ChatMessage::create([
                'chat_id' => $chat->id,
                'sender_id' => $user->id,
                'body' => $body !== '' ? $body : null,
                'attachment_url' => $attachmentUrl !== '' ? $attachmentUrl : null,
                'attachment_type' => $attachmentUrl !== '' ? ($data['attachment_type'] ?? null) : null,
            ]);
            $chat->touch();

            return $message;
        });

        $message->load('sender:id,name,email');

        return response()->json($message, 201);
    }
}
