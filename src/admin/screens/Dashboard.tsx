// Admin Dashboard - P0 Launch Requirement (AGENTS.md Section 12)
// Overview of key metrics and quick actions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../app/theme/tokens';

interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  revenueThisMonth: number;
  pendingVolunteers: number;
  upcomingEvents: number;
}

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscribers: 0,
    revenueThisMonth: 0,
    pendingVolunteers: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Call admin API
      const response = await fetch('http://localhost:3001/admin/stats', {
        headers: { 'admin-key': 'temp_admin_key' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for now
        setStats({
          totalUsers: 156,
          activeSubscribers: 89,
          revenueThisMonth: 445000, // ₦445,000
          pendingVolunteers: 12,
          upcomingEvents: 5,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>SlawsNigeria Management</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color={colors.info}
        />
        <StatCard
          title="Active Subscribers"
          value={stats.activeSubscribers.toLocaleString()}
          subtitle={`${((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)}% conversion`}
          color={colors.success}
        />
        <StatCard
          title="Revenue (This Month)"
          value={`₦${stats.revenueThisMonth.toLocaleString()}`}
          color={colors.secondary}
        />
        <StatCard
          title="Pending Volunteers"
          value={stats.pendingVolunteers.toLocaleString()}
          color={colors.warning}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents.toLocaleString()}
          color={colors.primary}
        />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Add New Product/Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Create New Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Review Volunteer Applications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Update Subscription Pricing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing['6'],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing['1'],
  },
  statsGrid: {
    padding: spacing['4'],
  },
  statCard: {
    backgroundColor: colors.white,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.gray900,
    marginTop: spacing['1'],
  },
  statSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
    marginTop: spacing['1'],
  },
  quickActions: {
    padding: spacing['4'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    marginBottom: spacing['3'],
  },
  actionButton: {
    backgroundColor: colors.white,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default DashboardScreen;
