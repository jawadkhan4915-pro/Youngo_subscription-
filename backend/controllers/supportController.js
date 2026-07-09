import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middlewares/error.js';

// Create a new support ticket (User)
export const createTicket = asyncHandler(async (req, res, next) => {
  const { subject, category, priority, message } = req.body;

  if (!subject || !message) {
    res.status(400);
    throw new Error('Please fill out subject and message');
  }

  const ticket = await SupportTicket.create({
    user: req.user.id,
    subject,
    category,
    priority,
    messages: [
      {
        sender: req.user.id,
        message
      }
    ]
  });

  // Notify Admin
  await Notification.create({
    user: null,
    title: 'New Support Ticket Created',
    message: `User ${req.user.name} created ticket: ${subject}. Priority: ${priority}`,
    type: 'Support'
  });

  res.status(201).json({ success: true, data: ticket });
});

// Get logged-in user tickets
export const getMyTickets = asyncHandler(async (req, res, next) => {
  const tickets = await SupportTicket.find({ user: req.user.id }).sort('-updatedAt');
  res.status(200).json({ success: true, data: tickets });
});

// Get details of a single ticket
export const getTicketDetails = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('messages.sender', 'name avatar role')
    .populate('assignedTo', 'name');

  if (!ticket) {
    res.status(404);
    throw new Error('Support ticket not found');
  }

  // Ensure owner or admin
  if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  res.status(200).json({ success: true, data: ticket });
});

// Reply to a ticket (User or Admin)
export const replyTicket = asyncHandler(async (req, res, next) => {
  const { ticketId, message } = req.body;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    res.status(404);
    throw new Error('Support ticket not found');
  }

  // Ensure owner or admin
  if (ticket.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  // Add message
  ticket.messages.push({
    sender: req.user.id,
    message
  });

  // If Admin replied, set status to Replied. If User, set back to Open / In-Progress.
  if (req.user.role === 'Admin') {
    ticket.status = 'Replied';
    await ticket.save();

    // Notify User
    await Notification.create({
      user: ticket.user,
      title: 'Support Ticket Reply',
      message: `Admin replied to your ticket: "${ticket.subject}"`,
      type: 'Support'
    });
  } else {
    ticket.status = 'Open';
    await ticket.save();

    // Notify Admin
    await Notification.create({
      user: null,
      title: 'User Replied to Support Ticket',
      message: `User replied to ticket: "${ticket.subject}"`,
      type: 'Support'
    });
  }

  res.status(200).json({ success: true, data: ticket });
});

// Get all tickets (Admin)
export const getAllTickets = asyncHandler(async (req, res, next) => {
  const tickets = await SupportTicket.find()
    .populate('user', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: tickets.length, data: tickets });
});

// Assign ticket (Admin)
export const assignTicket = asyncHandler(async (req, res, next) => {
  const { ticketId, adminId } = req.body;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  ticket.assignedTo = adminId;
  ticket.status = 'In-Progress';
  await ticket.save();

  await AuditLog.create({
    admin: req.user.id,
    action: 'Assign_Ticket',
    details: `Assigned ticket ${ticket.ticketId} to admin ID ${adminId}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: ticket });
});

// Close ticket (Admin or User)
export const closeTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (ticket.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  ticket.status = 'Closed';
  await ticket.save();

  if (req.user.role === 'Admin') {
    await Notification.create({
      user: ticket.user,
      title: 'Support Ticket Closed',
      message: `Your ticket: "${ticket.subject}" has been marked as closed by the Admin.`,
      type: 'Support'
    });
  }

  res.status(200).json({ success: true, message: 'Ticket closed successfully', data: ticket });
});
