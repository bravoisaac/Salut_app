<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Lista todos los registros (paginado)
     */
    public function index()
    {
        // devolvemos los últimos primero
        return Product::orderByDesc('id')->paginate(20);
    }

    /**
     * POST /api/products
     * Crea un nuevo registro
     */
    public function store(Request $request)
    {
        // validamos lo que manda el front
        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'price'              => 'required|numeric|min:0',

            // campos que agregaste
            'fecha'              => 'required|date',

            // aprobado / rechazado / pendiente
            'estado_aprobacion'  => 'nullable|string|in:pendiente,aprobado,rechazado',

            // confirmado / en_proceso
            'estado_proceso'     => 'nullable|string|in:en_proceso,confirmado',
        ]);

        // si el front no manda estado, aplicamos default
        if (!isset($data['estado_aprobacion'])) {
            $data['estado_aprobacion'] = 'pendiente';
        }

        if (!isset($data['estado_proceso'])) {
            $data['estado_proceso'] = 'en_proceso';
        }

        // creamos en BD
        $product = Product::create($data);

        // devolvemos 201 Created
        return response()->json($product, 201);
    }

    /**
     * GET /api/products/{product}
     * Devuelve un registro específico
     */
    public function show(Product $product)
    {
        return $product;
    }

    /**
     * PUT /api/products/{product}
     * Actualiza un registro existente
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'               => 'sometimes|required|string|max:255',
            'description'        => 'nullable|string',
            'price'              => 'sometimes|required|numeric|min:0',

            'fecha'              => 'sometimes|required|date',

            'estado_aprobacion'  => 'nullable|string|in:pendiente,aprobado,rechazado',
            'estado_proceso'     => 'nullable|string|in:en_proceso,confirmado',
        ]);

        $product->update($data);

        return $product;
    }

    /**
     * DELETE /api/products/{product}
     * Elimina un registro
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'deleted' => true,
        ]);
    }
}
