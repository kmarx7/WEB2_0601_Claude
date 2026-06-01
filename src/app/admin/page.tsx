"use client";

import { useState, useCallback } from "react";
import type { SheetRow } from "@/lib/googleSheets";

type SortKey = keyof SheetRow;
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "timestamp", label: "등록 시각" },
  { key: "name", label: "이름" },
  { key: "phone", label: "전화" },
  { key: "email", label: "이메일" },
  { key: "product_or_class", label: "관심 제품/수업" },
  { key: "contact_method", label: "선호 연락" },
  { key: "message", label: "문의 내용" },
  { key: "privacy_required_consent", label: "필수 동의" },
  { key: "optional_info_consent", label: "추가 동의" },
  { key: "marketing_consent", label: "광고 동의" },
  { key: "source", label: "출처" },
];

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<SheetRow[]>([]);
  const [filtered, setFiltered] = useState<SheetRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(res.status === 401 ? "인증 토큰이 올바르지 않습니다." : "데이터를 불러오지 못했습니다.");
        return;
      }
      setLeads(json.data);
      setFiltered(json.data);
      setAuthed(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(
      leads.filter((row) =>
        Object.values(row).some((v) => v.toLowerCase().includes(q))
      )
    );
  }

  function handleSort(key: SortKey) {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(dir);
    setFiltered((prev) =>
      [...prev].sort((a, b) => {
        const av = a[key] ?? "";
        const bv = b[key] ?? "";
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    );
  }

  function exportCsv() {
    const header = COLUMNS.map((c) => c.label).join(",");
    const rows = filtered.map((row) =>
      COLUMNS.map((c) => `"${(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 로그인 화면
  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mb-6">ADMIN_SECRET 토큰을 입력하세요.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLeads(token);
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="password"
              placeholder="관리자 토큰"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const consentBadge = (v: string) =>
    v === "Y" ? (
      <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Y</span>
    ) : (
      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">N</span>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-screen-xl">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">제출 내역</h1>
            <p className="text-sm text-gray-500 mt-0.5">총 {filtered.length}건 (전체 {leads.length}건)</p>
          </div>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="이름, 전화, 제품명 등 검색..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              CSV 다운로드
            </button>
            <button
              onClick={() => fetchLeads(token)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              새로고침
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 테이블 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-blue-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-gray-400">
                      {search ? "검색 결과가 없습니다." : "등록된 내역이 없습니다."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{row.timestamp}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.phone}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate" title={row.product_or_class}>
                        {row.product_or_class}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.contact_method || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={row.message}>
                        {row.message || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">{consentBadge(row.privacy_required_consent)}</td>
                      <td className="px-4 py-3 text-center">{consentBadge(row.optional_info_consent)}</td>
                      <td className="px-4 py-3 text-center">{consentBadge(row.marketing_consent)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{row.source}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
