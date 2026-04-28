// Product Management Screen - AGENTS.md Section 12 P0
// Add, edit, remove products with publish scheduling

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, typography, spacing } from '../../app/theme/tokens';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  access_level: string;
  created_at: string;
  updated_at: string;
}

const ProductManagementScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'women_store',
    description: '',
    price: '',
    availability: 'in_stock',
    access_level: 'subscriber_only',
    schedulePublish: false,
    publishDate: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/products', {
        headers: { 'admin-key': 'temp_admin_key' }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        currency: 'NGN',
        media_urls: [],
        tags: [],
        publishAt: form.schedulePublish ? form.publishDate : null,
      };

      const url = editingId
        ? `http://localhost:3001/admin/products/${editingId}`
        : 'http://localhost:3001/admin/products';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'admin-key': 'temp_admin_key',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', editingId ? 'Product updated' : 'Product created');
        setShowForm(false);
        setEditingId(null);
        setForm({
          name: '',
          category: 'women_store',
          description: '',
          price: '',
          availability: 'in_stock',
          access_level: 'subscriber_only',
          schedulePublish: false,
          publishDate: '',
        });
        fetchProducts();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`http://localhost:3001/admin/products/${id}`, {
              method: 'DELETE',
              headers: { 'admin-key': 'temp_admin_key' },
            });
            fetchProducts();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={[styles.badge, item.availability === 'in_stock' ? styles.inStock : styles.outOfStock]}>
          <Text style={styles.badgeText}>{item.availability}</Text>
        </View>
      </View>
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productPrice}>₦{item.price.toLocaleString()} {item.currency}</Text>
      <Text style={styles.productAccess}>Access: {item.access_level}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setForm({
              name: item.name,
              category: item.category,
              description: item.description,
              price: item.price.toString(),
              availability: item.availability,
              access_level: item.access_level,
              schedulePublish: false,
              publishDate: '',
            });
            setEditingId(item.id);
            setShowForm(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Product' : 'New Product'}</Text>
          
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
            placeholder="Product name"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            {['women_store', 'event_service', 'mentorship', 'course', 'consulting'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.pickerOption, form.category === cat && styles.pickerSelected]}
                onPress={() => setForm(prev => ({ ...prev, category: cat }))}
              >
                <Text style={form.category === cat ? styles.pickerTextSelected : styles.pickerText}>
                  {cat.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            placeholder="Product description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Price (₦) *</Text>
          <TextInput
            style={styles.input}
            value={form.price}
            onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
            placeholder="0"
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Schedule Publishing</Text>
            <Switch
              value={form.schedulePublish}
              onValueChange={(val) => setForm(prev => ({ ...prev, schedulePublish: val }))}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>

          {form.schedulePublish && (
            <>
              <Text style={styles.label}>Publish Date</Text>
              <TextInput
                style={styles.input}
                value={form.publishDate}
                onChangeText={(text) => setForm(prev => ({ ...prev, publishDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </>
          )}

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>{editingId ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
  },
  addButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
  },
  form: {
    backgroundColor: colors.white,
    padding: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    maxHeight: 400,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    marginBottom: spacing['4'],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray700,
    marginBottom: spacing['1'],
  },
  input: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing['3'],
    marginBottom: spacing['3'],
    fontSize: typography.fontSize.base,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing['3'],
  },
  pickerOption: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginRight: spacing['2'],
    marginBottom: spacing['2'],
  },
  pickerSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
  },
  pickerTextSelected: {
    color: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing['4'],
  },
  cancelButton: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    marginRight: spacing['2'],
  },
  cancelButtonText: {
    color: colors.gray500,
    fontFamily: typography.fontFamily.medium,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
  },
  list: {
    padding: spacing['4'],
  },
  productCard: {
    backgroundColor: colors.white,
    padding: spacing['4'],
    borderRadius: borderRadius.md,
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['1'],
  },
  productName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray900,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
  },
  inStock: {
    backgroundColor: colors.success + '20',
  },
  outOfStock: {
    backgroundColor: colors.error + '20',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray700,
    textTransform: 'capitalize',
  },
  productCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: spacing['1'],
  },
  productPrice: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
    marginBottom: spacing['1'],
  },
  productAccess: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing['3'],
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
    marginRight: spacing['2'],
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
});

export default ProductManagementScreen;
