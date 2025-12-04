<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // ← Esto está bien. Necesitamos HasApiTokens para Sanctum.

    /**
     * Campos que se pueden asignar con create() / update()
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Campos que NO se van en la respuesta JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts automáticos
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',

            // 💡 IMPORTANTE:
            // 'password' => 'hashed' significa:
            // cada vez que hagas User::create([... 'password' => '12345678' ...])
            // Laravel VA A HASHEAR la contraseña solo.
            //
            // O sea, tú NO tienes que hacer Hash::make() manualmente.
            'password' => 'hashed',
        ];
    }
}
