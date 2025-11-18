import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Permission from '../models/Permission.model';
import Role from '../models/Role.model';

// Get all permissions
export const getAllPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { search, module, isActive } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (module) {
      filter.module = module;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const permissions = await Permission.find(filter).sort({ module: 1, name: 1 });

    return res.json(permissions);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get permissions grouped by module
export const getPermissionsByModule = async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 });

    const grouped = permissions.reduce((acc: any, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});

    return res.json(grouped);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get permission by ID
export const getPermissionById = async (req: AuthRequest, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    return res.json(permission);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Create permission
export const createPermission = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, module } = req.body;

    // Check if permission code already exists
    const existingPermission = await Permission.findOne({ code: code.toUpperCase() });
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission code already exists' });
    }

    const permission = new Permission({
      name,
      code: code.toUpperCase(),
      description,
      module,
    });

    await permission.save();

    return res.status(201).json(permission);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Update permission
export const updatePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, module, isActive } = req.body;

    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    const oldData = permission.toObject();

    if (name) permission.name = name;
    if (description !== undefined) permission.description = description;
    if (module) permission.module = module;
    if (isActive !== undefined) permission.isActive = isActive;

    await permission.save();

    return res.json(permission);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete permission
export const deletePermission = async (req: AuthRequest, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Check if permission is assigned to any roles
    const rolesWithPermission = await Role.countDocuments({ permissions: permission._id });
    if (rolesWithPermission > 0) {
      return res.status(400).json({ 
        message: `Cannot delete permission. It is assigned to ${rolesWithPermission} role(s)` 
      });
    }

    await Permission.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Permission deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
