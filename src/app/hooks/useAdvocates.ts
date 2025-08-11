"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { advocates } from "../../db/schema";
import type { ListAdvocateFilters } from "../api/advocates/types";

type Advocate = typeof advocates.$inferSelect;

type Params = {
  page: number;
  pageSize: number;
  filters?: ListAdvocateFilters;
};

export function useAdvocates({ page, pageSize, filters }: Params) {
  const [data, setData] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchAdvocates = useCallback(async () => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      if (filters?.firstName) params.set("firstName", filters.firstName);
      if (filters?.lastName) params.set("lastName", filters.lastName);
      if (filters?.city) params.set("city", filters.city);
      if (filters?.degree) params.set("degree", filters.degree);
      if (filters?.specialties && filters.specialties.length > 0) {
        params.set("specialties", filters.specialties.join(","));
      }
      if (typeof filters?.yearsOfExperience === "number") {
        params.set("yearsOfExperience", String(filters.yearsOfExperience));
      }
      if (typeof filters?.minYearsOfExperience === "number") {
        params.set("minYearsOfExperience", String(filters.minYearsOfExperience));
      }
      if (typeof filters?.maxYearsOfExperience === "number") {
        params.set("maxYearsOfExperience", String(filters.maxYearsOfExperience));
      }

      const res = await fetch(`/api/advocates?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const body = (await res.json()) as { data: Advocate[] };
      setData(body.data);
      // If the page is full, then there's probably more data to fetch
      setHasNextPage(body.data.length >= pageSize);
    } catch (err: unknown) {
      if ((err as any)?.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load advocates");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  return { data, loading, error, hasNextPage };
}


