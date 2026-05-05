import { Model, PopulateOptions } from 'mongoose';
import { TableQueryDto } from '../dto/table-query.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeFields(
  fields?: string[] | Record<string, string>,
): string[] {
  if (!fields) {
    return [];
  }
  if (Array.isArray(fields)) {
    return fields.filter(Boolean);
  }
  return Object.entries(fields)
    .filter(([k]) => /^\d+$/.test(k))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v);
}

function buildSort(
  sort: Record<string, string> | undefined,
  defaultSort: Record<string, 1 | -1>,
): Record<string, 1 | -1> {
  if (!sort || Object.keys(sort).length === 0) {
    return defaultSort;
  }
  const out: Record<string, 1 | -1> = {};
  for (const [k, v] of Object.entries(sort)) {
    if (v === 'asc' || v === '1') {
      out[k] = 1;
    } else {
      out[k] = -1;
    }
  }
  return Object.keys(out).length > 0 ? out : defaultSort;
}

export async function paginateFind<TDoc>(
  model: Model<TDoc>,
  q: TableQueryDto,
  opts: {
    searchFields: string[];
    defaultSort?: Record<string, 1 | -1>;
    populate?: PopulateOptions | PopulateOptions[] | string | string[];
  },
): Promise<PaginatedResult<TDoc>> {
  const page = Math.max(1, Number(q.options?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.options?.limit) || 10));
  const filter: Record<string, unknown> = {};

  const keyword = q.search?.keyword?.trim();
  const requestedFields = normalizeFields(q.search?.fields as string[]);
  const searchOn =
    requestedFields.length > 0
      ? requestedFields.filter((f) => opts.searchFields.includes(f))
      : opts.searchFields;

  if (keyword && searchOn.length > 0) {
    (filter as Record<string, unknown>).$or = searchOn.map((field) => ({
      [field]: new RegExp(escapeRegex(keyword), 'i'),
    }));
  }

  const defaultSort = opts.defaultSort ?? { createdAt: -1 };
  const sort = buildSort(q.options?.sort, defaultSort);
  const skip = (page - 1) * limit;

  let query = model
    .find(filter as never)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const populations: any[] = [];
  if (opts.populate) {
    if (Array.isArray(opts.populate)) {
      populations.push(...opts.populate);
    } else {
      populations.push(opts.populate);
    }
  }

  if (q.options?.populate) {
    if (Array.isArray(q.options.populate)) {
      populations.push(...q.options.populate);
    } else {
      populations.push(q.options.populate);
    }
  }

  if ((q as any).populate) {
    if (Array.isArray((q as any).populate)) {
      populations.push(...(q as any).populate);
    } else {
      populations.push((q as any).populate);
    }
  }

  if (populations.length > 0) {
    query = query.populate(populations as any);
  }
  const [docs, totalDocs] = await Promise.all([
    query.exec() as Promise<TDoc[]>,
    model.countDocuments(filter as never).exec(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));

  return {
    docs: docs as TDoc[],
    totalDocs,
    limit,
    totalPages,
    page,
    pagingCounter: totalDocs === 0 ? 0 : skip + 1,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}
