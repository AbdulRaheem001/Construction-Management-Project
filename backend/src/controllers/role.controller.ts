import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Role from '../models/Role.model';
import User from '../models/User.model';

// Get all roles
export const getAllRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { search, isActive } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const roles = await Role.find(filter)
      .populate('permissions', 'name code module')
      .sort({ createdAt: -1 });

    return res.json(roles);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get role by ID
export const getRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.json(role);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Create role
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, permissions } = req.body;

    // Check if role code already exists
    const existingRole = await Role.findOne({ code: code.toUpperCase() });
    if (existingRole) {
      return res.status(400).json({ message: 'Role code already exists' });
    }

    const role = new Role({
      name,
      code: code.toUpperCase(),
      description,
      permissions: permissions || [],
      isSystem: false,
    });

    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');
    return res.status(201).json(populatedRole);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Update role
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, permissions, isActive } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent editing system roles' core properties
    if (role.isSystem && (req.body.code || req.body.isSystem === false)) {
      return res.status(403).json({ message: 'Cannot modify system role code or system status' });
    }

    const oldData = role.toObject();

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');
    return res.json(populatedRole);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete role
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({ message: 'Cannot delete system role' });
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ roles: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. It is assigned to ${usersWithRole} user(s)` 
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Assign permissions to role
export const assignPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { permissions } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const oldPermissions = [...role.permissions];
    role.permissions = permissions;
    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');
    return res.json(populatedRole);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
