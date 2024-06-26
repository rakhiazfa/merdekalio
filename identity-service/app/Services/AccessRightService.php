<?php

namespace App\Services;

use App\Http\Requests\CreateAccessRightRequest;
use App\Http\Requests\UpdateAccessRightRequest;
use App\Models\AccessRight;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AccessRightService
{
    public function findAll(): LengthAwarePaginator
    {
        $accessRights = QueryBuilder::for(AccessRight::class)
            ->allowedFilters(['name', 'method', 'uri'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return $accessRights;
    }

    public function search(): Collection
    {
        $accessRights = QueryBuilder::for(AccessRight::class)
            ->allowedFilters(['name', 'method', 'uri'])
            ->latest()
            ->get();

        return $accessRights;
    }

    public function create(CreateAccessRightRequest $request): AccessRight
    {
        $method = $request->input('method');
        $uri = $request->input('uri');

        $accessRight = AccessRight::where([
            ['method', $method],
            ['uri', $uri],
        ])->first();

        if ($accessRight) {
            throw new BadRequestHttpException('Cannot create access rights, access rights have been created.');
        }

        return AccessRight::create($request->all());
    }

    public function findById(string $id): AccessRight
    {
        $accessRight = Cache::tags(AccessRight::$cacheKey)->remember($id, 60 * 60, function () use ($id) {
            return AccessRight::find($id);
        });

        if (!$accessRight) throw new NotFoundHttpException('Access right not found');

        return $accessRight;
    }

    public function update(UpdateAccessRightRequest $request, string $id): AccessRight
    {
        $accessRight = $this->findById($id);

        $accessRight->update($request->all());

        return $accessRight;
    }

    public function delete(string $id): bool
    {
        $accessRight = $this->findById($id);

        return $accessRight->delete();
    }
}
