"use client";

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from "react";
import type { advocates } from "../db/schema";
import type { ListAdvocateFilters } from "./api/advocates/types";

type Advocate = typeof advocates.$inferSelect;

type FilterFormState = {
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialtiesCsv: string; // comma-separated
  yearsOfExperience: string; // numeric string
  minYearsOfExperience: string; // numeric string
  maxYearsOfExperience: string; // numeric string
};

const initialFormState: FilterFormState = {
  firstName: "",
  lastName: "",
  city: "",
  degree: "",
  specialtiesCsv: "",
  yearsOfExperience: "",
  minYearsOfExperience: "",
  maxYearsOfExperience: "",
};

export default function Home() {
  const [data, setData] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [form, setForm] = useState<FilterFormState>(initialFormState);
  const [appliedFilters, setAppliedFilters] = useState<ListAdvocateFilters>({});

  const abortRef = useRef<AbortController | null>(null);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (appliedFilters.firstName) params.set("firstName", appliedFilters.firstName);
    if (appliedFilters.lastName) params.set("lastName", appliedFilters.lastName);
    if (appliedFilters.city) params.set("city", appliedFilters.city);
    if (appliedFilters.degree) params.set("degree", appliedFilters.degree);

    if (appliedFilters.specialties && appliedFilters.specialties.length > 0) {
      params.set("specialties", appliedFilters.specialties.join(","));
    }

    if (typeof appliedFilters.yearsOfExperience === "number") {
      params.set("yearsOfExperience", String(appliedFilters.yearsOfExperience));
    }
    if (typeof appliedFilters.minYearsOfExperience === "number") {
      params.set("minYearsOfExperience", String(appliedFilters.minYearsOfExperience));
    }
    if (typeof appliedFilters.maxYearsOfExperience === "number") {
      params.set("maxYearsOfExperience", String(appliedFilters.maxYearsOfExperience));
    }

    return params;
  }, [appliedFilters, page, pageSize]);

  const fetchAdvocates = useCallback(async () => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = buildQueryParams();
      const res = await fetch(`/api/advocates?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const body = (await res.json()) as { data: Advocate[] };
      setData(body.data);
      setHasNextPage(body.data.length >= pageSize);
    } catch (err: unknown) {
      if ((err as any)?.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load advocates");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, pageSize]);

  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const specialties = form.specialtiesCsv
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const nextFilters: ListAdvocateFilters = {
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      city: form.city.trim() || undefined,
      degree: form.degree.trim() || undefined,
      specialties: specialties.length > 0 ? specialties : undefined,
      yearsOfExperience: form.yearsOfExperience
        ? Number(form.yearsOfExperience)
        : undefined,
      minYearsOfExperience: form.minYearsOfExperience
        ? Number(form.minYearsOfExperience)
        : undefined,
      maxYearsOfExperience: form.maxYearsOfExperience
        ? Number(form.maxYearsOfExperience)
        : undefined,
    };

    setPage(1);
    setAppliedFilters(nextFilters);
  };

  const onReset = () => {
    setForm(initialFormState);
    setAppliedFilters({});
    setPage(1);
  };

  const headerSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (appliedFilters.firstName) parts.push(`First: ${appliedFilters.firstName}`);
    if (appliedFilters.lastName) parts.push(`Last: ${appliedFilters.lastName}`);
    if (appliedFilters.city) parts.push(`City: ${appliedFilters.city}`);
    if (appliedFilters.degree) parts.push(`Degree: ${appliedFilters.degree}`);
    if (appliedFilters.specialties && appliedFilters.specialties.length > 0)
      parts.push(`Specialties: ${appliedFilters.specialties.join(", ")}`);
    if (appliedFilters.yearsOfExperience != null)
      parts.push(`YoE: ${appliedFilters.yearsOfExperience}`);
    if (appliedFilters.minYearsOfExperience != null)
      parts.push(`Min YoE: ${appliedFilters.minYearsOfExperience}`);
    if (appliedFilters.maxYearsOfExperience != null)
      parts.push(`Max YoE: ${appliedFilters.maxYearsOfExperience}`);
    return parts.join(" · ");
  }, [appliedFilters]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white text-slate-800">
      <section className="px-6 md:px-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600/10 grid place-items-center">
              <span className="text-teal-700 font-semibold">S</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Solace Advocates
            </h1>
          </div>
          <p className="mt-2 text-slate-600">
            Find the right advocate to guide your care journey.
          </p>

          <div className="mt-6 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm">
            <form onSubmit={onSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First name</label>
                  <input
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="e.g., Alex"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last name</label>
                  <input
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="e.g., Martinez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g., Seattle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Degree</label>
                  <input
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.degree}
                    onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
                    placeholder="e.g., RN, LCSW"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Specialties</label>
                  <input
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.specialtiesCsv}
                    onChange={(e) => setForm((f) => ({ ...f, specialtiesCsv: e.target.value }))}
                    placeholder="e.g., oncology, pediatrics"
                  />
                  <p className="mt-1 text-xs text-slate-500">Comma-separated. Matches any.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Years of experience (exact)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.yearsOfExperience}
                    onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                    placeholder="e.g., 5"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Min years of experience</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.minYearsOfExperience}
                    onChange={(e) => setForm((f) => ({ ...f, minYearsOfExperience: e.target.value }))}
                    placeholder="e.g., 2"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Max years of experience</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={form.maxYearsOfExperience}
                    onChange={(e) => setForm((f) => ({ ...f, maxYearsOfExperience: e.target.value }))}
                    placeholder="e.g., 15"
                    min={0}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-white font-medium shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Searching…" : "Search"}
                  </button>
                  <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-slate-700 font-medium shadow-sm hover:bg-slate-50"
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Page size</span>
                  <select
                    className="rounded-md border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <p className="text-sm text-slate-600 truncate">
                {headerSubtitle || "All advocates"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">First Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Degree</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Specialties</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Years of Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Phone Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        Loading advocates…
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-rose-600">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        No advocates found
                      </td>
                    </tr>
                  )}
                  {!loading && !error && data.map((advocate) => (
                    <tr key={advocate.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 whitespace-nowrap">{advocate.firstName}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{advocate.lastName}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{advocate.city}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{advocate.degree}</td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {advocate.specialties.map((s) => (
                            <span key={s} className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">{advocate.yearsOfExperience}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {String(advocate.phoneNumber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-600">
                Page {page}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                >
                  Previous
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading || (!hasNextPage && data.length < pageSize)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
