// Products Screen - Service Discovery with Subscriber Gating
// AGENTS.md Section 9 (Access Control Rules)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
  currency?: string;
  availability: string;
  access_level: string;
  media_urls?: string;
  message?: string; // For gated content
  access_denied?: boolean;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // TODO: Get actual user ID from auth context
      const response = await fetch('http://localhost:3000/api/products', {
        headers: {
          'user-id': 'temp_user_id', // TODO: replace with actual user ID
        },
      });

      const data = await response.json();
      setProducts(data);
      
      // Check if any product has full access (not gated)
      const hasFullAccess = data.some((p: Product) => !p.access_denied);
      setIsSubscriber(hasFullAccess);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    // Navigate to subscription screen
    Alert.alert(
      'Subscribe Now',
      'Get full access to all products and services for as low as ₦2,500/month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Plans', onPress: () => console.log('Navigate to Subscription') },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    if (item.access_denied) {
      return (
        <View style={styles.gatedCard}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.gatedMessage}>{item.message}</Text>
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        {item.media_urls && (
          <Image
            source={{ uri: JSON.parse(item.media_urls)[0] }}
            style={styles.productImage}
          />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          {item.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.price !== undefined && (
            <Text style={styles.productPrice}>
              ₦{item.price?.toLocaleString()} {item.currency || 'NGN'}
            </Text>
          )}
          <View style={[styles.availabilityBadge, 
            item.availability === 'in_stock' ? styles.inStock : styles.outOfStock
          ]}>
            <Text style={styles.availabilityText}>{item.availability.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Women's Store</Text>
        <Text style={styles.headerSubtitle}>
          {isSubscriber ? 'Full access unlocked' : 'Subscribe to see pricing'}
        </Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing['1'],
  },
  listContent: {
    padding: spacing['4'],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing['4'],
    overflow: 'hidden',
    ...shadows.md,
  },
  gatedCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['6'],
    marginBottom: spacing['4'],
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.md,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: spacing['4'],
  },
  productName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    marginBottom: spacing['1'],
  },
  productCategory: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: spacing['2'],
  },
  productDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray700,
    marginBottom: spacing['2'],
  },
  productPrice: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
    marginBottom: spacing['2'],
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
  },
  inStock: {
    backgroundColor: colors.success + '20',
  },
  outOfStock: {
    backgroundColor: colors.error + '20',
  },
  availabilityText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray700,
    textTransform: 'capitalize',
  },
  gatedMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray700,
    marginVertical: spacing['4'],
    lineHeight: typography.lineHeight.relaxed,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing['4'],
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
});

export default ProductsScreen;
