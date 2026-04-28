# SKILL: Component Builder

> Skill ID: component-builder
> Phase: P0
> Source: SNG-PRD-AI-001 v3.0 + design-system.md

---

## Purpose

This skill defines how to generate React Native UI components for the
SlawsNigeria mobile app. Every component generated must follow the design
system defined in `.agents/rules/design-system.md`.

---

## Inputs

When asked to build a component, the agent needs:
1. **Component name** — PascalCase (e.g. `SubscribeCard`, `EventTile`)
2. **Purpose** — what it renders and where it is used
3. **Props** — data the component receives
4. **Access tier** — does it behave differently for subscribers vs non-subscribers?

---

## Outputs

Each component generates:
- `src/app/components/<ComponentName>.tsx` — the component file
- `src/app/components/__tests__/<ComponentName>.test.tsx` — a basic render test

---

## Rules

1. **Functional components only.** No class components.
2. **TypeScript with explicit prop types.** Define a `Props` interface at the top of every file.
3. **Named exports only.** No default exports (except screen-level components).
4. **Use theme tokens.** Import from `src/app/theme/` — never hardcode hex values or pixel sizes.
5. **Access control UI.** If the component displays subscriber-gated content,
   use the `useSubscription()` hook to check status and render the lock overlay.
6. **Accessibility.** Every interactive element must have `accessibilityLabel`.
7. **Minimum tap target: 44×44 points.**

---

## Reusable Patterns

### Button Component

```tsx
// src/app/components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { colors } from '@/app/theme/colors';
import { spacing, radius } from '@/app/theme/spacing';
import { typography } from '@/app/theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.primary : colors.neutral}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: typography.bodyStrong.fontFamily,
    fontSize: 16,
  },
  primaryLabel: {
    color: colors.neutral,
  },
  secondaryLabel: {
    color: colors.neutral,
  },
  ghostLabel: {
    color: colors.primary,
  },
});
```

---

### Gated Content Overlay

Apply this pattern whenever rendering subscriber-only content.

```tsx
// src/app/components/GatedContent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useSubscription } from '@/app/hooks/useSubscription';
import { Button } from './Button';
import { colors } from '@/app/theme/colors';
import { spacing, radius } from '@/app/theme/spacing';
import { typography } from '@/app/theme/typography';

interface Props {
  children: React.ReactNode;
  onSubscribePress: () => void;
}

export function GatedContent({ children, onSubscribePress }: Props) {
  const { isSubscriber } = useSubscription();

  if (isSubscriber) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.blurOverlay} />
      <View style={styles.card}>
        <Text style={styles.heading}>Subscriber Content</Text>
        <Text style={styles.body}>
          This content is available to SlawsNigeria subscribers. It takes less
          than a minute to subscribe and unlock full access.
        </Text>
        <Button
          label="Subscribe Now"
          onPress={onSubscribePress}
          variant="primary"
          fullWidth
          accessibilityLabel="Subscribe to unlock this content"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,250,249,0.85)',
    zIndex: 1,
    borderRadius: radius.lg,
  },
  card: {
    position: 'absolute',
    zIndex: 2,
    left: spacing.md,
    right: spacing.md,
    top: '25%',
    backgroundColor: colors.neutral,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  heading: {
    fontFamily: typography.heading.fontFamily,
    fontSize: 18,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
```

---

### Chat Bubble

```tsx
// src/app/components/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/app/theme/colors';
import { spacing, radius } from '@/app/theme/spacing';
import { typography } from '@/app/theme/typography';

type Sender = 'user' | 'slaws';

interface Props {
  message: string;
  sender: Sender;
  timestamp?: string;
}

export function ChatBubble({ message, sender, timestamp }: Props) {
  const isUser = sender === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.slawsBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.slawsText]}>
          {message}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.slawsTimestamp]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    padding: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    borderBottomRightRadius: radius.sm,
  },
  slawsBubble: {
    backgroundColor: colors.neutral,
    borderRadius: radius.xl,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: typography.body.fontFamily,
  },
  userText: {
    color: '#FFFFFF',
  },
  slawsText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: spacing.xs,
    fontFamily: typography.caption.fontFamily,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  slawsTimestamp: {
    color: '#9CA3AF',
  },
});
```

---

### Price Display

Always use this component for monetary values. Never format inline.

```tsx
// src/app/components/PriceDisplay.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Decimal } from 'decimal.js';

import { colors } from '@/app/theme/colors';
import { typography } from '@/app/theme/typography';

interface Props {
  amount: number | Decimal;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function PriceDisplay({ amount, size = 'md', testID }: Props) {
  const num = amount instanceof Decimal ? amount.toNumber() : amount;
  const formatted = `₦${num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Text style={[styles.base, styles[size]]} testID={testID}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 20 },
});
```

---

## Generating New Components — Checklist

When generating any new component, verify:

- [ ] Props interface defined with explicit types
- [ ] Named export used
- [ ] All colours from `colors` theme token
- [ ] All spacing from `spacing` theme token
- [ ] All font styles from `typography` theme token
- [ ] `accessibilityLabel` on all interactive elements
- [ ] Tap targets ≥ 44×44 points
- [ ] Subscriber-gated content uses `GatedContent` wrapper
- [ ] Price values use `PriceDisplay` component
- [ ] Test file created at `__tests__/<ComponentName>.test.tsx`
