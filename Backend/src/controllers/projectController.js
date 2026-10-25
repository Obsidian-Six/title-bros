import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Get all projects
 * @route   GET /api/v1/projects
 * @access  Public
 */
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, projects, 'Projects retrieved successfully'));
});

/**
 * @desc    Get single project
 * @route   GET /api/v1/projects/:id
 * @access  Public
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, project, 'Project retrieved successfully'));
});

/**
 * @desc    Create new project
 * @route   POST /api/v1/projects
 * @access  Private (ADMIN)
 */
export const createProject = asyncHandler(async (req, res) => {
  let mediaUrl = req.body.mediaUrl;
  
  // If file uploaded via middleware
  if (req.file) {
    mediaUrl = `/uploads/projects/${req.file.filename}`;
  }

  if (!mediaUrl) {
    throw new ApiError(400, 'Media URL or file is required');
  }

  const project = await Project.create({
    ...req.body,
    mediaUrl,
    createdBy: req.user ? req.user._id : null,
  });

  res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
});

/**
 * @desc    Update project
 * @route   PUT /api/v1/projects/:id
 * @access  Private (ADMIN)
 */
export const updateProject = asyncHandler(async (req, res) => {
  let mediaUrl = req.body.mediaUrl;
  
  if (req.file) {
    mediaUrl = `/uploads/projects/${req.file.filename}`;
  }

  const updateData = { ...req.body };
  if (mediaUrl) updateData.mediaUrl = mediaUrl;

  const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, project, 'Project updated successfully'));
});

/**
 * @desc    Delete project
 * @route   DELETE /api/v1/projects/:id
 * @access  Private (ADMIN)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully'));
});
