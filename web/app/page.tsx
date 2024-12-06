"use client";
import { useState, useEffect } from "react";

interface Person {
  name: string;
  introduction: string;
  gender: string;
  age: number;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/persons/search`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const data: Person[] = await response.json();
        setSearchResults(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "データの取得中にエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/persons/rag_search?${
          searchQuery ? `query=${encodeURIComponent(searchQuery)}` : ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }

      const data: Person[] = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "検索中にエラーが発生しました"
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        運命の人を検索しよう
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="どんな人と巡り会いたい？"
            className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {isLoading && <div className="text-center text-gray-600">検索中...</div>}

      {error && <div className="text-center text-red-600">{error}</div>}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((person, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-purple-600">
                  {person.name}
                </h2>
                <div className="text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                    {person.gender}
                  </span>
                  <span className="ml-2 bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                    {person.age}歳
                  </span>
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">
                {person.introduction}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && searchResults.length === 0 && searchQuery && (
        <div className="text-center text-gray-600">
          検索結果が見つかりませんでした
        </div>
      )}
    </div>
  );
}
