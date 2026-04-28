// Admin API Server - P0 Requirements (AGENTS.md Section 12)
// Manages products, events, volunteers, subscriptions

import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
const PORT = process.env.ADMIN_PORT || 3001;

app.use(express.json());

// Admin authentication middleware (TODO: implement proper auth)
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/admin/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'admin', timestamp: new Date().toISOString() });
});

// ==================== PRODUCT/SERVICE MANAGEMENT ====================

// Get all products
app.get('/admin/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const products = await prisma.productService.findMany({
      orderBy: { created_at: 'desc' }
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (with publish scheduling)
app.post('/admin/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      price,
      availability,
      access_level,
      media_urls,
      tags,
      publishAt // Optional: schedule publishing
    } = req.body;

    const product = await prisma.productService.create({
      data: {
        name,
        category,
        description,
        price,
        availability: publishAt ? 'coming_soon' : availability,
        access_level,
        media_urls: JSON.stringify(media_urls || []),
        tags: JSON.stringify(tags || []),
        created_at: publishAt ? new Date(publishAt) : new Date(),
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (price in ₦)
app.put('/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    // Ensure price stays in ₦ (NGN)
    if (updates.currency) {
      updates.currency = 'NGN';
    }

    const product = await prisma.productService.update({
      where: { id },
      data: updates
    });

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
app.delete('/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.productService.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== EVENT MANAGEMENT ====================

// Get all events
app.get('/admin/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event (all Event schema fields)
app.post('/admin/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      type,
      description,
      date,
      time,
      location,
      state,
      capacity,
      price,
      access_level,
      status,
      booking_link
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        type,
        description,
        date: new Date(date),
        time: new Date(time),
        location,
        state,
        capacity,
        price,
        access_level,
        status: status || 'upcoming',
        booking_link
      }
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== VOLUNTEER MANAGEMENT ====================

// Get all volunteer applications
app.get('/admin/volunteers', requireAdmin, async (req: Request, res: Response) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: { user: true },
      orderBy: { created_at: 'desc' }
    });
    return res.json(volunteers);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject volunteer
app.put('/admin/volunteers/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, agreement_signed } = req.body;

    const updateData: any = { status };
    
    if (status === 'active' && agreement_signed) {
      updateData.agreement_signed = true;
      updateData.onboarded_at = new Date();
    }

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: updateData,
      include: { user: true }
    });

    return res.json(volunteer);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SUBSCRIPTION MANAGEMENT ====================

// Get all subscription plans
app.get('/admin/subscriptions/plans', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Return configured plans with ₦ pricing
    const plans = [
      { id: 'monthly', name: 'Monthly', amount: 2500, currency: 'NGN', billingCycle: 'monthly' },
      { id: 'quarterly', name: 'Quarterly', amount: 6500, currency: 'NGN', billingCycle: 'quarterly' },
      { id: 'annually', name: 'Annual', amount: 22000, currency: 'NGN', billingCycle: 'annually' }
    ];
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subscription plan pricing (in ₦)
app.put('/admin/subscriptions/plans/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, currency } = req.body;

    // Ensure currency is always NGN
    if (req.body.currency && req.body.currency !== 'NGN') {
      return res.status(400).json({ error: 'Only NGN (₦) currency is supported' });
    }

    // TODO: Update plan in database or config
    return res.json({ success: true, planId: id, amount, currency: 'NGN' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start admin server
app.listen(PORT, () => {
  console.log(`SlawsNigeria Admin API running on port ${PORT}`);
});

export default app;
