"use client";

import type { Metadata } from 'next';
import { useState, useMemo, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

/* ============================
   TYPES
============================ */

interface College {
  id: string;
  name: string;
  district: string;
  type: string;
  ownership: string;
  image_url: string | null;
  website: string | null;
}

/* ============================
   HOME PAGE
============================ */

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [colleges, setColleges] = useState<College[]>([]);

  /* ============================
     FETCH COLLEGES
  ============================ */
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/colleges');
        const json = await response.json();

        if (!response.ok) {
          console.error('API /api/colleges response (non-OK):', json);
          const serverMsg = json?.message || json?.error || json?.details || JSON.stringify(json);
          throw new Error(`Failed to fetch colleges: ${serverMsg}`);
        }

        // 🔹 Normalize API response → Frontend fields
        // The server already maps Supabase columns to `type`, `ownership`, and `website`.
        // Accept either shape (old raw columns or normalized fields) for safety.
        const normalized: College[] = (json.data || []).map((c: any) => ({
          id: String(c.id),
          name: c.name ?? '',
          district: c.district ?? '',
          type: (c.type ?? c.college_type) ?? '',
          ownership: (c.ownership ?? c.ownership_type) ?? '',
          image_url: c.image_url ?? null,
          website: (c.website ?? c.official_website) ?? null,
        }));

        setColleges(normalized);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };

    fetchColleges();
  }, []);

  /* ============================
     FILTER OPTIONS
  ============================ */
  // Normalize filter values (trim, collapse spaces) so identical values
  // with different surrounding whitespace/casing don't produce duplicates.
  const normalize = (v?: string) => (v ?? '').trim().replace(/\s+/g, ' ');

  const districts = useMemo(() => {
    return [...new Set(colleges.map(c => normalize(c.district)))].filter(Boolean).sort();
  }, [colleges]);

  const types = useMemo(() => {
    return [...new Set(colleges.map(c => normalize(c.type)))].filter(Boolean).sort();
  }, [colleges]);

  const ownershipTypes = useMemo(() => {
    return [...new Set(colleges.map(c => normalize(c.ownership)))].filter(Boolean).sort();
  }, [colleges]);

  /* ============================
     FILTER LOGIC
  ============================ */
  const filteredColleges = useMemo(() => {
    return colleges.filter(college => {
      const matchesSearch =
        college.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict =
        selectedDistrict === 'all' || normalize(college.district) === selectedDistrict;

      const matchesType =
        selectedType === 'all' || normalize(college.type) === selectedType;

      const matchesOwnership =
        selectedOwnership === 'all' ||
        normalize(college.ownership) === selectedOwnership;

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesType &&
        matchesOwnership
      );
    });
  }, [
    searchTerm,
    selectedDistrict,
    selectedType,
    selectedOwnership,
    colleges,
  ]);

  /* ============================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="relative bg-gradient-to-br from-[#166534] via-green-800 to-green-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            College Directory
          </h1>
          <p className="text-lg md:text-xl text-green-50">
            Official Engineering Colleges
          </p>
        </div>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="bg-gray-50 border-b py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search college name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
          />

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="all">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="all">All Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedOwnership}
            onChange={(e) => setSelectedOwnership(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="all">All Ownerships</option>
            {ownershipTypes.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredColleges.length === 0 ? (
            <p className="text-center text-gray-600">
              No colleges found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredColleges.map(college => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        Built for students • Verified links only
      </footer>
    </div>
  );
}

/* ============================
   COLLEGE CARD
============================ */

function CollegeCard({ college }: { college: College }) {
  const [imageError, setImageError] = useState(false);

  const showImage =
    college.image_url &&
    college.image_url.startsWith('http') &&
    !imageError;

  const websiteUrl = college.website
    ? (college.website.startsWith('http://') || college.website.startsWith('https://')
        ? college.website
        : `https://${college.website}`)
    : null;

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col">
      {showImage ? (
        <img
          src={college.image_url!}
          alt={college.name}
          className="h-36 w-full object-cover rounded"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-36 bg-gray-200 flex items-center justify-center rounded">
          <span className="text-gray-500 text-sm">No image</span>
        </div>
      )}

      <h3 className="mt-3 font-semibold text-sm line-clamp-2">
        {college.name}
      </h3>

      <div className="text-sm text-gray-700 mt-2 space-y-1">
        <p><strong>District:</strong> {college.district}</p>
        <p><strong>Type:</strong> {college.type?.trim() || '—'}</p>
        <p><strong>Ownership:</strong> {college.ownership?.trim() || '—'}</p>
      </div>

      {websiteUrl ? (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full py-2 mt-3 text-sm rounded flex items-center justify-center gap-2 bg-[#166534] text-white hover:bg-[#14532d]"
        >
          Visit Official Website
          <ExternalLink size={14} />
        </a>
      ) : (
        <button
          disabled
          className="mt-auto w-full py-2 mt-3 text-sm rounded flex items-center justify-center gap-2 bg-gray-200 text-gray-500 cursor-not-allowed"
        >
          Website not available
        </button>
      )}
    </div>
  );
}

// generateMetadata is used by Next.js App Router to produce per-page metadata on the server.
// It reads the `district` search param (if present) and returns a contextual title/description.
// Note: this runs on the server and expects `searchParams` from the routing layer.
// generateMetadata removed from this client component — generated at layout level instead.
