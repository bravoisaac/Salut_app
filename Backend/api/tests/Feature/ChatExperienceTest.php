<?php

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\ChatParticipant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_body_is_trimmed_and_moves_chat_to_the_top(): void
    {
        Carbon::setTestNow('2026-08-25 10:00:00');
        [$sender, $chat] = $this->chatWithTwoParticipants();
        $originalUpdatedAt = $chat->updated_at;
        Carbon::setTestNow('2026-08-25 10:05:00');

        Sanctum::actingAs($sender);
        $response = $this->postJson("/api/chats/{$chat->id}/messages", [
            'body' => '  Hola, confirmo la cita.  ',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('body', 'Hola, confirmo la cita.');

        $this->assertTrue($chat->fresh()->updated_at->greaterThan($originalUpdatedAt));
        $this->assertDatabaseHas('chat_messages', [
            'chat_id' => $chat->id,
            'sender_id' => $sender->id,
            'body' => 'Hola, confirmo la cita.',
        ]);
    }

    public function test_whitespace_only_message_is_rejected(): void
    {
        [$sender, $chat] = $this->chatWithTwoParticipants();
        Sanctum::actingAs($sender);

        $this->postJson("/api/chats/{$chat->id}/messages", ['body' => '   '])
            ->assertStatus(422)
            ->assertJson(['message' => 'El mensaje no puede estar vacío']);
    }

    public function test_message_length_is_limited(): void
    {
        [$sender, $chat] = $this->chatWithTwoParticipants();
        Sanctum::actingAs($sender);

        $this->postJson("/api/chats/{$chat->id}/messages", ['body' => str_repeat('a', 4001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('body');
    }

    public function test_user_cannot_create_a_chat_only_with_themself(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/chats', ['participant_ids' => [$user->id]])
            ->assertStatus(422)
            ->assertJson(['message' => 'Selecciona al menos otro participante']);
    }

    private function chatWithTwoParticipants(): array
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $chat = Chat::create();
        ChatParticipant::create(['chat_id' => $chat->id, 'user_id' => $sender->id]);
        ChatParticipant::create(['chat_id' => $chat->id, 'user_id' => $recipient->id]);

        return [$sender, $chat];
    }
}
