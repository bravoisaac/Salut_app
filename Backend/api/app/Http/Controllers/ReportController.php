<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'status' => 'nullable|in:open,resolved,dismissed',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Report::query()
            ->with('reporter:id,name,email,role')
            ->latest();

        if (isset($data['status'])) {
            $query->where('status', $data['status']);
        }

        return response()->json($query->paginate($data['per_page'] ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'target_type' => 'required|string|max:50',
            'target_id' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'target_type' => $data['target_type'],
            'target_id' => $data['target_id'],
            'reason' => $data['reason'],
            'status' => 'open',
        ]);

        return response()->json($report, 201);
    }

    public function update(Request $request, Report $report)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'status' => 'required|string|in:open,resolved,dismissed',
        ]);

        $report->update([
            'status' => $data['status'],
        ]);

        $report->load('reporter:id,name,email,role');

        return response()->json($report);
    }
}
