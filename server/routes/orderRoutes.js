const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');

// Create a new order
router.post('/create', auth, async (req, res) => {
  try {
    const { courseId, paymentMethod } = req.body;

    // Check if user is a student
    if (req.user.accountType !== 'student') {
      return res.status(403).json({ message: 'Only students can create orders' });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is already enrolled
    const isEnrolled = await Order.findOne({
      student: req.user._id,
      course: courseId,
      status: 'active'
    });

    if (isEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create new order
    const order = new Order({
      student: req.user._id,
      course: courseId,
      amount: course.price,
      paymentMethod,
      transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment and complete order
router.post('/:orderId/complete', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway here
    const paymentSuccessful = true; // Placeholder for successful payment

    if (!paymentSuccessful) {
      return res.status(402).json({ message: 'Payment failed' });
    }

    // Update order status
    order.paymentStatus = 'completed';
    order.status = 'active';
    order.paymentDate = new Date();
    await order.save();

    // Enroll student in the course
    const user = await User.findById(req.user._id);
    if (user && user.accountType === 'student') {
      user.studentDetails.enrolledCourses.push({
        course: order.course,
        progress: 0,
        watchTime: 0,
        completedLectures: [],
        lastAccessed: new Date()
      });
      await user.save();
    }

    // Update course enrollment count
    const course = await Course.findById(order.course);
    if (course) {
      course.enrolledStudents.push({ student: req.user._id });
      course.totalStudents = (course.totalStudents || 0) + 1;
      await course.save();
    }

    res.json({
      message: 'Payment successful and enrollment completed',
      order
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('course', 'title price instructor')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('course', 'title price instructor')
      .populate('student', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 