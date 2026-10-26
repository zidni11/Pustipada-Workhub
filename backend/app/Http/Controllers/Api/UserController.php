<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()->with('division');

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('division_id')) {
            $query->where('division_id', $request->integer('division_id'));
        }

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';

            $query->where(function ($query) use ($term) {
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        return UserResource::collection(
            $query->orderBy('name')->paginate(15),
        );
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('division'));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return (new UserResource($user->load('division')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $attributes = $request->validated();

        if (array_key_exists('password', $attributes) && blank($attributes['password'])) {
            unset($attributes['password']);
        }

        $user->update($attributes);

        return new UserResource($user->refresh()->load('division'));
    }

    public function destroy(Request $request, User $user): Response
    {
        if ($request->user()->is($user)) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun sendiri.',
            ], 422);
        }

        if ($user->createdTasks()->exists()) {
            return response()->json([
                'message' => 'User memiliki task yang dibuat. Nonaktifkan akun alih-alih menghapus.',
            ], 422);
        }

        $user->delete();

        return response()->noContent();
    }
}
