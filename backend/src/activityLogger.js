const prisma = require('./prismaClient');

const logActivity = async (projectId, userId, content) => {
  try {
    await prisma.activity.create({
      data: {
        projectId,
        userId,
        content
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
