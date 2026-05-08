const express = require('express');
const prisma = require('../prismaClient');
const { verifyToken, isAdmin, isMember } = require('../middleware/auth');
const { createTaskSchema, updateTaskSchema, validate } = require('../utils/validation');

const router = express.Router();

router.use(verifyToken);

// Create a task (Admin and Member can create)
router.post('/', validate(createTaskSchema), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Verify member permissions if not admin
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.teamMember.findFirst({
        where: { projectId, userId: req.user.id }
      });
      if (!isMember) return res.status(403).json({ error: 'Access denied' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks (Can be filtered by project)
router.get('/', isMember, async (req, res) => {
  try {
    const { projectId } = req.query;
    let whereClause = {};

    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    if (req.user.role !== 'ADMIN') {
      // Member can only see tasks in projects they are part of, or tasks assigned to them
      const userProjects = await prisma.teamMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true }
      });
      const projectIds = userProjects.map(up => up.projectId);
      
      if (projectId) {
         if (!projectIds.includes(parseInt(projectId))) {
            return res.status(403).json({ error: 'Access denied' });
         }
      } else {
         whereClause.projectId = { in: projectIds };
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { name: true, email: true } },
        project: { select: { name: true } }
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task (Member can update status, Admin can update anything)
router.put('/:id', isMember, validate(updateTaskSchema), async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updates = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN') {
      // Allow update if member is part of the project
      const isMember = await prisma.teamMember.findFirst({
        where: { projectId: existingTask.projectId, userId: req.user.id }
      });
      
      if (!isMember) {
         return res.status(403).json({ error: 'You are not a member of this project' });
      }
      
      // Restrict updates to only status for members
      const allowedUpdates = { status: updates.status };
      if (!updates.status) {
         return res.status(400).json({ error: 'Members can only update status' });
      }
      
      const task = await prisma.task.update({
        where: { id: taskId },
        data: allowedUpdates
      });
      return res.json(task);
    }

    // Admin updates
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: updates
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
