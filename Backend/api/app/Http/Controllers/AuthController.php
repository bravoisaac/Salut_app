<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validar datos de entrada
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        // IMPORTANTE:
        // Aquí NO usamos Hash::make manual porque tu modelo ya tiene 'password' => 'hashed'
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // Laravel la encripta solo
        ]);

        // Crear token personal para el usuario (Sanctum)
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        // Validar datos de login
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Buscar usuario por email
        $user = User::where('email', $data['email'])->first();

        // Revisar credenciales
        if (!$user || !Hash::check($data['password'], $user->password)) {
            // Esto devuelve error 422 con el mensaje en formato Laravel
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son válidas.'],
            ]);
        }

        // Crear token
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login correcto',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function me(Request $request)
    {
        // Devuelve el usuario autenticado según el token Bearer
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        // Eliminar SOLO el token actual (logout en este dispositivo)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout',
        ]);
    }
}
