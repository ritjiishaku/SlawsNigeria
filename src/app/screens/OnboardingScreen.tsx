// Onboarding Screen - NDPA 2023 Consent Flow
// AGENTS.md Sections 4 (Rule 4), 14 (NDPA Checklist)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface OnboardingData {
  full_name: string;
  phone: string; // +234XXXXXXXXXX format
  email: string;
  state: string; // Nigerian state
  gender: 'female' | 'male' | 'prefer_not_to_say';
  age_group: 'teen' | 'age_20_30' | 'age_31_45' | 'age_46_60' | 'age_61_70' | 'age_70_plus';
  role: 'customer' | 'entrepreneur' | 'parent' | 'teen' | 'volunteer';
}

const NIGERIAN_STATES = [
  'Lagos', 'Abuja FCT', 'Rivers', 'Kano', 'Oyo', 'Kaduna', 'Katsina',
  'Ogun', 'Anambra', 'Delta', 'Edo', 'Imo', 'Akwa Ibom', 'Ondo', 'Osun',
  'Kwara', 'Plateau', 'Nasarawa', 'Abia', 'Enugu', 'Bauchi', 'Ebonyi',
  'Gombe', 'Jigawa', 'Kebbi', 'Sokoto', 'Zamfara', 'Yobe', 'Adamawa',
  'Taraba', 'Benue', 'Kogi', 'Niger', 'Cross River', 'Bayelsa', 'Borno'
];

const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    phone: '',
    email: '',
    state: '',
    gender: 'female',
    age_group: 'age_20_30',
    role: 'customer',
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [ndpaAccepted, setNdpaAccepted] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // +234XXXXXXXXXX format (13 digits total)
    const regex = /^\+234\d{10}$/;
    return regex.test(phone);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!data.full_name || !data.phone) {
        Alert.alert('Error', 'Name and phone are required');
        return;
      }
      if (!validatePhoneNumber(data.phone)) {
        Alert.alert('Invalid Phone', 'Please use +234XXXXXXXXXX format');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!consentGiven || !ndpaAccepted) {
      Alert.alert(
        'NDPA 2023 Consent Required',
        'Under Nigeria\'s Data Protection Act 2023, we need your consent before storing your information.'
      );
      return;
    }

    try {
      // Call API to register user with NDPA consent (AGENTS.md Section 14)
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          consent_given: true,
          onboarding_stage: 'complete',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Registration complete! Welcome to SlawsNigeria.');
        // TODO: Navigate to ChatScreen
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to SlawsNigeria</Text>
        <Text style={styles.subtitle}>Let's get you started (Step {step} of 3)</Text>
      </View>

      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Personal Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={data.full_name}
            onChangeText={(text) => setData(prev => ({ ...prev, full_name: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone (+234XXXXXXXXXX) *"
            value={data.phone}
            onChangeText={(text) => setData(prev => ({ ...prev, phone: text }))}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email (optional)"
            value={data.email}
            onChangeText={(text) => setData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
          />
          
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Location & Profile</Text>
          
          <Text style={styles.label}>State (Nigerian State)</Text>
          <ScrollView horizontal style={styles.pickerContainer}>
            {NIGERIAN_STATES.map(state => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.stateOption,
                  data.state === state && styles.stateOptionSelected
                ]}
                onPress={() => setData(prev => ({ ...prev, state }))}
              >
                <Text style={[
                  styles.stateText,
                  data.state === state && styles.stateTextSelected
                ]}>
                  {state}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>NDPA 2023 Consent</Text>
          
          <Text style={styles.consentText}>
            Under Nigeria's Data Protection Act 2023, we need your consent before storing your information. 
            We collect only data necessary for our services. Your data will not be shared with other users.
          </Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>I consent to data processing (Required)</Text>
            <Switch
              value={consentGiven}
              onValueChange={setConsentGiven}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>I accept NDPA terms (Required)</Text>
            <Switch
              value={ndpaAccepted}
              onValueChange={setNdpaAccepted}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>
          
          <Text style={styles.contactText}>
            Data contact: Princess Ngozi Chinedu via WhatsApp (+23481058478551)
          </Text>
          
          <TouchableOpacity
            style={[styles.button, (!consentGiven || !ndpaAccepted) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!consentGiven || !ndpaAccepted}
          >
            <Text style={styles.buttonText}>Complete Registration</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing['2'],
  },
  stepContainer: {
    padding: spacing['6'],
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    marginBottom: spacing['4'],
  },
  input: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray700,
    marginBottom: spacing['2'],
  },
  pickerContainer: {
    marginBottom: spacing['4'],
  },
  stateOption: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginRight: spacing['2'],
  },
  stateOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
  },
  stateTextSelected: {
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing['4'],
    alignItems: 'center',
    marginTop: spacing['4'],
  },
  buttonDisabled: {
    backgroundColor: colors.gray300,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  consentText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing['4'],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  switchLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray900,
    flex: 1,
  },
  contactText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing['4'],
  },
});

export default OnboardingScreen;
