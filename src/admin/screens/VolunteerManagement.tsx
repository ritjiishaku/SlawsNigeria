// Volunteer Management Screen - AGENTS.md Section 12 P0
// View and manage volunteer applications (approve / reject / track agreements)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../app/theme/tokens';

interface Volunteer {
  id: string;
  user_id: string;
  role: string;
  skills: string;
  availability: string;
  status: string;
  agreement_signed: boolean;
  onboarded_at: string | null;
  created_at: string;
  user: {
    full_name: string;
    phone: string;
    email: string;
  };
}

const VolunteerManagementScreen: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/volunteers', {
        headers: { 'admin-key': 'temp_admin_key' }
      });
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const agreement_signed = status === 'active';
      const response = await fetch(`http://localhost:3001/admin/volunteers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': 'temp_admin_key',
        },
        body: JSON.stringify({ status, agreement_signed }),
      });

      if (response.ok) {
        Alert.alert('Success', `Volunteer ${status}`);
        fetchVolunteers();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleApprove = (id: string) => {
    Alert.alert('Approve Volunteer', 'Are you sure you want to approve this volunteer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus(id, 'active') },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Volunteer', 'Are you sure you want to reject this application?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus(id, 'rejected') },
    ]);
  };

  const filteredVolunteers = filter === 'all'
    ? volunteers
    : volunteers.filter(v => v.status === filter);

  const renderVolunteer = ({ item }: { item: Volunteer }) => (
    <View style={styles.volunteerCard}>
      <View style={styles.volunteerHeader}>
        <Text style={styles.volunteerName}>{item.user.full_name}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Role:</Text>
        <Text style={styles.infoValue}>{item.role.replace('_', ' ')}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Contact:</Text>
        <Text style={styles.infoValue}>{item.user.phone}</Text>
      </View>

      {item.user.email && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.user.email}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Availability:</Text>
        <Text style={styles.infoValue}>{item.availability.replace('_', ' ')}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Skills:</Text>
        <Text style={styles.infoValue}>{JSON.parse(item.skills || '[]').join(', ')}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Agreement Signed:</Text>
        <Text style={[styles.infoValue, item.agreement_signed ? styles.signed : styles.notSigned]}>
          {item.agreement_signed ? 'Yes' : 'No'}
        </Text>
      </View>

      {item.status === 'applied' || item.status === 'under_review' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : item.status === 'active' ? (
        <Text style={styles.activeText}>
          ✓ Active since {item.onboarded_at ? new Date(item.onboarded_at).toLocaleDateString() : 'N/A'}
        </Text>
      ) : null}
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'under_review': return styles.statusReview;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusApplied;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Management</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'applied', 'under_review', 'active', 'rejected'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterSelected]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextSelected]}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredVolunteers}
        renderItem={renderVolunteer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing['4'],
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing['3'],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterButton: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
    marginRight: spacing['2'],
    backgroundColor: colors.gray100,
  },
  filterSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray600,
  },
  filterTextSelected: {
    color: colors.white,
  },
  list: {
    padding: spacing['4'],
  },
  volunteerCard: {
    backgroundColor: colors.white,
    padding: spacing['4'],
    borderRadius: borderRadius.md,
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  volunteerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  volunteerName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
  },
  statusApplied: {
    backgroundColor: colors.info + '20',
  },
  statusReview: {
    backgroundColor: colors.warning + '20',
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusRejected: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing['1'],
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray500,
    width: 120,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray900,
    flex: 1,
  },
  signed: {
    color: colors.success,
  },
  notSigned: {
    color: colors.error,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing['3'],
  },
  approveButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
    marginRight: spacing['2'],
  },
  approveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  rejectButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
  },
  rejectButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  activeText: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing['3'],
  },
});

export default VolunteerManagementScreen;
