<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ModerationFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_pending_verifications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $professional = User::factory()->create(['role' => 'health']);
        $pending = VerificationRequest::create(['user_id' => $professional->id, 'role' => 'health', 'status' => 'pending', 'payload' => []]);
        VerificationRequest::create(['user_id' => $professional->id, 'role' => 'health', 'status' => 'approved', 'payload' => []]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/verifications?status=pending')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pending->id);
    }

    public function test_admin_can_filter_open_reports(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create();
        $open = Report::create(['reporter_id' => $reporter->id, 'target_type' => 'user', 'target_id' => 99, 'reason' => 'Contenido inapropiado', 'status' => 'open']);
        Report::create(['reporter_id' => $reporter->id, 'target_type' => 'user', 'target_id' => 100, 'reason' => 'Caso cerrado', 'status' => 'resolved']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/reports?status=open')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $open->id);
    }

    public function test_moderation_filters_reject_unknown_statuses(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/verifications?status=unknown')->assertStatus(422)->assertJsonValidationErrors('status');
        $this->getJson('/api/reports?status=unknown')->assertStatus(422)->assertJsonValidationErrors('status');
    }
}
