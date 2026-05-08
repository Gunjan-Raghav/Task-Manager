const express = require('express');
const prisma = require('../prismaClient');
const { verifyToken, isAdmin, isMember } = require('../middleware/auth');
const { createProjectSchema, updateProjectSchema, addMemberSchema, validate } = require('../utils/validation');
const logActivity = require('../activityLogger');

const router = express.Router();

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

// Create a project (Admin only)
router.post('/', isAdmin, validate(createProjectSchema), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id
      }
    });

    // Add owner as a team member automatically
    await prisma.teamMember.create({
      data: {
        userId: req.user.id,
        projectId: project.id,
        role: 'ADMIN'
      }
    });

    await logActivity(project.id, req.user.id, `created the project "${project.name}"`);
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects (Member can see projects they are part of, Admin can see all)
router.get('/', isMember, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: { 
          owner: { select: { name: true, email: true } },
          _count: { 
            select: { 
              members: true, 
              tasks: true 
            } 
          },
          tasks: {
            where: { OR: [{ status: 'DONE' }, { status: 'COMPLETED' }] },
            select: { id: true }
          }
        }
      });
      // Flatten the tasks count
      projects = projects.map(p => ({ ...p, doneTasksCount: p.tasks.length }));
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId: req.user.id }
          }
        },
        include: { 
          owner: { select: { name: true, email: true } },
          _count: { 
            select: { 
              members: true, 
              tasks: true 
            } 
          },
          tasks: {
            where: { OR: [{ status: 'DONE' }, { status: 'COMPLETED' }] },
            select: { id: true }
          }
        }
      });
      // Flatten the tasks count
      projects = projects.map(p => ({ ...p, doneTasksCount: p.tasks.length }));
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific project by ID
router.get('/:id', isMember, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { name: true, email: true } },
        members: { include: { user: { select: { name: true, email: true } } } },
        tasks: true,
        activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check access
    if (req.user.role !== 'ADMIN') {
      const isPart = project.members.some(m => m.userId === req.user.id);
      if (!isPart) return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a member to a project (Admin only)
router.post('/:id/members', isAdmin, validate(addMemberSchema), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { email, role } = req.body;

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    const existingMember = await prisma.teamMember.findUnique({
      where: { userId_projectId: { userId: userToAdd.id, projectId } }
    });

    if (existingMember) return res.status(400).json({ error: 'User is already a member' });

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: userToAdd.id,
        projectId,
        role: role || 'MEMBER'
      }
    });

    await logActivity(projectId, req.user.id, `added ${userToAdd.name} to the team`);
    res.status(201).json(teamMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a project (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    await prisma.project.delete({ where: { id: projectId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project activity
router.get('/:id/activities', isMember, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
