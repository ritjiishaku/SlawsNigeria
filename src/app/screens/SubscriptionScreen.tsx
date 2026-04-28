// Subscription Screen - Pricing Plans in ₦
// AGENTS.md Section 10 (Payment Flow)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: string;
  displayPrice: string;
}

const SubscriptionScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      amount: 2500,
      currency: 'NGN',
      billingCycle: 'monthly',
      displayPrice: '₦2,500',
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      amount: 6500,
      currency: 'NGN',
      billingCycle: 'quarterly',
      displayPrice: '₦6,500',
    },
    {
      id: 'annually',
      name: 'Annual Plan',
      amount: 22000,
      currency: 'NGN',
      billingCycle: 'annually',
      displayPrice: '₦22,000',
    },
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please select a subscription plan to continue.');
      return;
    }

    setLoading(true);

    try {
      // Initialize payment with Paystack (AGENTS.md Section 10)
      const response = await fetch('http://localhost:3000/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp_user_id', // TODO: get from auth context
          plan: selectedPlan,
          callbackUrl: 'http://localhost:3000/api/subscription/callback',
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        // Open Paystack checkout in browser
        // TODO: Use react-native-inappbrowser or similar
        console.log('Payment URL:', data.authorization_url);
        Alert.alert(
          'Payment Initiated',
          'Please complete payment in the browser. Reference: ' + data.reference,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to initialize payment.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>All prices in Nigerian Naira (₦)</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View style={styles.planHeader}>
              <Text style={[
                styles.planName,
                selectedPlan === plan.id && styles.planNameSelected,
              ]}>
                {plan.name}
              </Text>
              {selectedPlan === plan.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.planPrice}>{plan.displayPrice}</Text>
            <Text style={styles.planCycle}>per {plan.billingCycle}</Text>
            
            <View style={styles.planFeatures}>
              <Text style={styles.featureItem}>✓ Full access to all services</Text>
              <Text style={styles.featureItem}>✓ Event booking links</Text>
              <Text style={styles.featureItem}>✓ Mentorship content</Text>
              <Text style={styles.featureItem}>✓ Pricing visibility</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            (!selectedPlan || loading) && styles.subscribeButtonDisabled,
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeButtonText}>
              Subscribe Now - {plans.find(p => p.id === selectedPlan)?.displayPrice || ''}
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          Secure payment via Paystack. Auto-renewal enabled by default.
        </Text>
      </View>
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
    padding: spacing['6'],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing['1'],
  },
  plansContainer: {
    padding: spacing['4'],
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['6'],
    marginBottom: spacing['4'],
    borderWidth: 2,
    borderColor: colors.gray200,
    ...shadows.md,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  planName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
  },
  planNameSelected: {
    color: colors.primary,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  planPrice: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
    marginBottom: spacing['1'],
  },
  planCycle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
    marginBottom: spacing['4'],
  },
  planFeatures: {
    marginTop: spacing['4'],
  },
  featureItem: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray700,
    marginBottom: spacing['2'],
  },
  footer: {
    padding: spacing['6'],
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing['4'],
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  footerNote: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing['3'],
  },
});

export default SubscriptionScreen;
