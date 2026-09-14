import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FundEntry } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import SearchFilterBar from '../components/SearchFilterBar';
import EntryTable from '../components/EntryTable';
import AdminPanel from '../components/AdminPanel';
import { Plus, LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  const [entries, setEntries] = useState<FundEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalContributors, setTotalContributors] = useState(0);
  const [totalFund, setTotalFund] = useState(0);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from('fund_entries')
        .select('year');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);
        if (!years.includes(currentYear)) years.unshift(currentYear);
        setAvailableYears(years);
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message?.includes('Failed to fetch')) {
        setFetchError("Network Error: Could not connect to Supabase. Please check if your adblocker is blocking the request, or if your Supabase project is paused/inactive.");
        console.warn('Network connection to Supabase failed for fetchYears.');
      } else {
        console.error('Error fetching years:', error);
      }
    }
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      let query = supabase
        .from('fund_entries')
        .select('*')
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('person_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        if (error.code === 'PGRST205') {
          setFetchError("Database tables are not created yet. Please run the SQL schema in your Supabase dashboard.");
        } else {
          setFetchError(error.message);
        }
        throw error;
      }
      
      setFetchError(null);
      if (data) {
        setEntries(data as FundEntry[]);
        
        // Calculate summary
        setTotalEntries(data.length);
        const uniqueContributors = new Set(data.map(d => d.person_name.toLowerCase().trim()));
        setTotalContributors(uniqueContributors.size);
        const total = data.reduce((sum, entry) => sum + entry.amount, 0);
        setTotalFund(total);
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message?.includes('Failed to fetch')) {
        setFetchError("Network Error: Could not connect to Supabase. Please check if your adblocker is blocking the request, or if your Supabase project is paused/inactive.");
        // Log as warning instead of error to avoid triggering the AI Studio error overlay
        console.warn('Network connection to Supabase failed. This is usually caused by browser privacy shields (like Brave) blocking third-party API requests inside the preview iframe.');
      } else {
        console.error('Error fetching data:', error);
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedYear, searchTerm]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/images/Baitul-Azim-Masjid.jpg"
              alt="Baitul Azim Masjid"
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
            <img
              src="/images/Gilani-Furkaniya-Madrasha.jpg"
              alt="Gilani Furkania Madrasha"
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">তহবিল ট্র্যাকার</h1>
              <p className="text-xs text-gray-500">Baitul Azim Masjid & Gilani Furkania Madrasha</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-1" />
              {profile?.email} 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                profile?.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {profile?.role}
              </span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <button
            onClick={() => navigate('/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Entry
          </button>
        </div>

        <SummaryCard 
          year={selectedYear}
          totalEntries={totalEntries}
          totalContributors={totalContributors}
          totalFund={totalFund}
        />

        <SearchFilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
        />

        {fetchError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 flex flex-col gap-3">
            <h3 className="font-bold text-lg">Connection Error</h3>
            <p>{fetchError}</p>
            {fetchError.includes('Network Error') && (
              <div className="mt-2 flex gap-3">
                <button 
                  onClick={() => { setFetchError(null); fetchYears(); fetchData(); }}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Retry Connection
                </button>
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-gray-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                >
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        )}

        {dataLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : (
          <EntryTable 
            entries={entries} 
            userRole={profile?.role || 'user'} 
            onRefresh={fetchData}
          />
        )}

        {profile?.role === 'admin' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}