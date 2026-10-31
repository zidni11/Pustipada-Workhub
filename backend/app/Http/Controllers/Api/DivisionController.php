<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDivisionRequest;
use App\Http\Requests\Admin\UpdateDivisionRequest;
use App\Http\Resources\DivisionResource;
use App\Models\Division;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class DivisionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return DivisionResource::collection(
            Division::query()->orderBy('name')->get(),
        );
    }

    public function publicIndex(): JsonResponse
    {
        $divisions = Division::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return response()->json(['data' => $divisions]);
    }

    public function store(StoreDivisionRequest $request): JsonResponse
    {
        $division = Division::create($request->validated());

        return (new DivisionResource($division))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateDivisionRequest $request, Division $division): DivisionResource
    {
        $division->update($request->validated());

        return new DivisionResource($division->refresh());
    }

    public function destroy(Division $division): Response
    {
        if ($division->users()->exists() || $division->tasks()->exists()) {
            return response()->json([
                'message' => 'Divisi masih memiliki user atau task dan tidak dapat dihapus.',
            ], 422);
        }

        $division->delete();

        return response()->noContent();
    }
}
