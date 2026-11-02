<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityEvent\StoreCommunityEventRequest;
use App\Http\Requests\CommunityEvent\UpdateCommunityEventRequest;
use App\Http\Resources\CommunityEventResource;
use App\Models\CommunityEvent;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CommunityEventController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'month' => ['sometimes', 'date_format:Y-m'],
        ]);

        $query = CommunityEvent::query()
            ->visibleTo($request->user())
            ->with(['division', 'creator'])
            ->orderBy('start_at');

        if (isset($data['month'])) {
            $start = Carbon::createFromFormat('Y-m', $data['month'])->startOfMonth();
            $end = $start->copy()->endOfMonth();

            $query->whereBetween('start_at', [$start, $end]);
        }

        return CommunityEventResource::collection($query->get());
    }

    public function store(StoreCommunityEventRequest $request): JsonResponse
    {
        $event = DB::transaction(function () use ($request) {
            $event = CommunityEvent::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
            ]);

            $this->notifications->eventCreated($event, $request->user());

            return $event;
        });

        return (new CommunityEventResource($event->load(['division', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(
        UpdateCommunityEventRequest $request,
        CommunityEvent $event,
    ): CommunityEventResource {
        $event->update($request->validated());

        return new CommunityEventResource($event->refresh()->load(['division', 'creator']));
    }

    public function destroy(CommunityEvent $event): Response
    {
        $event->delete();

        return response()->noContent();
    }
}
