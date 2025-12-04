<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Campos que se van a poder crear / actualizar desde la API
    protected $fillable = [
        'name',
        'description',
        'price',
        'fecha',
        'estado_aprobacion',
        'estado_proceso',
    ];

    // Casts para que Laravel trate la fecha como fecha (no texto)
    protected $casts = [
        'fecha' => 'date',
    ];
}
