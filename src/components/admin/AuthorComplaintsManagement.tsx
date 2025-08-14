'use client';
// Converted from Magic Patterns
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Flag, AlertTriangle, User, Clock, Calendar, Shield, CheckCircle, XCircle, Eye, EyeOff, MoreHorizontal, Filter, Search, ChevronDown, X, Calendar as CalendarIcon, Ban, AlertCircle, ThumbsDown, FileText, ArrowUpDown } from 'lucide-react';
// Types
interface AuthorComplaint {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  reportReason: string;
  reportDetails: string;
  reporterName: string;
  reporterEmail: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  dateReported: string;
  lastUpdated: string;
  actionTaken?: string;
  banDuration?: string;
  notes?: string;
}
export const AuthorComplaintsManagement = () => {
  const [complaints, setComplaints] = useState<AuthorComplaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<AuthorComplaint | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [sortField, setSortField] = useState('dateReported');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [banDuration, setBanDuration] = useState('7days');
  const [actionNotes, setActionNotes] = useState('');
  // Filter complaints based on status and search query
  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesSearch = complaint.authorName.toLowerCase().includes(searchQuery.toLowerCase()) || complaint.reportReason.toLowerCase().includes(searchQuery.toLowerCase()) || complaint.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  // Sort complaints
  const [sortedComplaints, setSortedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSortedComplaints = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSortedComplaints(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setSortedComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSortedComplaints();
  }, []);